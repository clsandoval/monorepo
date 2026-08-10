import { test, expect, type Page } from "@playwright/test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";

// M5 W-F E2E — ego graph on /supplier/[slug] + /entity/[slug]. The awards db is being
// backfilled LIVE, so every slug is picked AT RUNTIME from map_query.py — never hardcoded.
// We pick a supplier whose ego network has ≥3 nodes (the page's render threshold), then
// take one of its entity neighbours so the entity-page graph is guaranteed non-empty too.
const pexec = promisify(execFile);
// portable: playwright cwd is web/ — ../../ is the rfp root in both the
// monorepo (apps/rfp) and the standalone bidkita repo layout
const RFP_DIR = process.env.RFP_DIR ?? join(process.cwd(), "..", "..");

async function py(args: string[]): Promise<string> {
  const { stdout } = await pexec("python3", args, { cwd: RFP_DIR, timeout: 30_000, maxBuffer: 16 << 20 });
  return stdout.trim();
}
const mapQuery = async <T>(args: string[]): Promise<T> => JSON.parse((await py(["map_query.py", ...args])) || "null") as T;

// React-rendered HTML escapes text — match names against their escaped form.
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

// EVIDENCE-ONLY gate (ship-blocking): no accusation vocabulary anywhere in a rendered page.
const BANNED = /\b(shell compan\w*|dummy|rigged|wired|corrupt\w*)\b/i;

// Palette gate — same checker as map.spec/visual.spec: neutrals + blue family only.
async function assertGrayscale(page: Page) {
  const offenders = await page.evaluate(() => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 1;
    const ctx = cv.getContext("2d", { willReadFrequently: true })!;
    const seen = new Set<string>(); const bad: string[] = [];
    const toRgb = (c: string): [number, number, number, number] => {
      ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = "#000"; ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1); const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3]];
    };
    for (const el of Array.from(document.querySelectorAll("*")).slice(0, 4000)) {
      const s = getComputedStyle(el as Element);
      for (const prop of ["color", "backgroundColor", "borderColor"] as const) {
        const c = s[prop]; if (!c || seen.has(c)) continue; seen.add(c);
        const [r, g, b, a] = toRgb(c);
        if (a === 0) continue;
        const saturated = Math.max(r, g, b) - Math.min(r, g, b) > 10;
        const blueFamily = b > g && b - r > 10;
        if (saturated && !blueFamily) bad.push(`${prop}=${c} -> rgb(${r},${g},${b})`);
      }
    }
    // SVG stroke/fill use CSS vars resolved to the same tokens — computed color/border props above
    // canvas every element including the <svg> subtree, so graph strokes are covered too.
    return bad.slice(0, 10);
  });
  expect(offenders, `non-grayscale colors: ${offenders.join(", ")}`).toHaveLength(0);
}

type IndexRow = { winner_norm: string; winner: string; n: number; value: number };
type Ego = {
  center?: string;
  nodes?: { id: string; kind: "supplier" | "entity"; label: string; slug: string; value: number; n: number }[];
  links?: { a: string; b: string; value: number; n: number }[];
};

// data-id values are raw norms/agency strings — JSON.stringify double-quotes and escapes
// them into a valid CSS attribute-selector string.
const nodeById = (page: Page, id: string) =>
  page.locator(`[data-testid="ego-node"][data-id=${JSON.stringify(id)}]`);

// Runtime-picked fixtures (see beforeAll).
let supplierSlug: string; let supplierEgo: Ego;
let entityAgency: string; let entityEgo: Ego;

test.beforeAll(async () => {
  const index = await mapQuery<IndexRow[]>(["suppliers", "--min-awards", "2"]);
  expect(index.length, "awards db has multi-award suppliers").toBeGreaterThan(0);

  // a supplier whose ego clears the page's ≥3-node render threshold
  let picked: { slug: string; ego: Ego } | null = null;
  for (const r of index.slice(0, 12)) {
    const ego = await mapQuery<Ego>(["ego", "--norm", r.winner_norm]);
    if ((ego?.nodes?.length ?? 0) >= 3 && (ego?.links?.length ?? 0) >= 2) {
      picked = { slug: r.winner_norm, ego }; break;
    }
  }
  expect(picked, "no supplier yields an ego network with ≥3 nodes / ≥2 links").not.toBeNull();
  supplierSlug = picked!.slug;
  supplierEgo = picked!.ego;

  // an entity neighbour of that supplier whose own ego also clears the threshold
  let pickedEnt: { agency: string; ego: Ego } | null = null;
  const entityNodes = (supplierEgo.nodes ?? []).filter((d) => d.kind === "entity")
    .sort((a, b) => b.value - a.value);
  for (const e of entityNodes.slice(0, 8)) {
    const ego = await mapQuery<Ego>(["ego", "--agency", e.slug]);
    if ((ego?.nodes?.length ?? 0) >= 3 && (ego?.links?.length ?? 0) >= 2) {
      pickedEnt = { agency: e.slug, ego }; break;
    }
  }
  expect(pickedEnt, "no entity yields an ego network with ≥3 nodes / ≥2 links").not.toBeNull();
  entityAgency = pickedEnt!.agency;
  entityEgo = pickedEnt!.ego;
});

test("supplier page mounts the ego graph: svg with ≥3 nodes and ≥2 edges", async ({ page }) => {
  await page.goto(`/supplier/${encodeURIComponent(supplierSlug)}`);
  await expect(page.getByTestId("ego-graph")).toBeVisible();
  expect(await page.getByTestId("ego-node").count()).toBeGreaterThanOrEqual(3);
  expect(await page.getByTestId("ego-edge").count()).toBeGreaterThanOrEqual(2);
  // caption reads as the legend for the shapes actually drawn
  await expect(page.getByText("suppliers ○ · procuring entities □")).toBeVisible();
});

test("hovering a node shows the tooltip with a peso figure", async ({ page }) => {
  await page.goto(`/supplier/${encodeURIComponent(supplierSlug)}`);
  await expect(page.getByTestId("ego-graph")).toBeVisible();
  await nodeById(page, supplierEgo.center!).hover();
  const tip = page.getByTestId("ego-tooltip");
  await expect(tip).toBeVisible();
  await expect(tip).toContainText("₱");
  expect(await tip.textContent()).toMatch(/\d/);
});

test("clicking a neighbour entity node navigates to its /entity/ page", async ({ page }) => {
  await page.goto(`/supplier/${encodeURIComponent(supplierSlug)}`);
  await expect(page.getByTestId("ego-graph")).toBeVisible();
  // neighbours of a supplier center are always entities (bipartite contract)
  const neighbour = page.locator('[data-testid="ego-node"][data-id^="e:"]').first();
  await neighbour.click();
  await expect(page).toHaveURL(/\/entity\/.+/);
  await expect(page.getByTestId("entity-dossier")).toBeVisible();
});

test("palette gate with the graph mounted: neutrals + blue family only", async ({ page }) => {
  await page.goto(`/supplier/${encodeURIComponent(supplierSlug)}`);
  await expect(page.getByTestId("ego-graph")).toBeVisible();
  await assertGrayscale(page);
  // and again with the hover state lit (primary strokes + dimmed rest)
  await nodeById(page, supplierEgo.center!).hover();
  await expect(page.getByTestId("ego-tooltip")).toBeVisible();
  await assertGrayscale(page);
});

test("banned terms absent from rendered HTML of both graph pages", async ({ request }) => {
  for (const path of [
    `/supplier/${encodeURIComponent(supplierSlug)}`,
    `/entity/${encodeURIComponent(entityAgency)}`,
  ]) {
    const res = await request.get(path);
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(BANNED.test(html), `banned term on ${path}: ${html.match(BANNED)?.[0]}`).toBe(false);
  }
});

test("entity page renders the graph too, centered on the agency", async ({ page }) => {
  await page.goto(`/entity/${encodeURIComponent(entityAgency)}`);
  await expect(page.getByTestId("ego-graph")).toBeVisible();
  expect(await page.getByTestId("ego-node").count()).toBeGreaterThanOrEqual(3);
  expect(await page.getByTestId("ego-edge").count()).toBeGreaterThanOrEqual(2);
  // the graph is centered on this agency: its node id is present in the DOM
  await expect(nodeById(page, entityEgo.center!)).toBeVisible();
});

test("perf smoke: hover → tooltip visible well under the 1s cap (~<200ms)", async ({ page }) => {
  await page.goto(`/entity/${encodeURIComponent(entityAgency)}`);
  await expect(page.getByTestId("ego-graph")).toBeVisible();
  // warm-up hover: the first pointer event pays React's first hover-render; measure the second
  const node = page.locator('[data-testid="ego-node"][data-id^="s:"]').first();
  await node.hover();
  await expect(page.getByTestId("ego-tooltip")).toBeVisible({ timeout: 1000 });
  await page.mouse.move(0, 0); // leave → tooltip unmounts
  await expect(page.getByTestId("ego-tooltip")).toBeHidden();

  const t0 = Date.now();
  await node.hover();
  await expect(page.getByTestId("ego-tooltip")).toBeVisible({ timeout: 1000 });
  const elapsed = Date.now() - t0;
  expect(elapsed, `hover→tooltip took ${elapsed}ms`).toBeLessThan(200);
});

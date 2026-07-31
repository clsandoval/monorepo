/*
 * journey/actions.mjs — the closed set of things a step may do to a page.
 *
 * The set is deliberately tiny. A step record is DATA; if it could express
 * arbitrary code the registry would become a second, unreviewed test framework
 * and gate G16 could no longer check it by reading it.
 *
 * An unknown kind THROWS. Mirrors `journey/rubric.mjs`'s `RUBRIC INVALID:`
 * rejection, and for the same reason: silently skipping an unrecognised action
 * would screenshot a page that never received the interaction, and the rubric
 * would then blame the product for a harness defect.
 */

/** The four action kinds. Nothing else is executable. */
export const ACTION_KINDS = Object.freeze([
  'click',
  'fill',
  'waitForSelector',
  'waitForUrlContains',
]);

/** How long `waitForUrlContains` polls before giving up. */
const URL_WAIT_TIMEOUT_MS = 10000;
const URL_POLL_MS = 100;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Execute one action record against a page.
 *
 * @param {import('playwright').Page} page
 * @param {{kind: string, selector?: string, value?: string}} action
 * @returns {Promise<void>}
 */
export async function runAction(page, action) {
  const kind = action && action.kind;

  if (!ACTION_KINDS.includes(kind)) {
    throw new Error(`ACTION INVALID: unknown kind ${kind}`);
  }

  if (kind === 'click') {
    await page.click(action.selector);
    return;
  }

  if (kind === 'fill') {
    await page.fill(action.selector, action.value);
    return;
  }

  if (kind === 'waitForSelector') {
    await page.waitForSelector(action.selector);
    return;
  }

  // waitForUrlContains
  const deadline = Date.now() + URL_WAIT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (String(page.url()).includes(action.value)) return;
    await sleep(URL_POLL_MS);
  }
  throw new Error(`ACTION TIMEOUT: url never contained ${action.value}`);
}

// M5 "The Map" — typed access to map_query.py (supplier profiles, entity dossiers,
// supplier index). Same spawn pattern as corpus.ts: the python side opens both dbs
// file:...?mode=ro, so nothing here can ever touch the live backfill's write path.
// Slug convention (v0, no fuzzy matching): winner_norm IS the supplier slug and the
// corpus agency string IS the entity slug; callers URL-encode/decode.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";

const pexec = promisify(execFile);
const RFP_DIR = process.env.RFP_DIR ?? join(process.cwd(), "..", "..");

export interface SupplierWin {
  award_date_iso: string | null;
  title: string | null;
  contract_amount: number | null;
  abc: number | null;
  win_ratio: number | null;
  /** corpus agency when ref_id joins; else the buyer-side recording officer */
  buyer: string | null;
  /** "recorded_by" = created_by staff name, shown as "recorded by …", never as the office */
  buyer_kind: "agency" | "recorded_by" | null;
  classification: string | null;
  ref_id: string | null;
}

export interface CategoryCount { name: string; n: number; }
export interface SupplierBuyer { name: string; n: number; value: number; }

export interface SupplierProfile {
  winner: string;                 // display name: most common raw casing
  province: string | null;
  totals: {
    won_value: number;
    contracts: number;
    entities: number;
    median_win_ratio: number | null;
  };
  wins: SupplierWin[];            // newest-first, ≤50
  categories: CategoryCount[];
  entities: SupplierBuyer[];
}

export interface EntityWinner {
  winner_norm: string;
  winner: string;
  n: number;
  value: number;
  share: number;                  // of joined-award value; shares sum to ≤1
}

/** Market descriptor + its evidence. Vocabulary is locked to market language —
 *  signals describe the market around a buyer, never any party's integrity. */
export interface ContestabilitySignal { key: string; stat: string; evidence: string; }
export type MarketDescriptor = "concentrated" | "mixed" | "open";

export interface EntityOpenNotice {
  id: number;
  title: string | null;
  abc: number | null;
  closing_at: string | null;
  source: "legacy" | "mphilgeps";
}

export interface EntityContact { raw: string | null; email: string | null; phone: string | null; }

export interface EntityDossier {
  agency: string;
  province: string | null;
  spend_12mo: { value: number; contracts: number };
  award_count: number;            // ALL joined awards — the exact share-bar denominator
  winners: EntityWinner[];        // top 10 by joined-award value
  contestability: { signals: ContestabilitySignal[]; descriptor: MarketDescriptor };
  open_notices: EntityOpenNotice[]; // Active, not yet closed, ≤20, soonest first
  contact: EntityContact | null;
}

export interface SupplierIndexRow { winner_norm: string; winner: string; n: number; value: number; }

async function runMap<T>(args: string[]): Promise<T | null> {
  try {
    const { stdout } = await pexec("python3", ["map_query.py", ...args],
      { cwd: RFP_DIR, timeout: 15_000, maxBuffer: 8 << 20 });
    const trimmed = stdout.trim();
    return trimmed ? (JSON.parse(trimmed) as T) : null;
  } catch {
    return null;
  }
}

/** Supplier profile by winner_norm slug; null when unknown or the db is unavailable. */
export async function getSupplier(norm: string): Promise<SupplierProfile | null> {
  const d = await runMap<SupplierProfile>(["supplier", "--norm", norm]);
  return d?.winner ? d : null;
}

/** Entity dossier by corpus agency string; null when unknown or the db is unavailable. */
export async function getEntity(agency: string): Promise<EntityDossier | null> {
  const d = await runMap<EntityDossier>(["entity", "--agency", agency]);
  return d?.agency ? d : null;
}

/** Suppliers with ≥minAwards awards, by total value — internal linking/QA index. */
export async function getSupplierIndex(minAwards = 2): Promise<SupplierIndexRow[]> {
  return (await runMap<SupplierIndexRow[]>(["suppliers", "--min-awards", String(minAwards)])) ?? [];
}

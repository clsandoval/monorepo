// Display-only casing repair for SHOUTING source titles ("PROCUREMENT OF BICYCLES AND
// SAFETY GEAR"). Applied to project/notice titles only — never to supplier or agency
// names, whose casing is identity. Conservative: mixed-case strings pass through
// untouched; acronyms, ref codes, and roman numerals keep their caps.
const STOP = new Set(["of", "and", "the", "for", "to", "in", "at", "on", "by", "or", "with", "a", "an"]);
const ACRONYMS = new Set([
  "DPWH", "LGU", "DEO", "BIP", "CSSP", "SIPAG", "PHP", "BRGY", "STA", "STO", "JCT",
  "NIA", "DOH", "PNP", "AFP", "GAA", "RA", "IT", "ICT", "CCTV", "LPG", "VRF", "HVAC",
  "PCAB", "ABC", "BAC", "MOOE", "SDO", "OCM", "QCU", "CAO", "NGO", "PWD", "COA",
  "SBFP", "LDRRMF", "TFS", "GAD", "DRRM", "PPE", "ICU", "ER", "OPD", "BHS", "RHU",
]);

// Contact blobs repeat the separately-extracted phone/email inline — remove the
// duplicates from the prose so each fact renders exactly once.
export function stripExtracted(raw: string, ...parts: (string | null | undefined)[]): string {
  let out = raw;
  for (const p of parts) {
    if (!p) continue;
    const esc = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(esc, "gi"), "");
  }
  return out.replace(/\s{2,}/g, " ").replace(/\s+([,.;])/g, "$1").trim();
}

export function titleCaseIfShouty(s: string): string {
  const letters = s.replace(/[^A-Za-z]/g, "");
  if (!letters || letters.replace(/[^A-Z]/g, "").length / letters.length < 0.85) return s;
  // whitespace chunks, not \w runs: "OCM-LDRRMF(HEALTH)-26-MSLI-0954" and "FAÇADE"
  // must never be partially re-cased ("Ocm-ldrrmf(Health)…", "FaçAde")
  return s.split(/(\s+)/).map((chunk, i) => {
    if (/\s/.test(chunk) || chunk === "") return chunk;
    const ord = chunk.match(/^(\d+)(ST|ND|RD|TH)$/);        // 1ST → 1st
    if (ord) return ord[1] + ord[2].toLowerCase();
    // ref codes, mixed-symbol tokens, non-ASCII: verbatim — re-casing only mangles them
    if (/[\d()\/]|[^\x00-\x7F]/.test(chunk)) return chunk;
    const core = chunk.replace(/[^A-Za-z]/g, "").toUpperCase();
    if (ACRONYMS.has(core) || /^[IVXL]{2,4}$/.test(core)) return chunk;
    const lower = chunk.toLowerCase();
    if (i > 0 && STOP.has(lower.replace(/[^a-z]/g, ""))) return lower;
    return lower.replace(/[a-z]/, (c) => c.toUpperCase());
  }).join("");
}

/** Person names from buyer-side records arrive in mixed shouting ("NIDA Dollesin
 *  RELLAMA") — capitalize only the ALL-CAPS words, leave already-mixed ones alone. */
export function personCase(s: string): string {
  return s.split(/(\s+)/).map((w) =>
    /^[A-ZÑ'’.-]{2,}$/.test(w) ? w[0] + w.slice(1).toLowerCase() : w).join("");
}

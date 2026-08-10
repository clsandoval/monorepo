// Display-only casing repair for SHOUTING source titles ("PROCUREMENT OF BICYCLES AND
// SAFETY GEAR"). Applied to project/notice titles only — never to supplier or agency
// names, whose casing is identity. Conservative: mixed-case strings pass through
// untouched; acronyms, ref codes, and roman numerals keep their caps.
const STOP = new Set(["of", "and", "the", "for", "to", "in", "at", "on", "by", "or", "with", "a", "an"]);
const ACRONYMS = new Set([
  "DPWH", "LGU", "DEO", "BIP", "CSSP", "SIPAG", "PHP", "BRGY", "STA", "STO", "JCT",
  "NIA", "DOH", "PNP", "AFP", "GAA", "RA", "IT", "ICT", "CCTV", "LPG", "VRF", "HVAC",
  "PCAB", "ABC", "BAC", "MOOE", "SDO", "OCM", "QCU", "CAO", "NGO", "PWD", "COA",
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
  // hyphens stay inside the token so ref codes ("SDO-SEF-26-FIXTURES-0995") are
  // detected as digit-bearing and kept ALL-CAPS as one unit
  return s.toLowerCase().replace(/[a-z0-9][\w'’-]*/gi, (w, i) => {
    const up = w.toUpperCase();
    if (/\d/.test(w)) return up;                            // ref codes: 26DB0021, K0582
    if (ACRONYMS.has(up) || /^[IVXL]{2,4}$/.test(up)) return up;
    if (i > 0 && STOP.has(w)) return w;
    return w[0].toUpperCase() + w.slice(1);
  });
}

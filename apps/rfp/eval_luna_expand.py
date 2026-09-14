#!/usr/bin/env python3
"""Does LUNA produce the query expansions, or did a human who had read the answers?

The recall eval reports 0.91 for natural queries and 1.00 for `expanded` ones -- but those
expansions live in eval_gt_cavite.json, written by someone who had already read all 489 notices.
That is a leaked oracle: it measures the ceiling, not the product. In production the expansion is
written by gpt-5.6-luna, blind.

This asks Luna to expand the same five natural queries with NO sight of the ground truth, runs the
result through the real `rfp search`, and scores it against the same 91 labels. Costs ~5 calls.

    python3 eval_luna_expand.py            # expand, run, score
"""
import json, os, re, subprocess, sys, urllib.request
from pathlib import Path

HERE = Path(__file__).parent
GT = json.load(open(HERE / "eval_gt_cavite.json"))
MODEL = "gpt-5.6-luna"
IN_RATE, OUT_RATE, PHP = 0.20 / 1e6, 1.20 / 1e6, 58.0

# What a driving model would actually know: SKILL.md-level context about the corpus. NOT the
# ground truth, NOT the notice titles, NOT the words the government happened to use.
SYSTEM = """You turn a Philippine contractor's plain-language request into ONE SQLite FTS5 query.

Context you know about the corpus:
- 22,068 open government procurement notices. Searchable text is the notice title, its description
  and its line items. Titles are written by government procurement officers, not by bidders.
- Officers use official/formal vocabulary and often a different word than the trade does. They also
  write compound words inconsistently, and the index does NOT stem: "lights" will not match
  "lighting", and "streetlights" will not match "street lights".
- FTS5 treats bare space-separated words as AND, which is almost always too narrow here.

Return ONE FTS5 expression that maximises RECALL for the request: OR together the trade term, the
formal/official synonyms an officer would more plausibly type, singular and plural forms, both the
joined and split spellings of compounds, and closely related work the same firm could bid on.
Quote multi-word phrases. Do not use column filters, NEAR, or NOT.

Reply with json only: {"fts": "<the expression>"}"""


def expand(natural, label):
    body = json.dumps({
        "model": MODEL, "response_format": {"type": "json_object"},
        "messages": [{"role": "system", "content": SYSTEM},
                     {"role": "user", "content": json.dumps(
                         {"request": natural, "bidder_profile": label})}],
    }).encode()
    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions", data=body,
        headers={"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}",
                 "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=180) as r:
        d = json.load(r)
    return json.loads(d["choices"][0]["message"]["content"])["fts"], d["usage"]


def search_ids(q, results=40):
    """Run the real CLI, not an internal function -- this must measure what ships."""
    out = subprocess.run(
        [sys.executable, str(HERE / "rfp"), "search", q, "--province", "Cavite",
         "--results", str(results), "--include-closed"],
        capture_output=True, text=True, timeout=600)
    if out.returncode != 0:
        print("  rfp failed:", out.stderr.strip()[:200])
        return []
    return [int(m) for m in re.findall(r"^\[(\d+)\]", out.stdout, re.M)]


def main():
    tin = tout = 0
    rows, tot_hit, tot_gt = [], 0, 0
    for qid, q in GT["queries"].items():
        fts, usage = expand(q["natural"], q["label"])
        tin += usage["prompt_tokens"]; tout += usage["completion_tokens"]
        gt = set(q["gt"])
        got = set(search_ids(fts))
        hit = len(gt & got)
        tot_hit += hit; tot_gt += len(gt)
        rows.append(dict(qid=qid, natural=q["natural"], luna_fts=fts,
                         hit=hit, gt_n=len(gt), missed=sorted(gt - got)))
        print(f"{qid:<16} {hit:>2}/{len(gt)}  luna: {fts[:104]}")
    cost = tin * IN_RATE + tout * OUT_RATE
    print(f"\nLUNA-EXPANDED micro recall: {tot_hit}/{tot_gt} = {tot_hit/tot_gt:.2f}")
    print(f"  (human-expanded n=40: 84/91 = 0.92   natural, no expansion: 83/91 = 0.91)")
    print(f"  cost P{cost*PHP:.2f} for {len(rows)} expansions "
          f"({tin} in / {tout} out tokens)")
    json.dump(dict(micro=tot_hit / tot_gt, hit=tot_hit, gt=tot_gt,
                   php=cost * PHP, queries=rows),
              open(HERE / "eval_luna_expand.json", "w"), indent=1)


if __name__ == "__main__":
    main()

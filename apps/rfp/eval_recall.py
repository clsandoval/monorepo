#!/usr/bin/env python3
"""Recall of `rfp search` against a hand-read oracle, per the design doc's "Evaluation" section.

    python3 eval_recall.py selfcheck    # assert-based tests, no framework
    python3 eval_recall.py              # the matrix -> eval_results.json
    python3 eval_recall.py depth        # the top-N composition ablation -> eval_results_depth.json

WHY THIS EXISTS
    Approach A (whole corpus in an expensive model's context) survives only as an eval oracle on
    a slice -- locked decision S7.  Without it, search gets tuned by feel.  Recall is the metric,
    not precision: a bidder who sees one mediocre notice among four good ones is fine; one who
    never sees the P20M job they would have won is not.

THE SLICE
    Every notice whose `notice_location.location_norm = 'CAVITE'` -- 489 notices, 412 legacy +
    77 mPhilGEPS.  Deliberately defined by GEOGRAPHY ALONE, never by `work_type`.  A slice
    defined as `work_type='civil_works' AND province='CAVITE'` would make every tag error
    invisible: a notice the tagger got wrong would fall out of the slice instead of showing up
    as a miss, and the eval would then "prove" that tags help.

THE ORACLE
    `eval_gt_cavite.json`.  The whole slice was read by hand (title + category + line items +
    ABC + closing date) and, for five realistic contractor/supplier queries, every notice a
    competent bidder would want to see was written down.  91 labels over 5 queries.

WHAT IS MEASURED
    Only recall INSIDE the slice.  `--province Cavite` deliberately also returns notices with no
    stated location, from anywhere in the country; those are ignored when scoring rather than
    counted as false positives, because this measures "did the tool find the Cavite notices",
    not "was every row useful".  `depth` mode measures what those out-of-province rows cost.

TWO QUERY FORMS PER QUESTION, because they measure different things:
    natural   what a user actually types ("vehicle spare parts repair").  FTS5 reads a bare
              multi-word string as an implicit AND, so this is also a test of whether the tool
              rescues a query that ANDs itself down to zero rows.
    expanded  what SKILL.md tells the driving model to write (an explicit OR of variants).
              This is the retrieval ceiling.
"""
import json
import sqlite3
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
RFP = HERE / "rfp"
CORPUS = HERE / "corpus.db"
GT = json.loads((HERE / "eval_gt_cavite.json").read_text())

# name,                  extra flags,                                           results
CONFIGS = [
    ("profile_n3",       [],                                                    3),
    ("profile_n40",      [],                                                    40),
    ("profile_n200",     [],                                                    200),
    ("noprofile_n200",   ["--no-profile"],                                      200),
    ("fts_only_n200",    ["--no-profile", "--no-doc-text", "--no-tag-text"],    200),
    ("fts_plus_tags_n200", ["--no-profile", "--no-doc-text"],                   200),
    ("fts_plus_docs_n200", ["--no-profile", "--no-tag-text"],                   200),
]

DEPTH_CONFIGS = [
    ("profile_n40",           []),
    ("noprofile_n40",         ["--no-profile"]),
    ("profile_strict_n40",    ["--province-strict"]),
    ("noprofile_strict_n40",  ["--no-profile", "--province-strict"]),
]


def slice_ids():
    con = sqlite3.connect(f"file:{CORPUS}?mode=ro", uri=True)
    rows = con.execute(
        "select distinct c.id from corpus c join notice_location nl on nl.nid = c.nid "
        "where nl.location_norm = ?", (GT["slice"]["province"],)).fetchall()
    con.close()
    return {r[0] for r in rows}


def run(query, extra, n, pool=8000):
    cmd = [str(RFP), "search", query, "--province", "Cavite", "--json",
           "-n", str(n), "--pool", str(pool)] + extra
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=900)
    if p.returncode != 0:
        raise RuntimeError(f"{' '.join(cmd)}\nrc={p.returncode}\n{p.stderr[-2000:]}")
    return json.loads(p.stdout)


def ranked_slice_ids(d, sl):
    """Ids the tool returned, in rank order, restricted to the slice and de-duplicated."""
    out, seen = [], set()
    for h in d["hits"]:
        i = h["id"]
        if i in sl and i not in seen:
            seen.add(i)
            out.append(i)
    return out


def matrix():
    sl = slice_ids()
    assert len(sl) == GT["slice"]["n"], (len(sl), GT["slice"]["n"])
    res = {"slice_n": len(sl), "queries": {}}
    for qname, q in GT["queries"].items():
        gt = set(q["gt"])
        assert gt <= sl, f"{qname}: ground-truth ids outside the slice: {sorted(gt - sl)}"
        res["queries"][qname] = {"gt_n": len(gt), "runs": {}}
        for form in ("natural", "expanded"):
            for cname, extra, n in CONFIGS:
                d = run(q[form], extra, n)
                ids = ranked_slice_ids(d, sl)
                found = [i for i in ids if i in gt]
                res["queries"][qname]["runs"][f"{form}/{cname}"] = {
                    "query": q[form],
                    "candidates_all": d["candidates"], "returned_all": d["returned"],
                    "returned_in_slice": len(ids), "hit": len(found),
                    "recall": round(len(found) / len(gt), 3),
                    "missed": sorted(gt - set(ids)),
                    "ranks": {str(i): ids.index(i) + 1 for i in found},
                    "notes": d["notes"],
                }
                print(f"{qname:16s} {form}/{cname:22s} recall {len(found):2d}/{len(gt)} "
                      f"= {len(found)/len(gt):.2f}")
    (HERE / "eval_results.json").write_text(json.dumps(res, indent=1))
    print("wrote eval_results.json")


def depth():
    """How much of the top-40 do out-of-province rows eat?

    `--province Cavite` keeps notices with NO stated location on purpose (12.2% of mPhilGEPS is
    genuinely blank, and dropping them is the omission bug).  But they then compete for the same
    forty slots at fit 0.85, and BM25 does not know they are in the wrong province.  This run
    prices that decision in recall points."""
    sl = slice_ids()
    con = sqlite3.connect(f"file:{CORPUS}?mode=ro", uri=True)
    out = {}
    for qname, q in GT["queries"].items():
        gt = set(q["gt"])
        out[qname] = {}
        for cname, extra in DEPTH_CONFIGS:
            d = run(q["expanded"], extra, 40)
            ids = [h["id"] for h in d["hits"]]
            outside = [i for i in ids if i not in sl]
            nullloc = sum(1 for i in outside
                          if not (con.execute("select location from corpus where id=?",
                                              (i,)).fetchone() or [None])[0])
            out[qname][cname] = {
                "returned": len(ids), "in_slice": len(ids) - len(outside),
                "out_of_slice": len(outside), "out_null_location": nullloc,
                "hit": len(gt & set(ids)), "recall": round(len(gt & set(ids)) / len(gt), 3),
            }
            print(f"{qname:16s} {cname:22s} recall {out[qname][cname]['recall']:.2f}  "
                  f"in-slice {len(ids)-len(outside):2d}/{len(ids):2d}  "
                  f"out-of-slice {len(outside):2d} (null-location {nullloc})")
    (HERE / "eval_results_depth.json").write_text(json.dumps(out, indent=1))
    print("wrote eval_results_depth.json")


def selfcheck():
    ok = []

    # 1. The slice is the size the oracle was read against.  If corpus.db is rebuilt and this
    #    changes, every recall number below is stale and must be re-run, not reinterpreted.
    sl = slice_ids()
    assert len(sl) == GT["slice"]["n"] == 489, (len(sl), GT["slice"]["n"])
    ok.append(f"slice = {len(sl)} notices")

    # 2. Every ground-truth id is a real notice AND inside the slice.  A label outside the slice
    #    would be unreachable by any --province Cavite run and would depress recall forever.
    con = sqlite3.connect(f"file:{CORPUS}?mode=ro", uri=True)
    n = 0
    for qname, q in GT["queries"].items():
        gt = q["gt"]
        assert len(gt) == len(set(gt)), f"{qname}: duplicate ids in ground truth"
        assert set(gt) <= sl, f"{qname}: ids outside slice: {sorted(set(gt) - sl)}"
        for i in gt:
            assert con.execute("select 1 from corpus where id=?", (i,)).fetchone(), (qname, i)
        n += len(gt)
    ok.append(f"{n} ground-truth labels over {len(GT['queries'])} queries, all resolvable")

    # 3. ranked_slice_ids keeps rank order, drops out-of-slice, de-duplicates.  Without the
    #    de-dup a notice returned twice would count twice and inflate recall past 1.0.
    d = {"hits": [{"id": 1}, {"id": 999}, {"id": 2}, {"id": 1}]}
    assert ranked_slice_ids(d, {1, 2}) == [1, 2]
    assert ranked_slice_ids({"hits": []}, {1}) == []
    ok.append("ranked_slice_ids: order kept, out-of-slice dropped, dupes collapsed")

    # 4. Recall is a set intersection over the WHOLE returned list, not rank-sensitive.  Stated
    #    as a test so nobody quietly turns it into recall@k without noticing.
    gt, ids = {1, 2, 3}, [3, 9, 1]
    assert len(gt & set(ids)) / len(gt) == 2 / 3
    ok.append("recall = |gt & returned| / |gt|")

    # 5. The tool runs and emits the JSON shape this harness reads.
    d = run("cctv", [], 5, pool=600)
    for k in ("candidates", "returned", "notes", "hits"):
        assert k in d, k
    assert all("id" in h for h in d["hits"]), d["hits"][:1]
    ok.append("rfp search --json shape ok")

    # 6. The finding this eval turns on: FTS5 reads a bare multi-word query as an implicit AND,
    #    and `relax()` only fires on a SYNTAX error, so a valid query that ANDs itself down to
    #    zero rows stays at zero.  Pinned here so a fix flips this assertion instead of silently
    #    invalidating the recall numbers in NOTES-eval.md.
    fts = sqlite3.connect(f"file:{CORPUS}?mode=ro", uri=True)
    ids_sl = ",".join(str(i) for i in sl)
    def hits(m):
        return fts.execute(
            f"select count(*) from corpus_fts f join corpus c on c.nid = f.rowid "
            f"where corpus_fts match ? and c.id in ({ids_sl})", (m,)).fetchone()[0]
    assert hits("vehicle spare parts repair") == 0, "implicit-AND query no longer returns zero"
    assert hits("vehicle") >= 40, hits("vehicle")
    assert hits("solar streetlights") < hits('streetlight OR "street light"'), \
        "the streetlight/street-light orthography split closed"
    ok.append("implicit-AND and orthography-split traps still present")

    for line in ok:
        print("ok:", line)


if __name__ == "__main__":
    arg = sys.argv[1] if len(sys.argv) > 1 else ""
    if arg in ("selfcheck", "test"):
        selfcheck()
    elif arg == "depth":
        depth()
    else:
        matrix()

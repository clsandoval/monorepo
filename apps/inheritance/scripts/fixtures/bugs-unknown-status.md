# Known Bugs — FIXTURE

This file is a fixture for `scripts/check-bugs-ledger.mjs`. It is not a real bug ledger, it states
no law, and nothing reads it except that check's failure-path proof.

## BUG-901: A fixture entry that is open

**Severity:** Low
**Status:** Fixed
**Found:** 2026-07-31
**Location:** engine/src/fixture.rs:1

### Description

Fixture text.

### Reproduction

```json
{"fixture": true}
```

### Expected

Quoted from .planning/research/LEGAL-CONFORMANCE.md section 2a, fixture row:

> Fixture quotation.

### Actual

- f1 = 1

### Owning requirement

None — fixture.

## BUG-902: A fixture entry that is closed

**Severity:** Low
**Status:** Closed — does not reproduce
**Found:** 2026-07-31
**Closed:** 2026-07-31
**Location:** engine/src/fixture.rs:2

### Description

Fixture text.

### Reproduction

```json
{"fixture": true}
```

### Actual

- f1 = 1

### Why it was closed

Fixture reason.

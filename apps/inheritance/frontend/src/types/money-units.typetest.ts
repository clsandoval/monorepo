/**
 * The negative type test for the peso/centavo separation.
 *
 * A ts-expect-error directive is itself a compile error (TS2578, "Unused
 * ts-expect-error directive") when the line below it *succeeds*. So a green
 * `npx tsc -b --force` is the proof: it says all four of the assignments below are
 * still rejected.
 *
 * Removing the flavour from `money-units.ts` — i.e. changing `Flavor<T, F>` to plain
 * `T` — makes this file emit exactly four `TS2578` errors. That was measured against
 * this repository's own TypeScript 5.9.3 before the plan was written, and again
 * during execution; it is recorded in `09-RESEARCH.md` §4.2.
 *
 * The file is named `.typetest.ts` and not `.test.ts` on purpose: `frontend/tsconfig.json`
 * excludes `src/**\/*.test.ts` and `src/**\/__tests__/**`, so a proof placed there would
 * never be compiled and would prove nothing.
 */

import {
  pesosToCentavos,
  centavosToPesos,
  type Pesos,
  type Centavos,
} from './money-units';

declare const plain: number;

// ── Positive: these must keep compiling, or the change churns fixtures ──────

const literalPesos: Pesos = 0;
const literalCentavos: Centavos = 100;
const plainNumberAsCentavos: Centavos = plain;
const literalArgument = pesosToCentavos(250);

// ── Negative: these must NOT compile ───────────────────────────────────────

declare const somePesos: Pesos;
declare const someCentavos: Centavos;

// @ts-expect-error a peso amount is not a centavo amount and must not be assignable to one
const pesosIntoCentavos: Centavos = somePesos;

// @ts-expect-error a centavo amount is not a peso amount and must not be assignable to one
const centavosIntoPesos: Pesos = someCentavos;

// @ts-expect-error pesosToCentavos takes pesos; passing centavos would multiply by 100 twice
const doubledByMistake = pesosToCentavos(someCentavos);

// @ts-expect-error centavosToPesos takes centavos; passing pesos would divide by 100 once too often
const halvedByMistake = centavosToPesos(somePesos);

void literalPesos;
void literalCentavos;
void plainNumberAsCentavos;
void literalArgument;
void pesosIntoCentavos;
void centavosIntoPesos;
void doubledByMistake;
void halvedByMistake;

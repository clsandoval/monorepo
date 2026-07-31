/**
 * Peso and centavo units, separated at the type level.
 *
 * This module is the single implementation of peso↔centavo conversion in the
 * frontend. `types/index.ts` re-exports these functions rather than declaring its
 * own, so there is exactly one place where a factor of 100 is applied.
 *
 * The brand property is deliberately **optional** (`__unit?`). That is what lets a
 * numeric literal and a plain `number` stay assignable to both units, so no fixture,
 * no test and no existing `{ centavos: 0 }` literal in the tree had to change — while
 * `Pesos` and `Centavos` remain mutually unassignable, because `__unit?: 'pesos'` and
 * `__unit?: 'centavos'` conflict.
 *
 * `asCentavos` and `asPesos` exist so that every deliberate widening from a bare
 * `number` into a unit is greppable in one place, instead of being scattered through
 * the codebase as inline `as Centavos` casts.
 *
 * `money-units.typetest.ts` is what proves the separation is real: it holds four
 * ts-expect-error assertions that become build errors the moment the units merge.
 */

type Flavor<T, F extends string> = T & { readonly __unit?: F };

/** An amount in pesos. */
export type Pesos = Flavor<number, 'pesos'>;

/** An amount in centavos — the unit the engine and the database store. */
export type Centavos = Flavor<number, 'centavos'>;

/** Convert pesos to centavos. */
export function pesosToCentavos(pesos: Pesos): Centavos {
  return Math.round(pesos * 100) as Centavos;
}

/** Convert centavos to pesos. Accepts the string form used for very large values. */
export function centavosToPesos(centavos: Centavos | string): Pesos {
  const c = typeof centavos === 'string' ? Number(centavos) : centavos;
  return (c / 100) as Pesos;
}

/** The one explicit widening point from a bare `number` into `Centavos`. */
export function asCentavos(n: number): Centavos {
  return n as Centavos;
}

/** The one explicit widening point from a bare `number` into `Pesos`. */
export function asPesos(n: number): Pesos {
  return n as Pesos;
}

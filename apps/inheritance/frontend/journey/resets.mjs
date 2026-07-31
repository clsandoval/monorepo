/*
 * journey/resets.mjs — the named database resets a step may request.
 *
 * A step that mutates the database (creating an organization, accepting an
 * invitation) is only repeatable if the mutation is undone. Doing that undo
 * inside the step record would make the registry executable; naming it here keeps
 * the registry data and keeps the SQL in one reviewable place.
 *
 * `run.mjs` THROWS on a reset name that is not a key of RESETS. A silently-ignored
 * reset would leave the previous run's rows in place and the next run would fail
 * for a reason that looks like a product defect.
 *
 * This plan (11-03) defines exactly one entry, `noop`. Plan 11-06 adds the two
 * organization resets that its five org steps need.
 */

/**
 * Reset name -> async (admin: SupabaseClient) => void
 * @type {Readonly<Record<string, (admin: import('@supabase/supabase-js').SupabaseClient) => Promise<void>>>}
 */
export const RESETS = Object.freeze({
  /** Changes nothing. The explicit "this step mutates nothing" declaration. */
  // eslint-disable-next-line no-unused-vars
  noop: async (admin) => {},
});

/** The reset names a step record may name, for registry validation. */
export const RESET_NAMES = Object.freeze(Object.keys(RESETS));

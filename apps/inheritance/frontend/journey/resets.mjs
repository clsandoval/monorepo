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

import { readFixtures } from './seed.mjs';

/*
 * A RESET ONLY DELETES OR REVERTS ROWS REACHABLE FROM fixtures.json. It never
 * truncates a table and never touches a row it did not create — the same rule
 * frontend/supabase/seed.sql already follows, so running a gate can never
 * destroy a developer's own local data.
 *
 * `orphan-no-org` deletes organizations BY EXCLUSION rather than by id, because
 * the onboarding step creates one whose id the runner did not choose and cannot
 * know. Excluding the two seeded org ids is what keeps that delete from reaching
 * anything else while still converging to the seeded state.
 *
 * Every id below is read through readFixtures(); no uuid is written literally.
 */

/**
 * Reset name -> async (admin: SupabaseClient) => void
 * @type {Readonly<Record<string, (admin: import('@supabase/supabase-js').SupabaseClient) => Promise<void>>>}
 */
export const RESETS = Object.freeze({
  /** Changes nothing. The explicit "this step mutates nothing" declaration. */
  // eslint-disable-next-line no-unused-vars
  noop: async (admin) => {},

  /**
   * Return the Orphan user to belonging to NO organization, and remove any
   * organization the onboarding journey created.
   */
  'orphan-no-org': async (admin) => {
    const fixtures = readFixtures();
    await admin
      .from('organization_members')
      .delete()
      .eq('user_id', fixtures.orphan.user_id);
    await admin
      .from('organizations')
      .delete()
      .not('id', 'in', `(${fixtures.orgs.alpha.org_id},${fixtures.orgs.beta.org_id})`);
  },

  /**
   * Everything `orphan-no-org` does, plus returning the seeded invitation to
   * `pending` so the acceptance journey can be driven again.
   */
  'orphan-invitation-pending': async (admin) => {
    await RESETS['orphan-no-org'](admin);
    const fixtures = readFixtures();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await admin
      .from('organization_invitations')
      .update({ status: 'pending', accepted_at: null, expires_at: expires })
      .eq('id', fixtures.orphan.invitation_id);
  },
});

/** The reset names a step record may name, for registry validation. */
export const RESET_NAMES = Object.freeze(Object.keys(RESETS));

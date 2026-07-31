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
import { computeEngineOutput } from './engine.mjs';

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
 * `case-alpha-no-output` and `case-alpha-computed` put the single seeded Alpha
 * case into, respectively, the wizard state a results step must start from and
 * the computed state the share-populated step must render. The computed one asks
 * the compiled engine at run time through engine.mjs rather than storing a peso
 * figure: scripts/check-seed-fixture.mjs rejects a seeded output_json with
 * `SEED WRITES OUTPUT`, so no engine result is ever committed as SQL.
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

  /**
   * Return the Alpha case to the state a lawyer is in before pressing Compute:
   * input present, no engine result. A results step must start here, or run two
   * would assert against run one's leftover output instead of a fresh one.
   *
   * decedent_name and date_of_death are nulled alongside output_json because
   * seed.sql inserts the case WITHOUT them, while merely OPENING the wizard on
   * this case fills them in: useAutoSave debounces at 1.5s and calls
   * updateCaseInput (lib/cases.ts:53), which writes input_json, decedent_name
   * AND date_of_death. That is enough time to elapse inside a 1200ms settle plus
   * a full-page screenshot. The visible consequence is on the dashboard, where
   * CaseCard.tsx:29 renders `decedent_name ?? title`: one wizard screenshot run
   * silently rewrites every later run's dashboard from "Seeded Case Alpha" to
   * "Pedro". It was caught by auth-session-persisted, a Phase 11 step, going red.
   *
   * status is restored to 'draft' for the same class of reason: the results steps
   * press Compute for real, and updateCaseOutput (lib/cases.ts:21,81) sets
   * status 'computed'. The dashboard card renders that word, so without this the
   * same Phase 11 step went red a second time at diffPixels=196.
   *
   * THE RULE THIS ENCODES: a reset must restore every column any step can write,
   * not merely the one its name mentions. Each of these three was found by a
   * previously-green gate turning red, never by reading the schema.
   */
  'case-alpha-no-output': async (admin) => {
    const caseId = readFixtures().orgs.alpha.case_id;
    const { error } = await admin
      .from('cases')
      .update({
        output_json: null,
        decedent_name: null,
        date_of_death: null,
        status: 'draft',
      })
      .eq('id', caseId);
    // Throw rather than swallow: a failed reset must surface as STEP ERROR, not
    // as a rubric failure that looks like a product defect.
    if (error) {
      throw new Error(`RESET FAILED case-alpha-no-output: ${error.message}`);
    }
  },

  /**
   * Drive the Alpha case to a computed state by running the real engine on its
   * own committed input_json. The share-populated step needs a computed case and
   * has no browser in which to press Compute.
   */
  'case-alpha-computed': async (admin) => {
    const caseId = readFixtures().orgs.alpha.case_id;
    const { data, error: selectError } = await admin
      .from('cases')
      .select('input_json')
      .eq('id', caseId)
      .single();
    if (selectError) {
      throw new Error(`RESET FAILED case-alpha-computed (select): ${selectError.message}`);
    }
    if (!data || data.input_json == null) {
      throw new Error(
        `RESET FAILED case-alpha-computed: case ${caseId} has a null input_json, so there is nothing to compute`,
      );
    }
    const output = await computeEngineOutput(data.input_json);
    const { error: updateError } = await admin
      .from('cases')
      .update({ output_json: output })
      .eq('id', caseId);
    if (updateError) {
      throw new Error(`RESET FAILED case-alpha-computed (update): ${updateError.message}`);
    }
  },
});

/** The reset names a step record may name, for registry validation. */
export const RESET_NAMES = Object.freeze(Object.keys(RESETS));

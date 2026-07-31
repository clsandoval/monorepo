-- seed.sql — the known two-tenant fixture every later gate references by id.
--
-- Applied automatically by `supabase db reset`: frontend/supabase/config.toml
-- already declares [db.seed] enabled = true with sql_paths = ["./seed.sql"], so
-- this file needs no further wiring.
--
-- EVERY ID HERE IS PUBLISHED IN frontend/supabase/fixtures.json. The two files
-- must be changed together; node scripts/check-seed-fixture.mjs fails the build
-- when a uuid appears in one and not the other, in either direction.
--
-- Org Beta exists so a tenant-isolation test has a second tenant to be excluded
-- from. ROADMAP Phase 11 requires proving a user in org A cannot read, write or
-- enumerate org B's cases, PDFs or shared links, and one org cannot express that.
--
-- THE CASE input_json IS A VERBATIM COPY of engine/examples/cases/02-married-3lc.json,
-- a committed engine fixture already exercised by the engine's own test suite.
-- DO NOT EDIT IT. Choosing a family structure is choosing which succession rules
-- the fixture exercises, which is the beginning of a legal judgment that no agent
-- on this project may make. Copying removes that risk entirely, and
-- check-seed-fixture.mjs enforces the copy byte-for-byte.
--
-- No engine result is seeded. A stored per-heir peso figure that nothing computed
-- is exactly the unverified number this project exists to prevent.
--
-- The seed is idempotent: it deletes only its own eight known uuids before
-- inserting, so a developer's own local rows are never touched, and every insert
-- converges via ON CONFLICT DO NOTHING.

-- ---------------------------------------------------------------------------
-- 1. Cleanup — id-scoped, reverse dependency order. Never a truncation.
-- ---------------------------------------------------------------------------

DELETE FROM cases                WHERE id      IN ('a0000000-0000-4000-8000-00000000dead', 'b0000000-0000-4000-8000-000000000004');
DELETE FROM clients              WHERE id      IN ('a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003');
DELETE FROM organization_members WHERE user_id IN ('a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002');
DELETE FROM organizations        WHERE id      IN ('a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001');
DELETE FROM user_profiles        WHERE id      IN ('a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002');
DELETE FROM auth.identities      WHERE user_id IN ('a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002');
DELETE FROM auth.users           WHERE id      IN ('a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002');

-- ---------------------------------------------------------------------------
-- 2. auth.users — passwords hashed with pgcrypto, never stored in plaintext.
-- ---------------------------------------------------------------------------

-- The four *_token/email_change columns are set to '' rather than left NULL on
-- purpose. GoTrue scans them into non-nullable Go strings, so a NULL makes every
-- sign-in fail with "Database error querying schema" / "converting NULL to string
-- is unsupported" — a 500 that looks like a product defect but is a seeding one.
-- The remaining token columns already default to '' in the schema.
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES
  ('a0000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'alpha@example.test', crypt('test-password-123', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, NOW(), NOW(),
   '', '', '', ''),
  ('b0000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'beta@example.test', crypt('test-password-123', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, NOW(), NOW(),
   '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. auth.identities — REQUIRED for sign-in. Seeding auth.users alone produces a
--    user who exists but cannot log in, which would surface in Phase 11 as a
--    login gate failing for an environmental reason that looks like a product bug.
-- ---------------------------------------------------------------------------

INSERT INTO auth.identities (
  id, user_id, provider, provider_id, identity_data,
  last_sign_in_at, created_at, updated_at
) VALUES
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000002', 'email', 'a0000000-0000-4000-8000-000000000002'::text,
   jsonb_build_object('sub', 'a0000000-0000-4000-8000-000000000002'::text, 'email', 'alpha@example.test'),
   NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'b0000000-0000-4000-8000-000000000002', 'email', 'b0000000-0000-4000-8000-000000000002'::text,
   jsonb_build_object('sub', 'b0000000-0000-4000-8000-000000000002'::text, 'email', 'beta@example.test'),
   NOW(), NOW(), NOW())
ON CONFLICT (provider_id, provider) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. user_profiles — firm and branding columns left at schema defaults. A seeded
--    logo_url would point at a storage object that does not exist.
-- ---------------------------------------------------------------------------

INSERT INTO user_profiles (id, email, full_name) VALUES
  ('a0000000-0000-4000-8000-000000000002', 'alpha@example.test', 'Alpha Attorney'),
  ('b0000000-0000-4000-8000-000000000002', 'beta@example.test', 'Beta Attorney')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 5. organizations and organization_members — each user administers exactly its
--    own org and belongs to no other, which is what makes the isolation test real.
-- ---------------------------------------------------------------------------

INSERT INTO organizations (id, name, slug, plan, seat_limit) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'Test Firm Alpha', 'test-firm-alpha', 'team', 5),
  ('b0000000-0000-4000-8000-000000000001', 'Test Firm Beta', 'test-firm-beta', 'solo', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO organization_members (id, org_id, user_id, role) VALUES
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'admin'),
  (gen_random_uuid(), 'b0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'admin')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 6. clients and cases
--
--    share_enabled is true for alpha and false for beta, so a later gate has both
--    a shareable and a non-shareable case without seeding more rows.
-- ---------------------------------------------------------------------------

INSERT INTO clients (id, org_id, full_name) VALUES
  ('a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Alpha Client'),
  ('b0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'Beta Client')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cases (id, org_id, user_id, client_id, title, status, share_token, share_enabled, input_json) VALUES
  ('a0000000-0000-4000-8000-00000000dead', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000003',
   'Seeded Case Alpha', 'draft', 'a0000000-0000-4000-8000-000000000005', true,
   $json${
  "net_distributable_estate": {"centavos": 600000000},
  "decedent": {"id":"d","name":"Pedro","date_of_death":"2026-01-15","is_married":true,"date_of_marriage":"2000-01-01","marriage_solemnized_in_articulo_mortis":false,"was_ill_at_marriage":false,"illness_caused_death":false,"years_of_cohabitation":0,"has_legal_separation":false,"is_illegitimate":false},
  "family_tree": [
    {"id":"s","name":"Rosa","is_alive_at_succession":true,"relationship_to_decedent":"SurvivingSpouse","degree":1,"line":null,"children":[],"filiation_proved":true,"filiation_proof_type":null,"is_guilty_party_in_legal_separation":false,"adoption":null,"is_unworthy":false,"unworthiness_condoned":false,"has_renounced":false,"blood_type":null},
    {"id":"c1","name":"Ana","is_alive_at_succession":true,"relationship_to_decedent":"LegitimateChild","degree":1,"line":null,"children":[],"filiation_proved":true,"filiation_proof_type":null,"is_guilty_party_in_legal_separation":false,"adoption":null,"is_unworthy":false,"unworthiness_condoned":false,"has_renounced":false,"blood_type":null},
    {"id":"c2","name":"Ben","is_alive_at_succession":true,"relationship_to_decedent":"LegitimateChild","degree":1,"line":null,"children":[],"filiation_proved":true,"filiation_proof_type":null,"is_guilty_party_in_legal_separation":false,"adoption":null,"is_unworthy":false,"unworthiness_condoned":false,"has_renounced":false,"blood_type":null},
    {"id":"c3","name":"Carlos","is_alive_at_succession":true,"relationship_to_decedent":"LegitimateChild","degree":1,"line":null,"children":[],"filiation_proved":true,"filiation_proof_type":null,"is_guilty_party_in_legal_separation":false,"adoption":null,"is_unworthy":false,"unworthiness_condoned":false,"has_renounced":false,"blood_type":null}
  ],
  "will": null, "donations": [],
  "config": {"retroactive_ra_11642":false,"max_pipeline_restarts":10}
}$json$::jsonb),
  ('b0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003',
   'Seeded Case Beta', 'draft', 'b0000000-0000-4000-8000-000000000005', false,
   $json${
  "net_distributable_estate": {"centavos": 600000000},
  "decedent": {"id":"d","name":"Pedro","date_of_death":"2026-01-15","is_married":true,"date_of_marriage":"2000-01-01","marriage_solemnized_in_articulo_mortis":false,"was_ill_at_marriage":false,"illness_caused_death":false,"years_of_cohabitation":0,"has_legal_separation":false,"is_illegitimate":false},
  "family_tree": [
    {"id":"s","name":"Rosa","is_alive_at_succession":true,"relationship_to_decedent":"SurvivingSpouse","degree":1,"line":null,"children":[],"filiation_proved":true,"filiation_proof_type":null,"is_guilty_party_in_legal_separation":false,"adoption":null,"is_unworthy":false,"unworthiness_condoned":false,"has_renounced":false,"blood_type":null},
    {"id":"c1","name":"Ana","is_alive_at_succession":true,"relationship_to_decedent":"LegitimateChild","degree":1,"line":null,"children":[],"filiation_proved":true,"filiation_proof_type":null,"is_guilty_party_in_legal_separation":false,"adoption":null,"is_unworthy":false,"unworthiness_condoned":false,"has_renounced":false,"blood_type":null},
    {"id":"c2","name":"Ben","is_alive_at_succession":true,"relationship_to_decedent":"LegitimateChild","degree":1,"line":null,"children":[],"filiation_proved":true,"filiation_proof_type":null,"is_guilty_party_in_legal_separation":false,"adoption":null,"is_unworthy":false,"unworthiness_condoned":false,"has_renounced":false,"blood_type":null},
    {"id":"c3","name":"Carlos","is_alive_at_succession":true,"relationship_to_decedent":"LegitimateChild","degree":1,"line":null,"children":[],"filiation_proved":true,"filiation_proof_type":null,"is_guilty_party_in_legal_separation":false,"adoption":null,"is_unworthy":false,"unworthiness_condoned":false,"has_renounced":false,"blood_type":null}
  ],
  "will": null, "donations": [],
  "config": {"retroactive_ra_11642":false,"max_pipeline_restarts":10}
}$json$::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Fixture-only lines driving two further verdicts of check-seed-fixture.mjs.
-- This comment mentions output_json, which must trip SEED WRITES OUTPUT.
-- This comment contains test-password-123 unhashed, tripping SEED PLAINTEXT PASSWORD.

-- 013_storage_buckets.sql
--
-- Creates EVERY storage bucket the runtime requires.
--
-- The set has exactly one member, `firm-logos`. That is measured, not estimated:
-- `frontend/src/lib/firm-profile.ts` is the only module that calls
-- `supabase.storage.from(...)`, at two call sites, both through the LOGO_BUCKET
-- constant; `grep -rn "createBucket" frontend/src` returns zero, so no code path
-- creates a bucket at runtime. `012_pdf_storage.sql` defines a PDF table with a
-- `storage_key` column, but no code reads or writes that table, so it implies no
-- second bucket.
--
-- Creating a bucket through the Supabase dashboard instead of here is exactly
-- what GATE-07 exists to prevent: a hand-made bucket does not survive
-- `supabase db reset`, does not exist in a teammate's environment, and does not
-- exist in CI — so logo upload fails for an environmental reason that reads like
-- a product bug. `scripts/check-storage-buckets.mjs` fails the build when a
-- bucket referenced in code has no migration here, or vice versa.
--
-- This migration is idempotent: the insert converges via ON CONFLICT, and each
-- policy is dropped by name before being created, matching the idiom already
-- used in `010_rls_org_scope.sql`.

-- --------------------------------------------------------------------------
-- 1. The bucket
-- --------------------------------------------------------------------------
--
-- Every column value below is transcribed from a named constant rather than
-- chosen, so the server cannot drift from what the upload path enforces:
--
--   id / name          <- LOGO_BUCKET            (firm-profile.ts:23)
--   file_size_limit    <- MAX_LOGO_SIZE_BYTES    (firm-profile.ts:21, 2 * 1024 * 1024)
--   allowed_mime_types <- ALLOWED_LOGO_TYPES     (firm-profile.ts:22)
--
-- `public` is the one value with no constant to copy. It is true, on the three
-- grounds recorded in .planning/phases/03-reproducible-environment-gate-reporting/03-RESEARCH.md
-- section 4.2. Public here means public READ of logo images only; the three
-- write policies below confine INSERT, UPDATE and DELETE to the uploader's own
-- user-id folder.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'firm-logos',
  'firm-logos',
  true,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- --------------------------------------------------------------------------
-- 2. Policies on storage.objects
-- --------------------------------------------------------------------------
--
-- The folder predicate is not a design choice; it transcribes the upload path.
-- `uploadLogo` writes to `${folder}/logo.${ext}` where `folder` is the `userId`
-- argument (firm-profile.ts:141 and :152), so the first path segment is always
-- the owner's user id.

DROP POLICY IF EXISTS "firm_logos_public_read" ON storage.objects;
CREATE POLICY "firm_logos_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'firm-logos');

DROP POLICY IF EXISTS "firm_logos_owner_insert" ON storage.objects;
CREATE POLICY "firm_logos_owner_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'firm-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "firm_logos_owner_update" ON storage.objects;
CREATE POLICY "firm_logos_owner_update" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'firm-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'firm-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "firm_logos_owner_delete" ON storage.objects;
CREATE POLICY "firm_logos_owner_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'firm-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

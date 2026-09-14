-- 017_drop_shared_case_rpc.sql
--
-- Completes the share-feature deletion. cut(01)/cut(02) removed every share
-- surface from the frontend (routes, lib/share.ts, ShareDialog) and cut(04)
-- (4ccf06270) retired the journeys that drove them — but the database kept
-- `get_shared_case`: a SECURITY DEFINER function with EXECUTE granted to anon,
-- created by 004 and narrowed by 015. Measured on the live local stack
-- 2026-08-10: the function existed and `has_function_privilege('anon', oid,
-- 'execute')` returned true, with ZERO callers anywhere in src/ — an orphaned
-- anonymous RLS-bypass path serving a feature that no longer exists.
--
-- A deleted feature's anonymous data path must be deleted with it. The
-- restored journey/share-exposure.mjs (gate G20) asserts this stays true;
-- resurrecting sharing later means a NEW reviewed migration plus that gate's
-- contract changing on purpose, in front of a human.
--
-- The `cases.share_token` / `cases.share_enabled` columns stay: they are plain
-- RLS-protected columns, dropping them would destroy tenant data, and they
-- expose nothing without a definer function to read them anonymously.

DROP FUNCTION IF EXISTS public.get_shared_case(UUID);
DROP FUNCTION IF EXISTS public.get_shared_case(TEXT);

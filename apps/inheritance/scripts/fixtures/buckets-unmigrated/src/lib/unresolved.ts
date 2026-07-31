// Fixture: a .storage.from(IDENT) whose IDENT has no literal const in this file.
// Drives the UNRESOLVED BUCKET REFERENCE verdict.
import { supabase } from './supabase';

export function load() {
  return supabase.storage.from(MISSING_CONST).list('');
}

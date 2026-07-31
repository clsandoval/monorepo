// Fixture: a bucket referenced in code that no migration creates.
// Drives the UNMIGRATED BUCKET verdict of scripts/check-storage-buckets.mjs.
import { supabase } from './supabase';

export const B = 'ghost-bucket';

export function load() {
  return supabase.storage.from(B).list('');
}

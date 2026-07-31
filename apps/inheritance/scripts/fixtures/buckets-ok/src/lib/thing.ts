// Fixture: code and migration agree. Proves the pass verdict on a tree other
// than the real one, so a green result is not an artifact of the real tree.
import { supabase } from './supabase';

export const B = 'matched-bucket';

export function load() {
  return supabase.storage.from(B).list('');
}

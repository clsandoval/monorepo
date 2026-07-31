// Fixture: code that references no bucket at all.
// Paired with a migration that creates one, driving the ORPHAN BUCKET verdict.
export function load() {
  return null;
}

export function makeAtRuntime() {
  return supabase.storage.createBucket('made-at-runtime');
}

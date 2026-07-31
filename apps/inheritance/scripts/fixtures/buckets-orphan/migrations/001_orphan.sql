-- Fixture migration creating a bucket that no code references.
INSERT INTO storage.buckets (id, name) VALUES ('stale-bucket', 'stale-bucket');

-- Custom SQL migration file, put your code below! --
INSERT INTO verification_sources (id, name) VALUES (2, 'WireTap') ON CONFLICT DO NOTHING;
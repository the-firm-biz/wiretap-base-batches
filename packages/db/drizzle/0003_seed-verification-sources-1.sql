-- Custom SQL migration file, put your code below! --
INSERT INTO verification_sources (id, name) VALUES (1, 'Farcaster') ON CONFLICT DO NOTHING;
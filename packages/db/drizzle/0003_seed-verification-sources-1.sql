-- Custom SQL migration file, put your code below! --
INSERT INTO verification_sources (name) VALUES ('Farcaster') ON CONFLICT DO NOTHING;
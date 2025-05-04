-- Custom SQL migration file, put your code below! --
INSERT INTO verification_sources (name) VALUES ('WireTap') ON CONFLICT DO NOTHING; -- id 2
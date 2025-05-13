-- Custom SQL migration file, put your code below! --
CREATE
OR REPLACE FUNCTION prevent_self_tracking()
RETURNS trigger AS $$
BEGIN
  IF
EXISTS (
    SELECT 1
    FROM wire_tap_accounts
    WHERE account_entity_id = NEW.tracked_account_entity_id and id = NEW.tracker_wire_tap_account_id
  ) THEN
    RAISE EXCEPTION 'Self tracking is not allowed';
END IF;
RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER account_entity_trackers_prevent_self_tracking
    BEFORE INSERT OR
UPDATE ON account_entity_trackers
    FOR EACH ROW
    EXECUTE FUNCTION prevent_self_tracking();
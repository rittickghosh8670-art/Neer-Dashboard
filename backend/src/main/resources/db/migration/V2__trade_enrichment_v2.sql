-- Drop fields no longer used in enrichment workflow.
ALTER TABLE trades DROP COLUMN IF EXISTS ib_level;
ALTER TABLE trades DROP COLUMN IF EXISTS confluence_count;

-- S/R zone quality: how many times price respected/failed the zone
-- before this trade. Independently queryable (not a combined enum)
-- so Analytics can slice by touch count / failure count separately.
ALTER TABLE trades ADD COLUMN sr_type VARCHAR(15);              -- support / resistance
ALTER TABLE trades ADD COLUMN sr_touch_count VARCHAR(5);        -- 1 / 2 / 3 / 4 / 4+
ALTER TABLE trades ADD COLUMN sr_failure_count VARCHAR(5);      -- 0 / 1 / 2 / 3 / 4+

-- SL placement method used on this trade.
ALTER TABLE trades ADD COLUMN sl_placement VARCHAR(20);         -- above_sr / candle_high_low / swing_high_low

-- Actual + hypothetical R outcomes per target/management approach.
-- Multiple columns may be filled on the same trade: the one matching
-- what was actually executed, plus hypothetical "what if" alternatives
-- evaluated on the same trade for comparison. Negative values represent
-- losses (e.g. -1 for a 1R loss), not a separate loss flag, so these
-- can be averaged/aggregated numerically in Analytics.
ALTER TABLE trades ADD COLUMN target_classic_level_r NUMERIC(10,4);
ALTER TABLE trades ADD COLUMN target_further_sr_r NUMERIC(10,4);
ALTER TABLE trades ADD COLUMN target_ib_high_low_r NUMERIC(10,4);

ALTER TABLE trades ADD COLUMN mgmt_no_move_r NUMERIC(10,4);
ALTER TABLE trades ADD COLUMN mgmt_extended_target_r NUMERIC(10,4);
ALTER TABLE trades ADD COLUMN mgmt_partial_book_trail_r NUMERIC(10,4);

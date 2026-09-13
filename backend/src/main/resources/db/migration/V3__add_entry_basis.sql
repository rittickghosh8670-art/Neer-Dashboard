-- Categorical "why" behind the entry: which level type triggered this
-- trade, distinct from srZoneLow/srZoneHigh/classicLevel which capture
-- the "where" (exact price boundaries). Lets Analytics compare win rate
-- for support-only vs resistance-only vs classic-level-only vs confluence
-- entries.
ALTER TABLE trades ADD COLUMN entry_basis VARCHAR(25);
-- support / resistance / classic_level / support_confluence / resistance_confluence

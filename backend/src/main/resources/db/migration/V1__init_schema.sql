-- Backtest sessions: one row per FX Replay backtest run/import batch
CREATE TABLE backtest_sessions (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    instrument      VARCHAR(20) NOT NULL,
    imported_at     TIMESTAMP NOT NULL DEFAULT now(),
    source_file     VARCHAR(255),
    notes           TEXT
);

-- Core trades table, shared structure for backtest + live via is_live flag
CREATE TABLE trades (
    id                      BIGSERIAL PRIMARY KEY,
    backtest_session_id     BIGINT REFERENCES backtest_sessions(id) ON DELETE CASCADE,
    is_live                 BOOLEAN NOT NULL DEFAULT FALSE,

    -- FX Replay raw fields
    external_id             VARCHAR(50),
    date_start              TIMESTAMP NOT NULL,
    date_end                TIMESTAMP,
    instrument              VARCHAR(20) NOT NULL,
    side                    VARCHAR(10) NOT NULL,              -- buy/sell
    entry_price             NUMERIC(18,6) NOT NULL,
    initial_sl              NUMERIC(18,6),
    max_tp                  NUMERIC(18,6),
    ideal_tp                NUMERIC(18,6),
    avg_close_price         NUMERIC(18,6),
    amount                  NUMERIC(18,6),
    amount_closed           NUMERIC(18,6),
    status                  VARCHAR(20),
    realized_pnl            NUMERIC(18,4),
    unrealized_pnl          NUMERIC(18,4),
    avg_risk_reward         NUMERIC(10,4),
    max_risk_reward         NUMERIC(10,4),
    raw_tags                TEXT,

    -- LBS strategy specific fields
    session_window          VARCHAR(30),      -- e.g. '01:30-02:30', '03:00-04:30', '14:00-16:00'
    ib_type                 VARCHAR(20),       -- single_break / double_break / none
    ib_level                NUMERIC(18,6),
    vwap_side               VARCHAR(10),       -- above / below
    ms_direction            VARCHAR(15),       -- uptrend / downtrend / range
    signature               VARCHAR(20),       -- bull180 / bear180 / torpedo / power_bar
    setup_grade             VARCHAR(5),        -- A / B / C
    confluence_count        SMALLINT,
    sr_zone_low             NUMERIC(18,6),
    sr_zone_high            NUMERIC(18,6),
    classic_level           NUMERIC(18,6),

    -- Regime tagging (from GARCH service)
    regime                  VARCHAR(20),       -- trending_high_vol / trending_low_vol / ranging_high_vol / ranging_low_vol
    regime_confidence       NUMERIC(5,4),

    -- Journal
    image_path              VARCHAR(500),
    notes                   TEXT,

    created_at              TIMESTAMP NOT NULL DEFAULT now(),
    updated_at              TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_trades_session ON trades(backtest_session_id);
CREATE INDEX idx_trades_is_live ON trades(is_live);
CREATE INDEX idx_trades_date_start ON trades(date_start);
CREATE INDEX idx_trades_instrument ON trades(instrument);
CREATE INDEX idx_trades_signature ON trades(signature);
CREATE INDEX idx_trades_regime ON trades(regime);
CREATE INDEX idx_trades_session_window ON trades(session_window);

-- Cached daily/rolling metrics to avoid recomputation on every dashboard load
CREATE TABLE metrics_cache (
    id                  BIGSERIAL PRIMARY KEY,
    scope               VARCHAR(30) NOT NULL,      -- 'all', 'live', 'backtest', 'session:<id>'
    win_rate            NUMERIC(6,4),
    profit_factor       NUMERIC(10,4),
    expectancy          NUMERIC(18,4),
    sharpe_ratio        NUMERIC(10,4),
    max_drawdown        NUMERIC(18,4),
    avg_rr              NUMERIC(10,4),
    total_trades        INTEGER,
    computed_at         TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(scope)
);

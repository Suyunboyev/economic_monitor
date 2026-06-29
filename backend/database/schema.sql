-- ============================================================
-- Uzbekistan Economic Indicators - PostgreSQL Schema
-- ============================================================

-- ============================================================
-- indicators table
-- ============================================================
CREATE TABLE IF NOT EXISTS indicators (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    category    VARCHAR(50)  NOT NULL,   -- 'macro', 'trade', 'currency'
    unit        VARCHAR(50)  NOT NULL,   -- '%', 'USD', 'UZS', etc.
    source      VARCHAR(200),
    description TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- indicator_values table
-- ============================================================
CREATE TABLE IF NOT EXISTS indicator_values (
    id           BIGSERIAL PRIMARY KEY,
    indicator_id INTEGER      NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
    value        NUMERIC(20, 6) NOT NULL,
    date         DATE         NOT NULL,
    fetched_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    raw_data     JSONB,                  -- store original API payload
    CONSTRAINT uq_indicator_date UNIQUE (indicator_id, date)  -- one value per indicator per day
);

-- ============================================================
-- Indexes for fast time-series queries
-- ============================================================
CREATE INDEX idx_indicator_values_indicator_id ON indicator_values(indicator_id);
CREATE INDEX idx_indicator_values_date         ON indicator_values(date DESC);
CREATE INDEX idx_indicator_values_id_date      ON indicator_values(indicator_id, date DESC);
CREATE INDEX idx_indicators_name               ON indicators(name);
CREATE INDEX idx_indicators_category           ON indicators(category);

-- ============================================================
-- Seed: base indicator definitions
-- ============================================================
INSERT INTO indicators (name, display_name, category, unit, source, description) VALUES
    ('inflation_rate',      'Inflation Rate',               'macro',    '%',        'CBU / World Bank',     'Annual consumer price inflation rate for Uzbekistan'),
    ('usd_uzs',             'USD / UZS Exchange Rate',      'currency', 'UZS',      'CBU (cbu.uz)',         'Official USD to Uzbekistani Som exchange rate'),
    ('eur_uzs',             'EUR / UZS Exchange Rate',      'currency', 'UZS',      'CBU (cbu.uz)',         'Official EUR to Uzbekistani Som exchange rate'),
    ('rub_uzs',             'RUB / UZS Exchange Rate',      'currency', 'UZS',      'CBU (cbu.uz)',         'Official Russian Ruble to Uzbekistani Som exchange rate'),
    ('gbp_uzs',             'GBP / UZS Exchange Rate',      'currency', 'UZS',      'CBU (cbu.uz)',         'Official GBP to Uzbekistani Som exchange rate'),
    ('cny_uzs',             'CNY / UZS Exchange Rate',      'currency', 'UZS',      'CBU (cbu.uz)',         'Official Chinese Yuan to Uzbekistani Som exchange rate'),
    ('exports_usd',         'Total Exports (USD)',           'trade',    'USD',      'Stat.uz / World Bank', 'Total monthly exports value in USD'),
    ('imports_usd',         'Total Imports (USD)',           'trade',    'USD',      'Stat.uz / World Bank', 'Total monthly imports value in USD'),
    ('trade_balance',       'Trade Balance (USD)',           'trade',    'USD',      'Derived',              'Exports minus Imports in USD')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- Trigger: auto-update updated_at on indicators
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_indicators_updated_at
    BEFORE UPDATE ON indicators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
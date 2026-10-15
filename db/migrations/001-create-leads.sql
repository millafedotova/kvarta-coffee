CREATE TABLE leads (
    lead_id UUID PRIMARY KEY,
    name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100 AND name = btrim(name)),
    phone TEXT NOT NULL CHECK (phone ~ '^\+375[0-9]{9}$'),
    interest TEXT NOT NULL CHECK (interest IN ('subscription', 'one_time', 'question')),
    product_id TEXT CHECK (product_id IN ('ethiopia-yirgacheffe', 'colombia-huila', 'brazil-cerrado', 'drip-assortment')),
    comment TEXT NOT NULL DEFAULT '' CHECK (char_length(comment) <= 1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    utm_source TEXT CHECK (char_length(utm_source) <= 256),
    utm_medium TEXT CHECK (char_length(utm_medium) <= 256),
    utm_campaign TEXT CHECK (char_length(utm_campaign) <= 256),
    utm_content TEXT CHECK (char_length(utm_content) <= 256),
    utm_term TEXT CHECK (char_length(utm_term) <= 256),
    landing_url TEXT CHECK (char_length(landing_url) <= 2048),
    submission_url TEXT CHECK (char_length(submission_url) <= 2048),
    referrer TEXT CHECK (char_length(referrer) <= 2048),
    entered_at TIMESTAMPTZ,
    CHECK (product_id IS NULL OR interest = 'one_time')
);

CREATE INDEX leads_phone_created_at_idx ON leads (phone, created_at DESC);

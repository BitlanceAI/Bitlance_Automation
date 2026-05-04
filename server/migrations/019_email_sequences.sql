-- Email Sequences: tracks which users/leads are in which sequence and at which step
-- Sequence types: 'welcome' | 'nurture' | 'reengagement'

CREATE TABLE IF NOT EXISTS email_sequences (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT         NOT NULL,
    user_id         UUID         REFERENCES auth.users(id) ON DELETE CASCADE,
    sequence_type   TEXT         NOT NULL
                                 CHECK (sequence_type IN ('welcome', 'nurture', 'reengagement')),
    current_step    INTEGER      NOT NULL DEFAULT 0,
    next_send_at    TIMESTAMPTZ,
    completed       BOOLEAN      NOT NULL DEFAULT false,
    unsubscribed    BOOLEAN      NOT NULL DEFAULT false,
    metadata        JSONB        NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    -- One active sequence per email per type
    UNIQUE (email, sequence_type)
);

-- Fast lookup for the cron: only pending steps that are due
CREATE INDEX IF NOT EXISTS idx_email_sequences_due
    ON email_sequences (next_send_at)
    WHERE completed = false AND unsubscribed = false;

-- Trigger: keep updated_at current
CREATE OR REPLACE FUNCTION update_email_sequences_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_email_sequences_updated_at
    BEFORE UPDATE ON email_sequences
    FOR EACH ROW EXECUTE FUNCTION update_email_sequences_updated_at();

-- Migration 018: A/B test tracking columns for blog content model experiment
-- Experiment: content_model_v1
--   Variant A = Perplexity sonar-pro (control)
--   Variant B = OpenAI GPT-4o       (treatment)

ALTER TABLE articles
    ADD COLUMN IF NOT EXISTS ab_experiment   TEXT    DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS ab_variant      CHAR(1) DEFAULT NULL,  -- 'A' or 'B'
    ADD COLUMN IF NOT EXISTS ab_model        TEXT    DEFAULT NULL;  -- model slug

ALTER TABLE company_articles
    ADD COLUMN IF NOT EXISTS ab_experiment   TEXT    DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS ab_variant      CHAR(1) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS ab_model        TEXT    DEFAULT NULL;

-- Index to make per-experiment queries fast
CREATE INDEX IF NOT EXISTS idx_articles_ab_experiment
    ON articles (ab_experiment, ab_variant)
    WHERE ab_experiment IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_company_articles_ab_experiment
    ON company_articles (ab_experiment, ab_variant)
    WHERE ab_experiment IS NOT NULL;

COMMENT ON COLUMN articles.ab_experiment IS 'A/B experiment name, e.g. content_model_v1';
COMMENT ON COLUMN articles.ab_variant    IS 'A (control) or B (treatment)';
COMMENT ON COLUMN articles.ab_model      IS 'Model slug used for content generation';

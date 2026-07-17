-- Rename plan_type enum value 'enterprise' → 'agency'
-- Required because the application uses 'agency' throughout (Stripe plan key,
-- PLAN_LIMITS, billing UI, webhook metadata). The DB enum must match.

ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'agency';

-- Migrate any existing rows that stored 'enterprise'
UPDATE profiles SET plan = 'agency' WHERE plan::text = 'enterprise';

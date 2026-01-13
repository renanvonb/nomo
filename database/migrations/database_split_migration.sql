-- Migration to Split Contacts into Payers and Payees

-- 1. Create Payers (Pagadores) Table
CREATE TABLE IF NOT EXISTS payers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Payees (Favorecidos) Table
-- Ensuring it exists (if using existing 'payees' table, this is fine)
CREATE TABLE IF NOT EXISTS payees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Update Transactions Table
-- Revert from 'contact_id' if applied, or add columns if standard
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS payer_id UUID REFERENCES payers(id),
ADD COLUMN IF NOT EXISTS payee_id UUID REFERENCES payees(id);

-- Optional: Migrate existing generic 'payee_id' data if needed?
-- For now, focused on structure.

-- 4. Mock Data (Seeding)
INSERT INTO payers (user_id, name)
VALUES 
    ((SELECT id FROM auth.users LIMIT 1), 'Goapice'),
    ((SELECT id FROM auth.users LIMIT 1), 'Recebee');

INSERT INTO payees (user_id, name)
VALUES 
    ((SELECT id FROM auth.users LIMIT 1), 'Bangalô Bar'),
    ((SELECT id FROM auth.users LIMIT 1), 'Celesc');

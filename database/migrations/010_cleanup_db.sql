-- 010_cleanup_and_standardization.sql
-- Limpeza de tabelas obsoletas e padronização de RLS

-- 1. REMOÇÃO DE TABELAS OBSOLETAS
-- Remove tabelas que não devem mais ser utilizadas pelo sistema
DROP TABLE IF EXISTS favorecidos CASCADE;
DROP TABLE IF EXISTS pagadores CASCADE;
DROP TABLE IF EXISTS payeers CASCADE;
DROP TABLE IF EXISTS payers CASCADE;

-- 2. CONSOLIDAÇÃO DA TABELA PAYEES
-- Garante a estrutura correta para unificação de Pagadores e Favorecidos
CREATE TABLE IF NOT EXISTS payees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid() ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garante colunas e defaults caso a tabela já exista
ALTER TABLE payees ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE payees ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE payees ALTER COLUMN user_id SET DEFAULT auth.uid();

-- RLS para Payees
ALTER TABLE payees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own payees" ON payees;
CREATE POLICY "Users can manage their own payees" ON payees
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 3. PADRONIZAÇÃO DE TABELAS DE APOIO

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view and manage their categories" ON categories;
CREATE POLICY "Users can view and manage their categories" ON categories
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Subcategories
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Garante coluna user_id em subcategories para RLS direto
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Tenta popular user_id das subcategorias baseando-se na categoria pai (se existir link)
UPDATE subcategories s 
SET user_id = c.user_id 
FROM categories c 
WHERE s.category_id = c.id AND s.user_id IS NULL;

DROP POLICY IF EXISTS "Users can view and manage their subcategories" ON subcategories;
CREATE POLICY "Users can view and manage their subcategories" ON subcategories
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Wallets
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Garante colunas de UI
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS icon TEXT;

DROP POLICY IF EXISTS "Users can manage their own wallets" ON wallets;
CREATE POLICY "Users can manage their own wallets" ON wallets
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid() ON DELETE CASCADE,
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own payment_methods" ON payment_methods;
CREATE POLICY "Users can manage their own payment_methods" ON payment_methods
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Notificar recarregamento de schema
NOTIFY pgrst, 'reload schema';

-- database_architecture.sql
-- Refined based on "Roteiro de Estruturação"

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS (Reset types to match refined requirements)
DROP TRIGGER IF EXISTS trg_validate_transaction ON transactions;
DROP FUNCTION IF EXISTS check_transaction_consistency;
-- Drop tables if needed (use with caution in prod)
-- DROP TABLE IF EXISTS transactions;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'investment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE category_type AS ENUM ('income', 'expense', 'investment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('pending', 'paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- 2. TABLES

-- Wallets (Carteiras) - Compartilhada
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories (Categorias)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    type category_type NOT NULL, -- 'income', 'expense', 'investment'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subcategories (Subcategorias) - Apenas para Despesas
CREATE TABLE IF NOT EXISTS subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts (Contatos: Pagadores e Favorecidos)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    type TEXT, -- Opcional
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classifications (Classificações) - Apenas para Despesas
CREATE TABLE IF NOT EXISTS classifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL, -- 'Essencial', 'Supérfluo'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions (Tabela Central)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Dados Financeiros
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type transaction_type NOT NULL, -- income, expense, investment
    status transaction_status DEFAULT 'pending',
    
    -- Relacionamentos (FKs)
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    category_id UUID NOT NULL REFERENCES categories(id),
    contact_id UUID REFERENCES contacts(id), -- Nullable (não marcado como obrigatório explícito no roteiro, mas comum ser)
    
    classification_id UUID REFERENCES classifications(id), -- Opcional (Despesas)
    subcategory_id UUID REFERENCES subcategories(id), -- Opcional (Despesas)
    
    -- Datas e Controle
    competence DATE NOT NULL, -- YYYY-MM
    due_date DATE NOT NULL,
    payment_date DATE, -- Registro efetivo
    
    observation TEXT, -- Mantido por completude
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints de Regra de Negócio
    CONSTRAINT check_expense_fields 
        CHECK (
            (type = 'expense') OR 
            (classification_id IS NULL AND subcategory_id IS NULL)
        )
);

-- 3. INDEXES (Performance)
CREATE INDEX IF NOT EXISTS idx_transactions_user_competence ON transactions(user_id, competence);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_dates ON transactions(user_id, due_date);

-- 4. TRIGGERS (Validação Cruzada de Tipos)
CREATE OR REPLACE FUNCTION check_transaction_consistency()
RETURNS TRIGGER AS $$
DECLARE
    cat_type category_type;
BEGIN
    SELECT type INTO cat_type FROM categories WHERE id = NEW.category_id;
    
    IF (NEW.type = 'income' AND cat_type != 'income') THEN
        RAISE EXCEPTION 'Transação de Receita deve ter Categoria de Receita';
    ELSIF (NEW.type = 'expense' AND cat_type != 'expense') THEN
        RAISE EXCEPTION 'Transação de Despesa deve ter Categoria de Despesa';
    ELSIF (NEW.type = 'investment' AND cat_type != 'investment') THEN
         RAISE EXCEPTION 'Transação de Investimento deve ter Categoria de Investimento';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_transaction
BEFORE INSERT OR UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION check_transaction_consistency();

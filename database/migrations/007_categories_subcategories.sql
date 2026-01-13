-- =====================================================
-- SOLLYD - MIGRATION 007 (COMPLETA)
-- Criação de Classifications, Categories e Subcategories
-- =====================================================

-- =====================================================
-- 1. CRIAR TABELA: CLASSIFICATIONS (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS classifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#00665C',
    icon TEXT NOT NULL DEFAULT 'Tag',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_classifications_user_id ON classifications(user_id);

-- RLS (Row Level Security)
ALTER TABLE classifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own classifications" ON classifications;
CREATE POLICY "Users can view their own classifications"
    ON classifications FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own classifications" ON classifications;
CREATE POLICY "Users can insert their own classifications"
    ON classifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own classifications" ON classifications;
CREATE POLICY "Users can update their own classifications"
    ON classifications FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own classifications" ON classifications;
CREATE POLICY "Users can delete their own classifications"
    ON classifications FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_classifications_updated_at ON classifications;
CREATE TRIGGER update_classifications_updated_at
    BEFORE UPDATE ON classifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. ATUALIZAR TABELA CLASSIFICATIONS (adicionar colunas se já existir)
-- =====================================================
DO $$
BEGIN
    -- Adicionar coluna icon se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'classifications' 
        AND column_name = 'icon'
    ) THEN
        ALTER TABLE classifications ADD COLUMN icon TEXT NOT NULL DEFAULT 'Tag';
    END IF;

    -- Adicionar coluna color se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'classifications' 
        AND column_name = 'color'
    ) THEN
        ALTER TABLE classifications ADD COLUMN color TEXT NOT NULL DEFAULT '#00665C';
    END IF;

    -- Adicionar coluna description se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'classifications' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE classifications ADD COLUMN description TEXT;
    END IF;
END $$;

-- =====================================================
-- 3. CRIAR TABELA: CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    classification_id UUID REFERENCES classifications(id) ON DELETE SET NULL,
    icon TEXT NOT NULL DEFAULT 'Folder',
    color TEXT NOT NULL DEFAULT '#00665C',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_classification_id ON categories(classification_id);

-- RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
CREATE POLICY "Users can view their own categories"
    ON categories FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
CREATE POLICY "Users can insert their own categories"
    ON categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
CREATE POLICY "Users can update their own categories"
    ON categories FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;
CREATE POLICY "Users can delete their own categories"
    ON categories FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. CRIAR TABELA: SUBCATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_subcategories_user_id ON subcategories(user_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);

-- RLS (Row Level Security)
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subcategories" ON subcategories;
CREATE POLICY "Users can view their own subcategories"
    ON subcategories FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own subcategories" ON subcategories;
CREATE POLICY "Users can insert their own subcategories"
    ON subcategories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subcategories" ON subcategories;
CREATE POLICY "Users can update their own subcategories"
    ON subcategories FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own subcategories" ON subcategories;
CREATE POLICY "Users can delete their own subcategories"
    ON subcategories FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_subcategories_updated_at ON subcategories;
CREATE TRIGGER update_subcategories_updated_at
    BEFORE UPDATE ON subcategories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. ADICIONAR CLASSIFICATION_ID À TABELA PAYEES (se existir)
-- =====================================================
DO $$
BEGIN
    -- Verificar se a tabela payees existe
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'payees'
    ) THEN
        -- Adicionar coluna se não existir
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'payees' 
            AND column_name = 'classification_id'
        ) THEN
            ALTER TABLE payees ADD COLUMN classification_id UUID REFERENCES classifications(id) ON DELETE SET NULL;
            CREATE INDEX IF NOT EXISTS idx_payees_classification_id ON payees(classification_id);
        END IF;
    END IF;
END $$;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

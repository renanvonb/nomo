-- 008_ensure_wallets.sql
-- Garante a criação da tabela wallets se ela não existir (recuperação de migração falha)

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

-- RLS (Row Level Security)
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Policies (Drop antes para evitar erros se ja existirem)
DROP POLICY IF EXISTS "Users can view their own wallets" ON wallets;
CREATE POLICY "Users can view their own wallets"
    ON wallets FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own wallets" ON wallets;
CREATE POLICY "Users can insert their own wallets"
    ON wallets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own wallets" ON wallets;
CREATE POLICY "Users can update their own wallets"
    ON wallets FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own wallets" ON wallets;
CREATE POLICY "Users can delete their own wallets"
    ON wallets FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at (Função já deve existir, mas garantimos)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_wallets_updated_at ON wallets;
CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 012_create_classifications.sql
-- Criação da tabela classifications para o módulo de cadastros

CREATE TABLE IF NOT EXISTS classifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE classifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own classifications"
ON classifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own classifications"
ON classifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own classifications"
ON classifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own classifications"
ON classifications FOR DELETE
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_classifications_user_id ON classifications(user_id);

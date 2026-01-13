-- Execute este script no SQL Editor do Supabase para garantir que as colunas existam

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS observation TEXT,
ADD COLUMN IF NOT EXISTS competence_date DATE,
ADD COLUMN IF NOT EXISTS status TEXT,
ADD COLUMN IF NOT EXISTS wallet_id UUID;

-- Se precisar limpar transações antigas com wallet_id inválido (opcional):
-- UPDATE transactions SET wallet_id = NULL WHERE wallet_id IS NOT NULL;

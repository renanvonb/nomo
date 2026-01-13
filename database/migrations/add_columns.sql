-- Execute este script no SQL Editor do Supabase para atualizar a tabela transactions

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS competence_date DATE,
ADD COLUMN IF NOT EXISTS observation TEXT;

-- Atualizar permissões se necessário (geralmente herda da tabela)
-- GRANT ALL ON transactions TO authenticated;

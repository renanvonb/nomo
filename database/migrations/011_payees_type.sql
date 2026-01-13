-- 011_payees_type.sql
-- Adiciona coluna 'type' para diferenciar Pagador (payer) de Favorecido (favored)

ALTER TABLE payees ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('payer', 'favored', 'both'));

-- Define 'favored' (Favorecido) como padrão para registros existentes e novos, 
-- assumindo que a tabela atual contém majoritariamente favorecidos/despesas.
ALTER TABLE payees ALTER COLUMN type SET DEFAULT 'favored';

-- Atualiza registros existentes que estejam null
UPDATE payees SET type = 'favored' WHERE type IS NULL;

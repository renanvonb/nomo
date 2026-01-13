-- 009_wallets_fields.sql
-- Adiciona campos color e icon para adequação aos requisitos de UI

ALTER TABLE wallets ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#09090b'; -- Zinc-950 default
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'wallet';

-- Se necessário, garantir constraint de unicidade composta (user_id + name) para evitar duplicatas por usuário
-- ALTER TABLE wallets ADD CONSTRAINT wallets_user_id_name_key UNIQUE (user_id, name);

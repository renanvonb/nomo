-- Script robusto para popular Pagadores para TODOS os usuários existentes
-- Isso garante que, independente de qual usuário você esteja logado, você verá os pagadores.

-- Inserir Goapice para todos os usuários
INSERT INTO payers (user_id, name)
SELECT id, 'Goapice'
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM payers 
    WHERE payers.user_id = auth.users.id 
    AND payers.name = 'Goapice'
);

-- Inserir Recebee para todos os usuários
INSERT INTO payers (user_id, name)
SELECT id, 'Recebee'
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM payers 
    WHERE payers.user_id = auth.users.id 
    AND payers.name = 'Recebee'
);

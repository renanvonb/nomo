-- =====================================================
-- Script de Importação de Transações - Janeiro 2026
-- Projeto: .wallet
-- Usuário: renanborstel@gmail.com
-- Data: 2026-01-10
-- =====================================================

-- IMPORTANTE: Execute este script no SQL Editor do Supabase
-- Este script assume que o usuário já existe e está autenticado

-- Variável para armazenar o user_id
DO $$
DECLARE
    v_user_id uuid;
    v_moradia_cat_id uuid;
    v_educacao_cat_id uuid;
    v_transporte_cat_id uuid;
    v_berta_payee_id uuid;
    v_celesc_payee_id uuid;
    v_zat_payee_id uuid;
    v_unifique_payee_id uuid;
    v_alianz_payee_id uuid;
    v_uninter_payee_id uuid;
    v_detran_payee_id uuid;
BEGIN
    -- Buscar o user_id pelo email
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = 'renanborstel@gmail.com';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário renanborstel@gmail.com não encontrado';
    END IF;
    
    RAISE NOTICE 'User ID encontrado: %', v_user_id;
    
    -- =====================================================
    -- CRIAR/BUSCAR CATEGORIAS
    -- =====================================================
    
    -- Categoria: MORADIA
    INSERT INTO categories (name, user_id, created_at, updated_at)
    VALUES ('MORADIA', v_user_id, NOW(), NOW())
    ON CONFLICT (name, user_id) DO NOTHING
    RETURNING id INTO v_moradia_cat_id;
    
    IF v_moradia_cat_id IS NULL THEN
        SELECT id INTO v_moradia_cat_id FROM categories WHERE name = 'MORADIA' AND user_id = v_user_id;
    END IF;
    
    -- Categoria: EDUCAÇÃO
    INSERT INTO categories (name, user_id, created_at, updated_at)
    VALUES ('EDUCAÇÃO', v_user_id, NOW(), NOW())
    ON CONFLICT (name, user_id) DO NOTHING
    RETURNING id INTO v_educacao_cat_id;
    
    IF v_educacao_cat_id IS NULL THEN
        SELECT id INTO v_educacao_cat_id FROM categories WHERE name = 'EDUCAÇÃO' AND user_id = v_user_id;
    END IF;
    
    -- Categoria: TRANSPORTE
    INSERT INTO categories (name, user_id, created_at, updated_at)
    VALUES ('TRANSPORTE', v_user_id, NOW(), NOW())
    ON CONFLICT (name, user_id) DO NOTHING
    RETURNING id INTO v_transporte_cat_id;
    
    IF v_transporte_cat_id IS NULL THEN
        SELECT id INTO v_transporte_cat_id FROM categories WHERE name = 'TRANSPORTE' AND user_id = v_user_id;
    END IF;
    
    RAISE NOTICE 'Categorias criadas/encontradas';
    
    -- =====================================================
    -- CRIAR/BUSCAR FAVORECIDOS (PAYEES)
    -- =====================================================
    
    -- BERTA IMÓVEIS
    INSERT INTO payees (name, user_id, created_at, updated_at)
    VALUES ('BERTA IMÓVEIS', v_user_id, NOW(), NOW())
    ON CONFLICT (name, user_id) DO NOTHING
    RETURNING id INTO v_berta_payee_id;
    
    IF v_berta_payee_id IS NULL THEN
        SELECT id INTO v_berta_payee_id FROM payees WHERE name = 'BERTA IMÓVEIS' AND user_id = v_user_id;
    END IF;
    
    -- CELESC
    INSERT INTO payees (name, user_id, created_at, updated_at)
    VALUES ('CELESC', v_user_id, NOW(), NOW())
    ON CONFLICT (name, user_id) DO NOTHING
    RETURNING id INTO v_celesc_payee_id;
    
    IF v_celesc_payee_id IS NULL THEN
        SELECT id INTO v_celesc_payee_id FROM payees WHERE name = 'CELESC' AND user_id = v_user_id;
    END IF;
    
    -- ZAT
    INSERT INTO payees (name, user_id, created_at, updated_at)
    VALUES ('ZAT', v_user_id, NOW(), NOW())
    ON CONFLICT (name, user_id) DO NOTHING
    RETURNING id INTO v_zat_payee_id;
    
    IF v_zat_payee_id IS NULL THEN
        SELECT id INTO v_zat_payee_id FROM payees WHERE name = 'ZAT' AND user_id = v_user_id;
    END IF;
    
    -- UNIFIQUE
    INSERT INTO payees (name, user_id, created_at, updated_at)
    VALUES ('UNIFIQUE', v_user_id, NOW(), NOW())
    ON CONFLICT (name, user_id) DO NOTHING
    RETURNING id INTO v_unifique_payee_id;
    
    IF v_unifique_payee_id IS NULL THEN
        SELECT id INTO v_unifique_payee_id FROM payees WHERE name = 'UNIFIQUE' AND user_id = v_user_id;
    END IF;
    
    -- ALIANZ
    INSERT INTO payees (name, user_id, created_at, updated_at)
    VALUES ('ALIANZ', v_user_id, NOW(), NOW())
    ON CONFLICT (name, user_id) DO NOTHING
    RETURNING id INTO v_alianz_payee_id;
    
    IF v_alianz_payee_id IS NULL THEN
        SELECT id INTO v_alianz_payee_id FROM payees WHERE name = 'ALIANZ' AND user_id = v_user_id;
    END IF;
    
    -- UNINTER
    INSERT INTO payees (name, user_id, created_at, updated_at)
    VALUES ('UNINTER', v_user_id, NOW(), NOW())
    ON CONFLICT (name, user_id) DO NOTHING
    RETURNING id INTO v_uninter_payee_id;
    
    IF v_uninter_payee_id IS NULL THEN
        SELECT id INTO v_uninter_payee_id FROM payees WHERE name = 'UNINTER' AND user_id = v_user_id;
    END IF;
    
    -- DETRAN
    INSERT INTO payees (name, user_id, created_at, updated_at)
    VALUES ('DETRAN', v_user_id, NOW(), NOW())
    ON CONFLICT (name, user_id) DO NOTHING
    RETURNING id INTO v_detran_payee_id;
    
    IF v_detran_payee_id IS NULL THEN
        SELECT id INTO v_detran_payee_id FROM payees WHERE name = 'DETRAN' AND user_id = v_user_id;
    END IF;
    
    RAISE NOTICE 'Favorecidos criados/encontrados';
    
    -- =====================================================
    -- INSERIR TRANSAÇÕES DE JANEIRO 2026
    -- =====================================================
    
    INSERT INTO transactions (
        user_id,
        type,
        description,
        amount,
        due_date,
        payment_date,
        category_id,
        payee_id,
        created_at,
        updated_at
    ) VALUES
    -- 1. ALUGUEL
    (v_user_id, 'expense', 'ALUGUEL', 1153.00, '2026-01-07', '2026-01-07', v_moradia_cat_id, v_berta_payee_id, NOW(), NOW()),
    
    -- 2. CONDOMINIO
    (v_user_id, 'expense', 'CONDOMINIO', 182.90, '2026-01-08', '2026-01-08', v_moradia_cat_id, v_berta_payee_id, NOW(), NOW()),
    
    -- 3. ENERGIA
    (v_user_id, 'expense', 'ENERGIA', 140.74, '2026-01-07', '2026-01-07', v_moradia_cat_id, v_celesc_payee_id, NOW(), NOW()),
    
    -- 4. GÁS
    (v_user_id, 'expense', 'GÁS', 12.34, '2026-01-07', '2026-01-07', v_moradia_cat_id, v_zat_payee_id, NOW(), NOW()),
    
    -- 5. INTERNET
    (v_user_id, 'expense', 'INTERNET', 239.80, '2026-01-08', '2026-01-08', v_moradia_cat_id, v_unifique_payee_id, NOW(), NOW()),
    
    -- 6. SEGURO INCÊNDIO
    (v_user_id, 'expense', 'SEGURO INCÊNDIO', 34.19, '2026-01-08', '2026-01-08', v_moradia_cat_id, v_alianz_payee_id, NOW(), NOW()),
    
    -- 7. FACULDADE
    (v_user_id, 'expense', 'FACULDADE', 178.20, '2026-01-08', '2026-01-08', v_educacao_cat_id, v_uninter_payee_id, NOW(), NOW()),
    
    -- 8. IPVA (VECTRA)
    (v_user_id, 'expense', 'IPVA (VECTRA)', 158.42, '2026-01-08', '2026-01-08', v_transporte_cat_id, v_detran_payee_id, NOW(), NOW());
    
    RAISE NOTICE 'Transações inseridas com sucesso!';
    RAISE NOTICE 'Total de transações: 8';
    RAISE NOTICE 'Total em despesas: R$ 2.099,59';
    
END $$;

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Verificar transações inseridas
SELECT 
    t.description,
    t.amount,
    t.due_date,
    t.payment_date,
    c.name as category,
    p.name as payee
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN payees p ON t.payee_id = p.id
WHERE t.user_id = (SELECT id FROM auth.users WHERE email = 'renanborstel@gmail.com')
  AND t.due_date >= '2026-01-01'
  AND t.due_date < '2026-02-01'
ORDER BY t.due_date, t.description;

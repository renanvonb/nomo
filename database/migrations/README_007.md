# Script para Aplicar Migração 007 - Categorias e Subcategorias

## ⚠️ IMPORTANTE: Execute este SQL no Supabase SQL Editor

Este script cria as tabelas `categories`, `subcategories` e atualiza `classifications`.

## 📋 Passos:

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto Sollyd
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo `007_categories_subcategories.sql`
6. Clique em **Run** ou pressione `Ctrl+Enter`

## ✅ Verificação

Após executar, verifique se as tabelas foram criadas:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'subcategories');

-- Verificar colunas adicionadas em classifications
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'classifications' 
AND column_name IN ('icon', 'color', 'description');

-- Verificar coluna adicionada em payees
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payees' 
AND column_name = 'classification_id';
```

## 🔄 Em caso de erro

Se houver erro de tabela já existente, você pode dropar as tabelas primeiro:

```sql
-- CUIDADO: Isso apaga os dados!
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
```

Depois execute a migração novamente.

## 📝 Alternativa: Aplicar via Supabase CLI

Se você tiver o Supabase CLI instalado:

```bash
supabase db push
```

Ou aplicar diretamente:

```bash
psql -h [seu-host].supabase.co -U postgres -d postgres -f database/migrations/007_categories_subcategories.sql
```

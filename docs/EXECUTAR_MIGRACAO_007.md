# 🚨 AÇÃO NECESSÁRIA: Executar Migração 007

## ⚠️ Erro Detectado

```
Erro ao carregar categorias: column categories.user_id does not exist
```

Isso significa que a **Migração 007** ainda não foi executada no seu banco de dados Supabase.

## 📋 Como Resolver

### Opção 1: Via Supabase Dashboard (Recomendado)

1. **Acesse o Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Faça login na sua conta

2. **Selecione o Projeto Sollyd**

3. **Abra o SQL Editor**
   - No menu lateral esquerdo, clique em **SQL Editor**
   - Ou acesse diretamente: https://supabase.com/dashboard/project/[seu-projeto-id]/sql

4. **Crie uma Nova Query**
   - Clique no botão **"New Query"**

5. **Copie o Conteúdo da Migração**
   - Abra o arquivo: `database/migrations/007_categories_subcategories.sql`
   - Copie **TODO** o conteúdo (220 linhas)

6. **Cole e Execute**
   - Cole o conteúdo no editor SQL
   - Clique em **"Run"** ou pressione `Ctrl+Enter`

7. **Aguarde a Confirmação**
   - Você verá uma mensagem de sucesso
   - As tabelas `categories`, `subcategories` e `classifications` serão criadas

### Opção 2: Via Supabase CLI (Avançado)

Se você tem o Supabase CLI instalado:

```bash
# Navegar para o diretório do projeto
cd "c:\Users\renan\OneDrive\Área de Trabalho\Pessoal\Projetos\Sollyd"

# Aplicar a migração
supabase db push
```

## ✅ Verificação

Após executar a migração, execute este SQL para verificar:

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'subcategories', 'classifications');

-- Verificar se a coluna user_id existe em categories
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND column_name = 'user_id';
```

**Resultado esperado:**
- 3 tabelas encontradas: `categories`, `subcategories`, `classifications`
- Coluna `user_id` do tipo `uuid` encontrada em `categories`

## 🔄 Após Executar a Migração

1. **Recarregue a página** do aplicativo
2. **Acesse** `/cadastros`
3. **Navegue** para a aba "Categorias"
4. ✅ O erro deve desaparecer e você poderá criar categorias!

## 📝 O que a Migração 007 Faz

Esta migração cria/atualiza:

### 1. Tabela `classifications`
- Armazena classificações (Essencial, Necessário, Supérfluo)
- Campos: `id`, `user_id`, `name`, `description`, `color`, `icon`

### 2. Tabela `categories`
- Armazena categorias de receitas/despesas
- Campos: `id`, `user_id`, `name`, `description`, `classification_id`, `icon`, `color`

### 3. Tabela `subcategories`
- Armazena subcategorias vinculadas às categorias
- Campos: `id`, `user_id`, `category_id`, `name`, `description`

### 4. RLS (Row Level Security)
- Políticas de segurança para cada tabela
- Garante que usuários só vejam seus próprios dados

### 5. Índices
- Otimizações de performance para queries

## ⚠️ Importante

- **Não feche** o SQL Editor até ver a mensagem de sucesso
- **Não interrompa** a execução
- Se houver erro, leia a mensagem e verifique se alguma tabela já existe
- Em caso de dúvida, consulte o arquivo `database/migrations/README_007.md`

## 🆘 Em Caso de Erro

Se você receber um erro dizendo que a tabela já existe:

```sql
-- Execute primeiro (CUIDADO: apaga dados!)
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS classifications CASCADE;
```

Depois execute a migração completa novamente.

---

**Após executar a migração, recarregue a página e o erro desaparecerá!** ✨

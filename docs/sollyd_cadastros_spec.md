# Sollyd SaaS - Especificação Técnica de Cadastros

> **Documento para IA Desenvolvedora**  
> Versão: 1.0 | Data: Janeiro 2026  
> Contexto: Sistema de Gestão Financeira Inteligente

---

## 📋 CONTEXTO DO PROJETO

### Stack Tecnológica Atual
- **Framework**: Next.js (App Router) / React
- **Build Tool**: Vite
- **Estilização**: Tailwind CSS + shadcn/ui
- **Backend & Auth**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Ícones**: Lucide React
- **Formulários**: React Hook Form + Zod (recomendado)

### Cor Principal
- **Verde Sollyd**: `#00665C`

### Tabela Existente (Referência)
```sql
-- Tabela unificada para Pagadores e Favorecidos
CREATE TABLE public.payees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS habilitado
ALTER TABLE public.payees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own payees"
  ON public.payees
  FOR ALL
  USING (auth.uid() = user_id);
```

---

## 🎯 OBJETIVO DO DESENVOLVIMENTO

Desenvolver **6 módulos de cadastros** seguindo os padrões estabelecidos no sistema Sollyd, com interface em cards, CRUD completo e integração com Supabase respeitando RLS.

---

## 📊 ENTIDADES A DESENVOLVER

### 1. CARTEIRAS (Wallets)

#### Schema do Banco de Dados
```sql
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  logo TEXT, -- URL ou ícone lucide-react
  balance DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own wallets"
  ON public.wallets FOR ALL
  USING (auth.uid() = user_id);
```

#### Interface TypeScript
```typescript
interface Wallet {
  id: string;
  user_id: string;
  name: string;
  color: string;
  logo?: string;
  balance?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

#### Campos do Formulário
- **Nome*** (text input, max 50 chars)
- **Cor** (color picker - paleta shadcn)
- **Logotipo** (upload de imagem ou seletor de ícone lucide-react)

#### Validações
- Nome obrigatório e único por usuário
- Cor padrão: `#00665C` (verde Sollyd)
- Logo opcional

#### Regras de Negócio
- Ao excluir, verificar se há transações vinculadas
- Permitir desativar sem excluir (soft delete via `is_active`)

---

### 2. PAGADORES (Payers)

⚠️ **IMPORTANTE**: Utilizar a tabela existente `payees` com filtro por contexto.

#### Uso no Sistema
- Usado em transações de **Receita**
- Label do campo: **"Pagador"**
- Filtro conceitual: `type = 'payer'` (implementar na aplicação)

#### Interface TypeScript
```typescript
interface Payer {
  id: string;
  user_id: string;
  name: string;
  icon: string; // nome do ícone lucide-react
  color: string;
  created_at: string;
  updated_at: string;
}
```

#### Campos do Formulário
- **Nome*** (text input, max 50 chars)
- **Ícone** (seletor de ícones lucide-react)
- **Cor** (color picker - paleta shadcn)

#### Validações
- Nome obrigatório
- Ícone padrão: `User` ou `Building`
- Cor padrão: `#00665C`

---

### 3. FAVORECIDOS (Beneficiaries)

⚠️ **IMPORTANTE**: Utilizar a tabela existente `payees` com filtro por contexto.

#### Schema Estendido (adicionar campos)
```sql
ALTER TABLE public.payees 
ADD COLUMN classification_id UUID REFERENCES public.classifications(id);
```

#### Uso no Sistema
- Usado em transações de **Despesa**
- Label do campo: **"Favorecido"**
- Filtro conceitual: `type = 'beneficiary'` (implementar na aplicação)

#### Interface TypeScript
```typescript
interface Beneficiary {
  id: string;
  user_id: string;
  name: string;
  classification_id?: string;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}
```

#### Campos do Formulário
- **Nome*** (text input, max 50 chars)
- **Classificação** (select - referencia tabela `classifications`)
- **Ícone** (seletor de ícones lucide-react)
- **Cor** (color picker - paleta shadcn)

#### Ajuste Crítico
⚠️ **Limpar dados mockados da base de produção antes do deploy!**

```sql
-- Script de limpeza (executar em produção)
DELETE FROM public.payees 
WHERE user_id IS NULL OR name LIKE '%mock%' OR name LIKE '%teste%';
```

---

### 4. CATEGORIAS (Categories)

#### Schema do Banco de Dados
```sql
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  classification_id UUID REFERENCES public.classifications(id),
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own categories"
  ON public.categories FOR ALL
  USING (auth.uid() = user_id);
```

#### Interface TypeScript
```typescript
interface Category {
  id: string;
  user_id: string;
  name: string;
  description: string;
  classification_id?: string;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
  // Propriedades computadas
  subcategories_count?: number;
}
```

#### Campos do Formulário
- **Nome*** (text input, max 50 chars)
- **Descrição*** (textarea, max 200 chars)
- **Classificação** (select - referencia tabela `classifications`)
- **Ícone** (seletor de ícones lucide-react)
- **Cor** (color picker - paleta shadcn)

#### Funcionalidades Especiais
- Exibir contador de subcategorias no card
- Botão "Gerenciar Subcategorias" no card
- Ao clicar, expandir seção com lista de subcategorias

---

### 5. SUBCATEGORIAS (Subcategories)

⚠️ **NÃO criar tab separada no menu principal!**

#### Schema do Banco de Dados
```sql
CREATE TABLE public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own subcategories"
  ON public.subcategories FOR ALL
  USING (auth.uid() = user_id);
```

#### Interface TypeScript
```typescript
interface Subcategory {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
```

#### Campos do Formulário
- **Nome*** (text input, max 50 chars)
- **Descrição** (textarea, max 200 chars, opcional)
- **Categoria*** (select - pré-selecionada se vier da tela de categorias)

#### Implementação UI
- Gerenciar dentro da tela de Categorias
- Opções de implementação:
  1. Accordion expansível no card da categoria
  2. Modal que abre ao clicar em "Gerenciar Subcategorias"
  3. Seção colapsável abaixo do card

#### Regras de Negócio
- Subcategoria só pode existir vinculada a uma categoria
- `ON DELETE CASCADE`: ao excluir categoria, excluir subcategorias
- Nome único dentro da mesma categoria

---

### 6. CLASSIFICAÇÕES (Classifications)

#### Schema do Banco de Dados
```sql
CREATE TABLE public.classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own classifications"
  ON public.classifications FOR ALL
  USING (auth.uid() = user_id);
```

#### Interface TypeScript
```typescript
interface Classification {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}
```

#### Campos do Formulário
- **Nome*** (text input, max 50 chars)
- **Descrição** (textarea, max 200 chars, opcional)
- **Cor** (color picker - paleta shadcn)
- **Ícone** (seletor de ícones lucide-react)

#### Uso no Sistema
- Referenciada em:
  - Beneficiários (payees)
  - Categorias
- Não pode ser excluída se houver referências

---

## 🎨 PADRÕES DE INTERFACE

### Paleta de Cores shadcn
```typescript
const shadcnColors = [
  '#0f172a', // slate-900
  '#1e293b', // slate-800
  '#334155', // slate-700
  '#64748b', // slate-500
  '#00665C', // verde Sollyd (adicionar)
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#0ea5e9', // sky-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#a855f7', // purple-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
];
```

### Estrutura de Card (Padrão)
```jsx
<Card className="relative group hover:shadow-lg transition-shadow">
  <CardHeader className="flex flex-row items-center gap-4">
    <div 
      className="w-12 h-12 rounded-lg flex items-center justify-center"
      style={{ backgroundColor: item.color }}
    >
      <Icon name={item.icon} className="w-6 h-6 text-white" />
    </div>
    <div className="flex-1">
      <CardTitle>{item.name}</CardTitle>
      {item.description && (
        <CardDescription>{item.description}</CardDescription>
      )}
    </div>
  </CardHeader>
  
  <CardFooter className="flex justify-end gap-2">
    <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
      <Pencil className="w-4 h-4" />
    </Button>
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => onDelete(item)}
      className="text-destructive"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  </CardFooter>
</Card>
```

### Layout Responsivo
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <EntityCard key={item.id} item={item} />)}
</div>
```

### Estado Vazio
```jsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
    <Icon className="w-8 h-8 text-muted-foreground" />
  </div>
  <h3 className="text-lg font-semibold mb-2">Nenhum item cadastrado</h3>
  <p className="text-muted-foreground mb-4">
    Comece criando seu primeiro item
  </p>
  <Button onClick={() => setIsModalOpen(true)}>
    <Plus className="w-4 h-4 mr-2" />
    Adicionar
  </Button>
</div>
```

---

## 🔧 COMPONENTES REUTILIZÁVEIS

### ColorPicker Component
```typescript
interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
}

export function ColorPicker({ value, onChange, colors = shadcnColors }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <div className="w-6 h-6 rounded mr-2" style={{ backgroundColor: value }} />
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid grid-cols-6 gap-2">
          {colors.map(color => (
            <button
              key={color}
              className="w-8 h-8 rounded hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### IconPicker Component
```typescript
import * as Icons from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const iconList = [
    'Wallet', 'CreditCard', 'Banknote', 'DollarSign',
    'User', 'Users', 'Building', 'Store',
    'ShoppingCart', 'ShoppingBag', 'Package',
    'Home', 'Car', 'Utensils', 'Coffee',
    'Heart', 'Star', 'Tag', 'Bookmark',
    // Adicionar mais conforme necessário
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {React.createElement(Icons[value as keyof typeof Icons], { className: "w-4 h-4 mr-2" })}
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid grid-cols-6 gap-2">
          {iconList.map(iconName => {
            const Icon = Icons[iconName as keyof typeof Icons];
            return (
              <button
                key={iconName}
                className="p-2 hover:bg-accent rounded"
                onClick={() => onChange(iconName)}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

---

## 📝 PADRÕES DE FORMULÁRIO

### Regras de Validação (Zod)
```typescript
import { z } from 'zod';

const walletSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Máximo 50 caracteres'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida'),
  logo: z.string().optional(),
});

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Máximo 50 caracteres'),
  description: z.string().min(1, 'Descrição é obrigatória').max(200, 'Máximo 200 caracteres'),
  classification_id: z.string().uuid().optional(),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida'),
});
```

### Tratamento de Erros nos Labels
⚠️ **IMPORTANTE**: Seguir padrão Sollyd de erros em formulários:

```jsx
<div>
  <Label 
    htmlFor="name" 
    className={errors.name ? 'text-destructive' : ''}
  >
    Nome *
  </Label>
  <Input
    id="name"
    {...register('name')}
    className={errors.name ? 'border-destructive' : ''}
  />
  {/* NÃO exibir caption em estado de erro */}
  {!errors.name && (
    <p className="text-sm text-muted-foreground mt-1">
      Digite o nome do item
    </p>
  )}
  {errors.name && (
    <p className="text-sm text-destructive mt-1">
      {errors.name.message}
    </p>
  )}
</div>
```

---

## 🔐 INTEGRAÇÃO COM SUPABASE

### Hook Reutilizável para CRUD
```typescript
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

export function useEntityCRUD<T>(tableName: string) {
  const supabase = useSupabaseClient();
  const user = useUser();

  const fetchAll = async (): Promise<T[]> => {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as T[];
  };

  const create = async (values: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> => {
    const { data, error } = await supabase
      .from(tableName)
      .insert([{ ...values, user_id: user?.id }])
      .select()
      .single();

    if (error) throw error;
    return data as T;
  };

  const update = async (id: string, values: Partial<T>): Promise<T> => {
    const { data, error } = await supabase
      .from(tableName)
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user?.id)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  };

  const remove = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .eq('user_id', user?.id);

    if (error) throw error;
  };

  return { fetchAll, create, update, remove };
}
```

### Uso do Hook
```typescript
const WalletsPage = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => entityCRUD.fetchAll(),
  });

  const createMutation = useMutation({
    mutationFn: entityCRUD.create,
    onSuccess: () => {
      refetch();
      toast.success('Carteira criada com sucesso!');
    },
  });

  // ... resto do componente
};
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Para Cada Entidade:

#### 1. Database
- [ ] Criar tabela no Supabase
- [ ] Habilitar RLS
- [ ] Criar policy de acesso por `user_id`
- [ ] Criar índices necessários
- [ ] Testar inserção manual

#### 2. TypeScript
- [ ] Criar interface da entidade
- [ ] Criar schema de validação (Zod)
- [ ] Criar tipos para formulário

#### 3. Componentes
- [ ] Criar componente de Card
- [ ] Criar componente de Formulário (Dialog)
- [ ] Criar componente de Listagem
- [ ] Criar Alert de Confirmação de Exclusão

#### 4. Lógica
- [ ] Implementar hook de CRUD
- [ ] Implementar queries (React Query)
- [ ] Implementar mutations
- [ ] Tratar estados de loading/error

#### 5. Testes
- [ ] Testar criação
- [ ] Testar edição
- [ ] Testar exclusão
- [ ] Testar validações
- [ ] Testar responsividade

---

## 🚨 PONTOS CRÍTICOS DE ATENÇÃO

### 1. RLS e user_id
⚠️ **SEMPRE incluir `user_id` em todas as operações!**

```typescript
// ✅ CORRETO
const { data } = await supabase
  .from('wallets')
  .insert([{ ...values, user_id: user?.id }]);

// ❌ ERRADO - Vai falhar no RLS
const { data } = await supabase
  .from('wallets')
  .insert([values]);
```

### 2. Tabela Unificada payees
⚠️ **Pagadores e Favorecidos usam a mesma tabela!**

```typescript
// Pagadores (usado em Receitas)
const payers = await supabase
  .from('payees')
  .select('*')
  .eq('user_id', user?.id);

// Favorecidos (usado em Despesas)
const beneficiaries = await supabase
  .from('payees')
  .select('*')
  .eq('user_id', user?.id);
```

### 3. Subcategorias sem Tab
⚠️ **NÃO criar rota/tab separada para subcategorias!**

Implementar dentro da página de Categorias:
- Opção 1: Accordion no card
- Opção 2: Modal ao clicar no botão
- Opção 3: Seção expansível

### 4. Limpeza de Dados Mockados
⚠️ **Antes do deploy em produção:**

```sql
-- Executar script de limpeza
DELETE FROM public.payees 
WHERE user_id IS NULL 
   OR name ILIKE '%mock%' 
   OR name ILIKE '%teste%';
```

### 5. Validação de Dependências
Antes de excluir, verificar relações:

```typescript
const canDelete = async (categoryId: string) => {
  const { count } = await supabase
    .from('subcategories')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId);

  if (count > 0) {
    throw new Error('Não é possível excluir categoria com subcategorias vinculadas');
  }
};
```

---

## 📚 ESTRUTURA DE ARQUIVOS SUGERIDA

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── cadastros/
│   │   │   ├── carteiras/
│   │   │   │   └── page.tsx
│   │   │   ├── pagadores/
│   │   │   │   └── page.tsx
│   │   │   ├── favorecidos/
│   │   │   │   └── page.tsx
│   │   │   ├── categorias/
│   │   │   │   └── page.tsx
│   │   │   └── classificacoes/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   └── layout.tsx
├── components/
│   ├── cadastros/
│   │   ├── EntityCard.tsx
│   │   ├── EntityForm.tsx
│   │   ├── EntityList.tsx
│   │   ├── ColorPicker.tsx
│   │   └── IconPicker.tsx
│   └── ui/ (shadcn components)
├── hooks/
│   └── useEntityCRUD.ts
├── lib/
│   ├── supabase.ts
│   └── validations/
│       ├── wallet.ts
│       ├── category.ts
│       └── ...
└── types/
    └── entities.ts
```

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO SUGERIDA

### Sprint 1: Fundação
1. Criar componentes base (ColorPicker, IconPicker, EntityCard)
2. Criar hook genérico de CRUD
3. Implementar **Classificações** (sem dependências)

### Sprint 2: Cadastros Simples
4. Implementar **Carteiras**
5. Implementar **Pagadores** (usando tabela payees)

### Sprint 3: Cadastros Relacionais
6. Implementar **Categorias**
7. Implementar **Subcategorias** (dentro de Categorias)
8. Implementar **Favorecidos** (usando tabela payees + classifications)

### Sprint 4: Finalização
9. Remover tab "Subcategorias" do menu
10. Script de limpeza de dados mockados
11. Testes end-to-end
12. Deploy

---

## 📞 REFERÊNCIAS TÉCNICAS

### Documentação
- **Next.js**: https://nextjs.org/docs
- **shadcn/ui**: https://ui.shadcn.com/
- **Supabase**: https://supabase.com/docs
- **Lucide Icons**: https://lucide.dev/icons/
- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev/

### Padrões Sollyd
- Cor principal: `#00665C`
- Labels vermelhos em erro
- Sem caption em campos com erro
- RLS obrigatório em todas as tabelas
- `user_id` em todas as operações

---

**Versão**: 1.0  
**Última Atualização**: Janeiro 2026  
**Status**: Pronto para desenvolvimento
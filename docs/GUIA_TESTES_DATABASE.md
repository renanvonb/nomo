# Guia de Testes de Conexão do Banco de Dados

## 🚀 Como Executar os Testes

### Pré-requisitos

1. Certifique-se de que o arquivo `.env.local` está configurado com:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
   ```

2. Instale as dependências (se ainda não instalou):
   ```bash
   npm install
   ```

### Opção 1: Teste Simples (Recomendado)

Este teste é o mais direto e fornece output claro:

```bash
npx tsx scripts/simple-crud-test.ts
```

**O que ele faz:**
- Testa operações CRUD em 7 tabelas principais
- Mostra progresso em tempo real
- Exibe resumo final com taxa de sucesso

**Requer:** Usuário autenticado (faça login no app primeiro)

### Opção 2: Verificação de Estrutura

Este teste NÃO requer autenticação:

```bash
npx tsx scripts/verify-database-structure.ts
```

**O que ele faz:**
- Verifica se todas as tabelas existem
- Testa acessibilidade básica
- Não executa operações de escrita

**Requer:** Apenas variáveis de ambiente configuradas

### Opção 3: Teste Completo

Este é o teste mais abrangente:

```bash
npx tsx scripts/test-database-connections.ts
```

**O que ele faz:**
- Testa CRUD completo em todas as tabelas
- Inclui operações de setup e cleanup
- Gera métricas detalhadas de performance
- Testa relacionamentos entre tabelas

**Requer:** Usuário autenticado

## 📊 Interpretando os Resultados

### Símbolos:
- ✅ = Operação bem-sucedida
- ❌ = Operação falhou
- ⚠️ = Aviso ou atenção necessária

### Exemplo de Output Esperado:

```
=== TESTE DE CONEXÕES DO BANCO DE DADOS ===

✅ Usuário autenticado: usuario@email.com

📦 Testando WALLETS...
   ✅ READ: 5 registros
   ✅ CREATE: ID abc-123-def
   ✅ UPDATE: Sucesso
   ✅ DELETE: Sucesso

...

=== RESUMO ===

Total de tabelas testadas: 7
Sucessos: 7
Falhas: 0
Taxa de sucesso: 100.00%

✅ TODAS AS OPERAÇÕES CRUD ESTÃO FUNCIONANDO CORRETAMENTE!
```

## 🔧 Solução de Problemas

### Erro: "Usuário não autenticado"

**Solução:**
1. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
2. Acesse http://localhost:3000
3. Faça login no sistema
4. Execute o teste novamente

### Erro: "Variáveis de ambiente não encontradas"

**Solução:**
1. Verifique se o arquivo `.env.local` existe na raiz do projeto
2. Confirme que as variáveis estão corretas:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica_aqui
   ```

### Erro: "Sem permissão para..."

**Possíveis causas:**
1. RLS (Row Level Security) não configurado corretamente
2. Usuário não tem permissões adequadas
3. Políticas de segurança do Supabase bloqueando acesso

**Solução:**
1. Verifique as políticas RLS no Supabase Dashboard
2. Confirme que o usuário está autenticado
3. Revise os logs de erro para detalhes específicos

### Erro de Conexão

**Solução:**
1. Verifique sua conexão com a internet
2. Confirme que o projeto Supabase está ativo
3. Teste a URL do Supabase em um navegador

## 📝 Testes Manuais via Interface

Se preferir testar manualmente através da interface:

1. **Wallets:**
   - Acesse `/cadastros`
   - Aba "Carteiras"
   - Teste: Adicionar, Editar, Excluir

2. **Favorecidos:**
   - Acesse `/cadastros`
   - Aba "Favorecidos"
   - Teste: Adicionar, Editar, Excluir

3. **Pagadores:**
   - Acesse `/cadastros`
   - Aba "Pagadores"
   - Teste: Adicionar, Editar, Excluir

4. **Categorias:**
   - Acesse `/cadastros`
   - Abas "Categorias de Receita" e "Categorias de Despesa"
   - Teste: Adicionar, Editar, Excluir

5. **Transações:**
   - Acesse `/financeiro/transacoes`
   - Teste: Adicionar, Editar, Excluir transações

## 🎯 Checklist Rápido

Antes de considerar os testes concluídos, verifique:

- [ ] Teste simples executado com 100% de sucesso
- [ ] Todas as 7 tabelas principais testadas
- [ ] Operações CREATE funcionando
- [ ] Operações READ retornando dados
- [ ] Operações UPDATE modificando registros
- [ ] Operações DELETE removendo registros
- [ ] Sem erros de permissão
- [ ] Sem erros de autenticação
- [ ] Relacionamentos entre tabelas funcionando (joins)

## 📚 Documentação Adicional

Para mais detalhes, consulte:
- `docs/database-connections-report.md` - Relatório completo
- `lib/supabase/cadastros.ts` - Implementação das operações
- `app/actions/transactions.ts` - Server actions de transações

## 💡 Dicas

1. **Execute os testes regularmente** após mudanças no banco de dados
2. **Use o teste de estrutura** para verificação rápida sem autenticação
3. **Teste simples** é ideal para CI/CD pipelines
4. **Teste completo** é melhor para debugging profundo

---

**Última Atualização:** 12/01/2026  
**Versão:** 1.0

# 🛠️ Setup do Supabase - Twala Insights

## 📋 Diagnóstico Atual

✅ **Conexão**: Estabelecida com sucesso  
❌ **Tabelas**: Não existem no banco de dados  
❌ **Dados**: Nenhum ativo cadastrado  
❌ **Políticas RLS**: Não configuradas  

## 🚀 Solução: Executar Schema SQL

### Passo 1: Acessar o SQL Editor

1. Acesse: [Supabase Dashboard - SQL Editor](https://supabase.com/dashboard/project/kuqpzmlocsvtkphsgpkq/sql)
2. Faça login se necessário
3. Clique em "New Query" ou use o editor existente

### Passo 2: Executar o Schema Completo

1. **Copie todo o conteúdo** do arquivo `supabase-schema-optimized.sql`
2. **Cole no SQL Editor** do Supabase
3. **Clique em "Run"** para executar

### Passo 3: Verificar Execução

Após executar o script, você deve ver:

✅ **Tabelas criadas**:
- `custody_accounts` - Contas de custódia dos usuários
- `transactions` - Transações de compra/venda
- `assets` - Ativos da BODIVA (ações angolanas)

✅ **Dados iniciais inseridos**:
- 11+ ativos angolanos (BFA, BIC, BPC, ENH, etc.)
- Setores: Bancos, Energia, Mineração, Telecomunicações
- Preços e informações de mercado

✅ **Políticas de segurança (RLS)**:
- Usuários só veem suas próprias contas e transações
- Ativos são públicos para todos

✅ **Funções auxiliares**:
- `get_portfolio_value()` - Calcula valor da carteira
- `get_user_transactions()` - Lista transações do usuário

## 🔍 Verificação Pós-Setup

Após executar o schema, execute:

```bash
node check-supabase-setup.js
```

Você deve ver:
```
✅ Conexão estabelecida
✅ assets: Existe (com dados)
✅ custody_accounts: Existe (vazia)
✅ transactions: Existe (vazia)
📈 11 ativos encontrados:
   • BFA - Banco de Fomento Angola (Bancos)
   • BIC - Banco de Investimento Comercial (Bancos)
   • BPC - Banco de Poupança e Crédito (Bancos)
   ...
```

## 📊 Estrutura das Tabelas

### `assets` (Ativos da BODIVA)
```sql
- ticker (TEXT) - Código do ativo (BFA, BIC, etc.)
- name (TEXT) - Nome da empresa
- sector (TEXT) - Setor (Bancos, Energia, etc.)
- current_price (DECIMAL) - Preço atual em AOA
- market_cap (BIGINT) - Capitalização de mercado
- dividend_yield (DECIMAL) - Rendimento de dividendos
```

### `custody_accounts` (Contas de Custódia)
```sql
- user_id (UUID) - ID do usuário autenticado
- name (TEXT) - Nome da conta
- institution (TEXT) - Banco/Corretora
- account_number (TEXT) - Número da conta
```

### `transactions` (Transações)
```sql
- user_id (UUID) - ID do usuário
- custody_account_id (UUID) - Conta utilizada
- asset_id (TEXT) - Ticker do ativo
- type (TEXT) - 'BUY' ou 'SELL'
- quantity (DECIMAL) - Quantidade
- price (DECIMAL) - Preço unitário
- total (DECIMAL) - Valor total
```

## 🔒 Segurança (Row Level Security)

O sistema implementa RLS para garantir que:

- ✅ Usuários só veem suas próprias contas de custódia
- ✅ Usuários só veem suas próprias transações
- ✅ Todos podem ver os ativos (dados públicos de mercado)
- ✅ Auditoria completa de todas as operações

## 🚨 Troubleshooting

### Erro: "relation does not exist"
**Solução**: Execute o schema SQL completo

### Erro: "permission denied"
**Solução**: Verifique se está logado como owner do projeto

### Erro: "duplicate key value"
**Solução**: Normal se executar o script múltiplas vezes (usa `ON CONFLICT DO NOTHING`)

## 📞 Suporte

Se encontrar problemas:
1. Verifique se está no projeto correto: `kuqpzmlocsvtkphsgpkq`
2. Confirme que tem permissões de administrador
3. Execute `node check-supabase-setup.js` para diagnóstico

---

**Próximo passo**: Após setup, o sistema estará pronto para:
- ✅ Cadastrar contas de custódia
- ✅ Registrar transações de compra/venda
- ✅ Visualizar carteira e performance
- ✅ Calcular rentabilidade em tempo real
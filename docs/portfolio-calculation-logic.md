# Lógica Unificada de Cálculo de Portfólio

## 🎯 Objetivo

Eliminar inconsistências entre diferentes componentes que calculavam valores de portfólio de forma diferente, criando uma **fonte única da verdade** para todos os cálculos.

## 🔧 Problemas Resolvidos

### Antes (Problemas)
- **PortfolioStats** e **PerformanceOverview** tinham lógicas diferentes
- Valores inconsistentes entre cards superiores (+2.26%) e seção detalhada (-4.48%)
- Código duplicado e complexo em múltiplos componentes
- Difícil manutenção e debugging

### Depois (Solução)
- **Uma única função** `calculatePortfolioStats()` centraliza todos os cálculos
- **Valores consistentes** em todos os componentes
- **Código simplificado** e reutilizável
- **Fácil manutenção** e debugging

## 📊 Nova Lógica de Cálculo

### 1. Processamento por Tipo de Transação

#### **BUY (Compra)**
```typescript
// Adicionar quantidade e investimento
newQuantity = position.quantity + transaction.quantity
newTotalInvested = position.totalInvested + transaction.total
position.averagePrice = newTotalInvested / newQuantity
```

#### **SELL (Venda)**
```typescript
// Calcular lucro realizado e reduzir posição
soldRatio = transaction.quantity / position.quantity
soldInvestedValue = position.totalInvested * soldRatio
saleProfit = transaction.total - soldInvestedValue

position.realizedProfit += saleProfit
position.quantity -= transaction.quantity
position.totalInvested -= soldInvestedValue
```

#### **DIVIDEND/INTEREST (Proventos)**
```typescript
// Adicionar ao income (não afeta quantidade)
position.totalIncome += transaction.total
```

### 2. Cálculo de Valores Atuais

```typescript
// Apenas para posições ativas (quantity > 0)
position.currentValue = position.quantity * position.currentPrice
position.unrealizedProfit = position.currentValue - position.totalInvested
position.unrealizedProfitPercent = (position.unrealizedProfit / position.totalInvested) * 100
```

### 3. Retorno Total por Ativo

```typescript
position.totalReturn = position.unrealizedProfit + position.realizedProfit + position.totalIncome
position.totalReturnPercent = (position.totalReturn / position.totalInvested) * 100
```

### 4. Totais do Portfólio

```typescript
totalInvested = sum(buyTransactions.total)
totalSold = sum(sellTransactions.total)
totalIncome = sum(dividendTransactions.total + interestTransactions.total)
currentValue = sum(activePositions.currentValue)
totalReturn = sum(allPositions.totalReturn)
totalReturnPercent = (totalReturn / totalInvested) * 100
```

## 🏗️ Arquitetura

### Função Principal
```typescript
function calculatePortfolioStats(transactions: Transaction[], assets: Asset[]): PortfolioCalculation
```

### Interface de Retorno
```typescript
interface PortfolioCalculation {
  // Valores principais
  totalInvested: number      // Total investido (apenas compras)
  totalSold: number          // Total vendido (apenas vendas)
  totalIncome: number        // Total de proventos (dividendos + juros)
  currentValue: number       // Valor atual da carteira
  totalReturn: number        // Retorno total (lucro/prejuízo + proventos)
  totalReturnPercent: number // Retorno percentual
  
  // Detalhes por ativo
  positions: AssetPosition[]
  
  // Contadores
  totalTransactions: number
  uniqueAssets: number
}
```

## 🔄 Componentes Atualizados

### 1. PortfolioStats
- **Antes**: 100+ linhas de lógica complexa
- **Depois**: 10 linhas usando `calculatePortfolioStats()`

### 2. PerformanceOverview
- **Antes**: Lógica duplicada e inconsistente
- **Depois**: Mesma função unificada

### 3. PortfolioAssetsTable
- **Antes**: Cálculos separados
- **Depois**: Usa posições da função unificada

### 4. DebugTransactions
- **Antes**: Cálculos manuais
- **Depois**: Mostra resultados da função unificada

## ✅ Benefícios

### Para Desenvolvedores
- **Manutenibilidade**: Uma única função para manter
- **Consistência**: Valores sempre iguais em todos os lugares
- **Testabilidade**: Fácil de testar uma função isolada
- **Debugging**: Um único ponto para debugar cálculos

### Para Usuários
- **Confiança**: Valores consistentes em toda a aplicação
- **Clareza**: Não há mais confusão com valores diferentes
- **Precisão**: Cálculos corretos e auditáveis

## 🧪 Como Testar

### 1. Verificar Consistência
```typescript
// Todos os componentes devem mostrar os mesmos valores
const calculation = calculatePortfolioStats(transactions, assets)
console.log('Retorno:', calculation.totalReturnPercent)
```

### 2. Debug Component
O componente `DebugTransactions` mostra todos os valores calculados para verificação manual.

### 3. Cenários de Teste
- Portfólio vazio
- Apenas compras
- Compras + vendas
- Compras + vendas + proventos
- Vendas totais (posição zerada)

## 🚀 Próximos Passos

1. **Testes Unitários**: Criar testes para `calculatePortfolioStats()`
2. **Validação**: Adicionar validações de entrada
3. **Performance**: Otimizar para grandes volumes de transações
4. **Cache**: Implementar cache para evitar recálculos desnecessários

## 📝 Exemplo de Uso

```typescript
import { calculatePortfolioStats } from '@/lib/portfolio'

// Em qualquer componente
const calculation = calculatePortfolioStats(transactions, assets)

// Usar valores consistentes
const totalValue = calculation.currentValue
const totalReturn = calculation.totalReturnPercent
const positions = calculation.positions
```

---

**Resultado**: Agora todos os componentes mostram **exatamente os mesmos valores**, eliminando a confusão e aumentando a confiança do usuário no sistema. 
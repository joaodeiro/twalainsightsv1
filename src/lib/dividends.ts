import type { Transaction, Asset } from '@/types'
import type { Dividend, AssetDividendSummary } from '@/types/dividend'

/**
 * Calcula detalhes de proventos conforme documento
 */
export function calculateDividendDetails(
  valuePerUnit: number,
  affectedQuantity: number,
  currentAveragePrice: number
): {
  totalValue: number
  yieldPercent: number
  effectOnAveragePrice: number
} {
  const totalValue = valuePerUnit * affectedQuantity
  const yieldPercent = currentAveragePrice > 0 ? (valuePerUnit / currentAveragePrice) * 100 : 0
  
  return {
    totalValue,
    yieldPercent,
    effectOnAveragePrice: 0 // Dividendos não afetam preço médio
  }
}

/**
 * Calcula bonificação conforme documento
 * "Novo Custo Médio = (Custo Médio Atual * Quantidade Atual) / (Quantidade Atual + Quantidade Bonificada)"
 */
export function calculateBonusShares(
  currentQuantity: number,
  currentAveragePrice: number,
  bonusQuantity: number
): {
  newQuantity: number
  newAveragePrice: number
  totalValue: number // Valor não muda, apenas dilui
} {
  const newQuantity = currentQuantity + bonusQuantity
  const totalInvestment = currentQuantity * currentAveragePrice
  const newAveragePrice = newQuantity > 0 ? totalInvestment / newQuantity : 0
  
  return {
    newQuantity,
    newAveragePrice,
    totalValue: totalInvestment // Valor total permanece o mesmo
  }
}

/**
 * Consolida proventos por ativo para análise
 */
export function consolidateDividendsByAsset(
  transactions: Transaction[],
  assets: Asset[]
): AssetDividendSummary[] {
  const dividendMap = new Map<string, AssetDividendSummary>()
  
  // Filtrar apenas proventos
  const dividendTransactions = transactions.filter(t => 
    t.type === 'DIVIDEND' || t.type === 'INTEREST'
  )
  
  dividendTransactions.forEach(transaction => {
    const asset = assets.find(a => a.id === transaction.assetId)
    if (!asset) return
    
    let summary = dividendMap.get(transaction.assetId)
    
    if (!summary) {
      summary = {
        assetId: transaction.assetId,
        assetName: asset.name,
        totalDividendsReceived: 0,
        totalInterestReceived: 0,
        totalBonusShares: 0,
        averageYield: 0,
        lastPaymentDate: null,
        paymentsCount: 0,
        yearlyBreakdown: []
      }
      dividendMap.set(transaction.assetId, summary)
    }
    
    // Atualizar valores
    const effectiveTotal = transaction.totalOperationValue || transaction.total || 0
    if (transaction.type === 'DIVIDEND') {
      summary.totalDividendsReceived += effectiveTotal
    } else {
      summary.totalInterestReceived += effectiveTotal
    }
    
    if (transaction.bonusQuantity) {
      summary.totalBonusShares += transaction.bonusQuantity
    }
    
    summary.paymentsCount++
    
    // Atualizar última data de pagamento
    const paymentDate = transaction.paymentDate || transaction.operationDate || transaction.date || new Date()
    if (!summary.lastPaymentDate || paymentDate > summary.lastPaymentDate) {
      summary.lastPaymentDate = paymentDate
    }
    
    // Atualizar breakdown anual
    const year = paymentDate.getFullYear()
    let yearBreakdown = summary.yearlyBreakdown.find(y => y.year === year)
    
    if (!yearBreakdown) {
      yearBreakdown = {
        year,
        totalValue: 0,
        paymentsCount: 0,
        averageYield: 0
      }
      summary.yearlyBreakdown.push(yearBreakdown)
    }
    
    yearBreakdown.totalValue += effectiveTotal
    yearBreakdown.paymentsCount++
  })
  
  // Calcular yields médios
  dividendMap.forEach(summary => {
    const totalReceived = summary.totalDividendsReceived + summary.totalInterestReceived
    // TODO: Calcular yield baseado no preço médio de compra histórico
    summary.averageYield = 0 // Placeholder - precisa da lógica de custo médio
    
    // Ordenar breakdown por ano
    summary.yearlyBreakdown.sort((a, b) => b.year - a.year)
  })
  
  return Array.from(dividendMap.values()).sort((a, b) => 
    b.totalDividendsReceived + b.totalInterestReceived - 
    (a.totalDividendsReceived + a.totalInterestReceived)
  )
}

/**
 * Converter Transaction legada para formato de Dividend expandido
 */
export function transactionToDividend(transaction: Transaction): Dividend | null {
  if (transaction.type !== 'DIVIDEND' && transaction.type !== 'INTEREST') {
    return null
  }
  
  const effectiveTotal = transaction.totalOperationValue || transaction.total || 0
  
  return {
    id: transaction.id,
    userId: transaction.userId,
    custodyAccountId: transaction.custodyAccountId,
    assetId: transaction.assetId,
    type: transaction.type === 'DIVIDEND' ? 'DIVIDEND' : 'INTEREST',
    paymentDate: transaction.paymentDate || transaction.operationDate || transaction.date || new Date(),
    recordDate: transaction.recordDate || transaction.operationDate || transaction.date || new Date(),
    valuePerUnit: transaction.valuePerUnit || (effectiveTotal / transaction.quantity),
    affectedQuantity: transaction.quantity,
    totalValue: effectiveTotal,
    bonusQuantity: transaction.bonusQuantity,
    description: transaction.notes || `${transaction.type} recebido`,
    source: transaction.source || transaction.broker || 'Não informado',
    currency: 'AOA',
    taxWithheld: transaction.taxWithheld,
    notes: transaction.notes,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt
  }
}
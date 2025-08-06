import { supabase } from './supabase'
import type { Transaction, Asset } from '@/types'

// =====================================================
// LÓGICA UNIFICADA DE CÁLCULO DE PORTFÓLIO
// =====================================================

export interface PortfolioCalculation {
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

export interface AssetPosition {
  assetId: string
  assetName: string
  assetSymbol: string
  currentPrice: number
  quantity: number
  averagePrice: number
  totalInvested: number
  currentValue: number
  unrealizedProfit: number
  unrealizedProfitPercent: number
  realizedProfit: number
  totalIncome: number
  totalReturn: number
  totalReturnPercent: number
}

/**
 * Calcula estatísticas completas do portfólio
 * LÓGICA SIMPLIFICADA E UNIFICADA
 */
/**
 * Calcula estatísticas completas do portfólio
 * VERSÃO APRIMORADA - INTEGRA TAXAS E PROVENTOS CONFORME DOCUMENTO
 */
export function calculatePortfolioStats(
  transactions: Transaction[], 
  assets: Asset[],
  proventos?: import('@/types').Provento[],
  corporateEvents?: import('@/types').CorporateEvent[]
): PortfolioCalculation {
  if (transactions.length === 0 || assets.length === 0) {
    return {
      totalInvested: 0,
      totalSold: 0,
      totalIncome: 0,
      currentValue: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
      positions: [],
      totalTransactions: 0,
      uniqueAssets: 0
    }
  }

  // 1. PROCESSAR TRANSAÇÕES POR ATIVO (EM ORDEM CRONOLÓGICA)
  const positions = new Map<string, AssetPosition>()
  
  // Ordenar transações por data (mais antigas primeiro)
  const sortedTransactions = transactions.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  
  sortedTransactions.forEach(transaction => {
    const asset = assets.find(a => a.id === transaction.assetId)
    if (!asset) return



    const assetId = transaction.assetId
    
    // Inicializar posição se não existir
    if (!positions.has(assetId)) {
      positions.set(assetId, {
        assetId,
        assetName: asset.name,
        assetSymbol: asset.ticker,
        currentPrice: asset.currentPrice,
        quantity: 0,
        averagePrice: 0,
        totalInvested: 0,
        currentValue: 0,
        unrealizedProfit: 0,
        unrealizedProfitPercent: 0,
        realizedProfit: 0,
        totalIncome: 0,
        totalReturn: 0,
        totalReturnPercent: 0
      })
    }

    const position = positions.get(assetId)!

    // 2. APLICAR LÓGICA POR TIPO DE TRANSAÇÃO
    switch (transaction.type) {
      case 'BUY':
        // Compra: INTEGRAR TAXAS conforme documento
        // "Custo Total da Compra = (Quantidade * Preço) + Custos/Taxas"
        const fees = transaction.fees || 0
        const totalCostWithFees = (transaction.quantity * transaction.price) + fees
        
        const newQuantity = position.quantity + transaction.quantity
        const newTotalInvested = position.totalInvested + totalCostWithFees
        
        position.quantity = newQuantity
        position.totalInvested = newTotalInvested
        // Custo médio já inclui taxas automaticamente
        position.averagePrice = newQuantity > 0 ? newTotalInvested / newQuantity : 0
        break

      case 'SELL':
        // Venda: INTEGRAR TAXAS conforme documento  
        // "Valor Total da Venda = (Quantidade * Preço) - Custos/Taxas"
        if (position.quantity >= transaction.quantity) {
          const fees = transaction.fees || 0
          const grossSaleValue = transaction.quantity * transaction.price
          const netSaleValue = grossSaleValue - fees
          
          const soldRatio = transaction.quantity / position.quantity
          const soldInvestedValue = position.totalInvested * soldRatio
          
          // Lucro/prejuízo realizado (já considera taxas)
          const saleProfit = netSaleValue - soldInvestedValue
          position.realizedProfit += saleProfit
          
          // Reduzir quantidade e investimento proporcionalmente
          position.quantity -= transaction.quantity
          position.totalInvested -= soldInvestedValue
          
          // Recalcular preço médio
          position.averagePrice = position.quantity > 0 ? position.totalInvested / position.quantity : 0
        }
        break

      case 'DIVIDEND':
      case 'INTEREST':
        // Proventos: adicionar ao income (não afeta quantidade)
        position.totalIncome += transaction.total
        break
    }
  })

  // 3. CALCULAR VALORES ATUAIS E RETORNOS
  let totalInvested = 0
  let totalSold = 0
  let totalIncome = 0
  let currentValue = 0
  let totalReturn = 0

  positions.forEach(position => {
    // Calcular valor atual (apenas para posições ativas)
    if (position.quantity > 0) {
      position.currentValue = position.quantity * position.currentPrice
      position.unrealizedProfit = position.currentValue - position.totalInvested
      position.unrealizedProfitPercent = position.totalInvested > 0 
        ? (position.unrealizedProfit / position.totalInvested) * 100 
        : 0
      
      currentValue += position.currentValue
      totalInvested += position.totalInvested
    }

    // Calcular retorno total do ativo
    position.totalReturn = position.unrealizedProfit + position.realizedProfit + position.totalIncome
    position.totalReturnPercent = position.totalInvested > 0 
      ? (position.totalReturn / position.totalInvested) * 100 
      : 0

    // Acumular totais
    totalReturn += position.totalReturn
    totalIncome += position.totalIncome
  })



  // Incluir lucro realizado de posições zeradas (vendas totais)
  positions.forEach(position => {
    if (position.quantity === 0 && position.realizedProfit !== 0) {
      totalReturn += position.realizedProfit
    }
  })



  // 4. CALCULAR TOTAIS GERAIS
  const buyTransactions = transactions.filter(t => t.type === 'BUY')
  const sellTransactions = transactions.filter(t => t.type === 'SELL')
  
  totalInvested = buyTransactions.reduce((sum, t) => sum + t.total, 0)
  totalSold = sellTransactions.reduce((sum, t) => sum + t.total, 0)

  // 5. CALCULAR RETORNO PERCENTUAL TOTAL
  // Retorno total inclui: lucro não realizado + lucro realizado + proventos
  // Base para cálculo: total investido (compras)
  const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0



  return {
    totalInvested,
    totalSold,
    totalIncome,
    currentValue,
    totalReturn,
    totalReturnPercent,
    positions: Array.from(positions.values()),
    totalTransactions: transactions.length,
    uniqueAssets: positions.size
  }
}

// =====================================================
// FUNÇÕES LEGADAS (MANTIDAS PARA COMPATIBILIDADE)
// =====================================================

export async function getPortfolioPositions(userId: string): Promise<any[]> {
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })

  if (error) {
    console.error('Erro ao carregar transações:', error)
    return []
  }

  const { data: assets } = await supabase
    .from('assets')
    .select('*')

  if (!assets) return []

  // Usar a nova lógica unificada
  const calculation = calculatePortfolioStats(transactions, assets)
  
  // Converter para formato legado
  return calculation.positions.map(pos => ({
    assetId: pos.assetId,
    assetName: pos.assetName,
    assetSymbol: pos.assetSymbol,
    quantity: pos.quantity,
    averagePrice: pos.averagePrice,
    currentPrice: pos.currentPrice,
    totalInvested: pos.totalInvested,
    currentValue: pos.currentValue,
    profitLoss: pos.unrealizedProfit,
    profitLossPercent: pos.unrealizedProfitPercent
  }))
}

export async function getAvailableAssetsForSale(userId: string): Promise<Asset[]> {
  const positions = await getPortfolioPositions(userId)
  
  const { data: assets } = await supabase
    .from('assets')
    .select('*')

  if (!assets) return []

  return assets.filter(asset => 
    positions.some(pos => pos.assetId === asset.id && pos.quantity > 0)
  )
}

export async function validateSellQuantity(
  userId: string, 
  assetId: string, 
  sellQuantity: number
): Promise<{ valid: boolean; availableQuantity: number; message?: string }> {
  const positions = await getPortfolioPositions(userId)
  const position = positions.find(p => p.assetId === assetId)

  if (!position) {
    return {
      valid: false,
      availableQuantity: 0,
      message: 'Você não possui este ativo na carteira'
    }
  }

  if (sellQuantity > position.quantity) {
    return {
      valid: false,
      availableQuantity: position.quantity,
      message: `Quantidade insuficiente. Você possui ${position.quantity} unidades deste ativo`
    }
  }

  return {
    valid: true,
    availableQuantity: position.quantity
  }
} 
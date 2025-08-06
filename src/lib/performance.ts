// Sistema de Análise de Performance - Twala Insights

import { Transaction, Asset, CustodyAccount } from '@/types'
import { calculatePortfolioStats } from './portfolio'
import { subDays, subMonths, subWeeks, format, isAfter, startOfDay } from 'date-fns'

export interface PerformanceMetrics {
  totalValue: number
  totalInvested: number
  totalReturn: number
  totalReturnPercent: number
  realizedGains: number
  unrealizedGains: number
  dividendsReceived: number
}

export interface PeriodPerformance {
  period: '7d' | '30d' | '90d' | '1y' | 'all'
  label: string
  metrics: PerformanceMetrics
  transactions: Transaction[]
  startDate: Date
  endDate: Date
}

export interface AssetPerformance {
  assetId: string
  assetName: string
  ticker: string
  currentPrice: number
  quantity: number
  totalInvested: number
  currentValue: number
  totalReturn: number
  totalReturnPercent: number
  weight: number // % da carteira
  sector?: string
}

export interface PortfolioDistribution {
  byAsset: AssetPerformance[]
  bySector: { sector: string; value: number; percentage: number; color: string }[]
  byType: { type: string; value: number; percentage: number; color: string }[]
}

export interface TimeSeriesPoint {
  date: string
  value: number
  invested: number
  return: number
  returnPercent: number
}

/**
 * Calcula métricas de performance para um período específico
 */
export function calculatePeriodPerformance(
  transactions: Transaction[],
  assets: Asset[],
  period: '7d' | '30d' | '90d' | '1y' | 'all'
): PeriodPerformance {
  const now = new Date()
  let startDate: Date
  let label: string

  switch (period) {
    case '7d':
      startDate = subDays(now, 7)
      label = 'Últimos 7 dias'
      break
    case '30d':
      startDate = subDays(now, 30)
      label = 'Últimos 30 dias'
      break
    case '90d':
      startDate = subDays(now, 90)
      label = 'Últimos 90 dias'
      break
    case '1y':
      startDate = subDays(now, 365)
      label = 'Último ano'
      break
    default:
      startDate = new Date(2020, 0, 1) // Data bem anterior
      label = 'Desde o início'
  }

  // Filtrar transações do período
  const periodTransactions = transactions.filter(t => 
    isAfter(new Date(t.operationDate || t.date || Date.now()), startDate)
  )

  // Calcular estatísticas da carteira
  const portfolioStats = calculatePortfolioStats(transactions, assets)
  
  // Calcular dividendos recebidos no período
  const dividendsReceived = periodTransactions
    .filter(t => t.type === 'DIVIDEND' || t.type === 'INTEREST')
    .reduce((sum, t) => sum + (t.totalOperationValue || t.total || 0), 0)

  // Calcular ganhos realizados no período (vendas)
  const realizedGains = periodTransactions
    .filter(t => t.type === 'SELL')
    .reduce((sum, t) => {
      const asset = assets.find(a => a.id === t.assetId)
      if (!asset) return sum
      
      // Assumir que o ganho realizado é a diferença entre preço de venda e custo médio
      const position = portfolioStats.positions.find(p => p.assetId === t.assetId)
      if (!position) return sum
      
      const gainPerUnit = (t.unitPrice || t.price || 0) - position.averagePrice
      return sum + (gainPerUnit * t.quantity)
    }, 0)

  const metrics: PerformanceMetrics = {
    totalValue: portfolioStats.currentValue,
    totalInvested: portfolioStats.totalInvested,
    totalReturn: portfolioStats.totalReturn,
    totalReturnPercent: portfolioStats.totalReturnPercent,
    realizedGains,
    unrealizedGains: portfolioStats.totalReturn - realizedGains - dividendsReceived,
    dividendsReceived
  }

  return {
    period,
    label,
    metrics,
    transactions: periodTransactions,
    startDate,
    endDate: now
  }
}

/**
 * Calcula distribuição da carteira por ativos e setores
 */
export function calculatePortfolioDistribution(
  transactions: Transaction[],
  assets: Asset[]
): PortfolioDistribution {
  const portfolioStats = calculatePortfolioStats(transactions, assets)
  const totalValue = portfolioStats.currentValue

  // Performance por ativo
  const byAsset: AssetPerformance[] = portfolioStats.positions.map(position => {
    const asset = assets.find(a => a.id === position.assetId)
    const currentValue = position.quantity * (asset?.currentPrice || 0)
    const totalReturn = currentValue - position.totalInvested + position.realizedProfit
    const weight = totalValue > 0 ? (currentValue / totalValue) * 100 : 0

    return {
      assetId: position.assetId,
      assetName: asset?.name || 'Ativo desconhecido',
      ticker: asset?.ticker || 'N/A',
      currentPrice: asset?.currentPrice || 0,
      quantity: position.quantity,
      totalInvested: position.totalInvested,
      currentValue,
      totalReturn,
      totalReturnPercent: position.totalInvested > 0 ? (totalReturn / position.totalInvested) * 100 : 0,
      weight,
      sector: asset?.sector || 'Outros'
    }
  })

  // Agrupar por setor
  const sectorMap = new Map<string, number>()
  byAsset.forEach(asset => {
    const sector = asset.sector || 'Outros'
    sectorMap.set(sector, (sectorMap.get(sector) || 0) + asset.currentValue)
  })

  const sectorColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ]

  const bySector = Array.from(sectorMap.entries()).map(([sector, value], index) => ({
    sector,
    value,
    percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    color: sectorColors[index % sectorColors.length]
  }))

  // Agrupar por tipo (ações, FIIs, etc.)
  const typeMap = new Map<string, number>()
  byAsset.forEach(asset => {
    const type = getAssetType(asset.ticker)
    typeMap.set(type, (typeMap.get(type) || 0) + asset.currentValue)
  })

  const byType = Array.from(typeMap.entries()).map(([type, value], index) => ({
    type,
    value,
    percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    color: sectorColors[index % sectorColors.length]
  }))

  return {
    byAsset: byAsset.sort((a, b) => b.currentValue - a.currentValue),
    bySector: bySector.sort((a, b) => b.value - a.value),
    byType: byType.sort((a, b) => b.value - a.value)
  }
}

/**
 * Gera série temporal de performance da carteira
 */
export function generateTimeSeriesData(
  transactions: Transaction[],
  assets: Asset[],
  days: number = 365
): TimeSeriesPoint[] {
  const endDate = new Date()
  const startDate = subDays(endDate, days)
  const points: TimeSeriesPoint[] = []
  
  // Gerar pontos diários
  for (let i = 0; i <= days; i++) {
    const currentDate = subDays(endDate, days - i)
    
    // Filtrar transações até esta data
    const transactionsUpToDate = transactions.filter(t => 
      !isAfter(new Date(t.operationDate || t.date || Date.now()), currentDate)
    )
    
    if (transactionsUpToDate.length === 0) {
      points.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        value: 0,
        invested: 0,
        return: 0,
        returnPercent: 0
      })
      continue
    }

    // Calcular valor da carteira nesta data
    const portfolioStats = calculatePortfolioStats(transactionsUpToDate, assets)
    
    points.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      value: portfolioStats.currentValue,
      invested: portfolioStats.totalInvested,
      return: portfolioStats.totalReturn,
      returnPercent: portfolioStats.totalReturnPercent
    })
  }

  return points
}

/**
 * Calcula indicadores de risco
 */
export function calculateRiskMetrics(
  timeSeries: TimeSeriesPoint[]
): {
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  beta: number
} {
  if (timeSeries.length < 2) {
    return { volatility: 0, sharpeRatio: 0, maxDrawdown: 0, beta: 0 }
  }

  // Calcular retornos diários
  const dailyReturns = timeSeries.slice(1).map((point, index) => {
    const previousValue = timeSeries[index].value
    return previousValue > 0 ? (point.value - previousValue) / previousValue : 0
  })

  // Volatilidade (desvio padrão dos retornos * sqrt(252) para anualizar)
  const meanReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length
  const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / dailyReturns.length
  const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100 // Anualizada em %

  // Sharpe Ratio (assumindo taxa livre de risco de 5% ao ano)
  const riskFreeRate = 0.05
  const annualizedReturn = meanReturn * 252
  const sharpeRatio = volatility > 0 ? (annualizedReturn - riskFreeRate) / (volatility / 100) : 0

  // Maximum Drawdown
  let maxValue = timeSeries[0].value
  let maxDrawdown = 0
  
  for (const point of timeSeries) {
    if (point.value > maxValue) {
      maxValue = point.value
    }
    const drawdown = maxValue > 0 ? (maxValue - point.value) / maxValue : 0
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  }

  // Beta (correlação com mercado - por simplicidade, usamos 1.0)
  const beta = 1.0

  return {
    volatility,
    sharpeRatio,
    maxDrawdown: maxDrawdown * 100,
    beta
  }
}

/**
 * Identifica o tipo de ativo baseado no ticker
 */
function getAssetType(ticker: string): string {
  if (ticker.endsWith('11') || ticker.endsWith('11B')) {
    return 'FII'
  }
  if (ticker.includes('BDRS') || ticker.endsWith('34') || ticker.endsWith('35')) {
    return 'BDR'
  }
  if (ticker.endsWith('3') || ticker.endsWith('4')) {
    return 'Ação'
  }
  return 'Outros'
}

/**
 * Formata valores monetários
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formata percentuais
 */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100)
}
// Sistema Completo de Proventos - Twala Insights

import type { 
  Provento, 
  ProventoCalculation, 
  ProventoType,
  Transaction, 
  Asset,
  CustodyAccount 
} from '@/types'

/**
 * Calcula detalhes completos de dividendos/proventos
 * CONFORME DOCUMENTO: Seção 3.1 - Proventos
 */
export function calculateDividendDetails(
  proventos: Provento[],
  transactions: Transaction[],
  assets: Asset[]
): ProventoCalculation {
  
  // Inicializar totais
  let totalDividends = 0
  let totalJCP = 0
  let totalBonifications = 0
  let totalRendimentos = 0
  let totalSubscriptions = 0
  let totalBonusShares = 0
  let totalTaxWithheld = 0

  // Agrupar proventos por ativo
  const proventosByAsset = new Map<string, {
    assetId: string
    assetName: string
    totalIncome: number
    bonusShares: number
    lastProventoDate: string
    proventoCount: number
  }>()

  // Processar cada provento
  proventos.forEach(provento => {
    // Somar por tipo
    switch (provento.type) {
      case 'DIVIDEND':
        totalDividends += provento.totalValue
        break
      case 'JCP':
        totalJCP += provento.totalValue
        break
      case 'BONIFICACAO':
        totalBonifications += provento.totalValue
        totalBonusShares += provento.bonusQuantity || 0
        break
      case 'RENDIMENTO_FUNDO':
        totalRendimentos += provento.totalValue
        break
      case 'SUBSCRICAO':
        totalSubscriptions += provento.totalValue
        break
    }

    // Somar impostos
    totalTaxWithheld += provento.taxWithheld || 0

    // Agrupar por ativo
    const asset = assets.find(a => a.id === provento.assetId)
    if (asset) {
      if (!proventosByAsset.has(provento.assetId)) {
        proventosByAsset.set(provento.assetId, {
          assetId: provento.assetId,
          assetName: asset.name,
          totalIncome: 0,
          bonusShares: 0,
          lastProventoDate: provento.paymentDate,
          proventoCount: 0
        })
      }

      const assetData = proventosByAsset.get(provento.assetId)!
      assetData.totalIncome += provento.totalValue
      assetData.bonusShares += provento.bonusQuantity || 0
      assetData.proventoCount += 1
      
      // Atualizar data mais recente
      if (new Date(provento.paymentDate) > new Date(assetData.lastProventoDate)) {
        assetData.lastProventoDate = provento.paymentDate
      }
    }
  })

  // Calcular totais
  const totalGrossIncome = totalDividends + totalJCP + totalBonifications + totalRendimentos + totalSubscriptions
  const totalNetIncome = totalGrossIncome - totalTaxWithheld

  return {
    totalDividends,
    totalJCP,
    totalBonifications,
    totalRendimentos,
    totalSubscriptions,
    totalGrossIncome,
    totalTaxWithheld,
    totalNetIncome,
    totalBonusShares,
    proventosByAsset: Array.from(proventosByAsset.values())
  }
}

/**
 * Calcula bonificações e seu impacto no custo médio
 * CONFORME DOCUMENTO: "O custo médio do ativo deve ser recalculado para refletir 
 * o aumento da quantidade sem custo adicional, diluindo o custo médio existente"
 */
export function calculateBonusShares(
  currentQuantity: number,
  currentAverageCost: number,
  bonusQuantity: number
): {
  newQuantity: number
  newAverageCost: number
  dilutionFactor: number
} {
  const newQuantity = currentQuantity + bonusQuantity
  
  // Novo custo médio diluído (conforme documento)
  // "Novo Custo Médio = (Custo Médio Atual * Quantidade Atual) / (Quantidade Atual + Quantidade Bonificada)"
  const newAverageCost = currentQuantity > 0 
    ? (currentAverageCost * currentQuantity) / newQuantity
    : 0
  
  const dilutionFactor = currentQuantity > 0 ? newAverageCost / currentAverageCost : 1

  return {
    newQuantity,
    newAverageCost,
    dilutionFactor
  }
}

/**
 * Consolida todos os proventos por ativo para facilitar análise
 */
export function consolidateDividendsByAsset(
  proventos: Provento[],
  assets: Asset[]
): Array<{
  assetId: string
  assetName: string
  assetTicker: string
  
  // Totais por tipo
  dividends: number
  jcp: number
  bonifications: number
  rendimentos: number
  subscriptions: number
  
  // Quantidade de ações recebidas
  totalBonusShares: number
  
  // Impostos
  totalTaxWithheld: number
  netIncome: number
  
  // Histórico
  proventoCount: number
  firstProventoDate?: string
  lastProventoDate?: string
  
  // Yield aproximado (dividendos / preço atual)
  approximateYield: number
}> {
  const consolidation = new Map()

  // Agrupar por ativo
  proventos.forEach(provento => {
    const asset = assets.find(a => a.id === provento.assetId)
    if (!asset) return

    if (!consolidation.has(provento.assetId)) {
      consolidation.set(provento.assetId, {
        assetId: provento.assetId,
        assetName: asset.name,
        assetTicker: asset.ticker,
        dividends: 0,
        jcp: 0,
        bonifications: 0,
        rendimentos: 0,
        subscriptions: 0,
        totalBonusShares: 0,
        totalTaxWithheld: 0,
        netIncome: 0,
        proventoCount: 0,
        firstProventoDate: provento.paymentDate,
        lastProventoDate: provento.paymentDate,
        approximateYield: 0
      })
    }

    const item = consolidation.get(provento.assetId)
    
    // Somar por tipo
    switch (provento.type) {
      case 'DIVIDEND':
        item.dividends += provento.totalValue
        break
      case 'JCP':
        item.jcp += provento.totalValue
        break
      case 'BONIFICACAO':
        item.bonifications += provento.totalValue
        item.totalBonusShares += provento.bonusQuantity || 0
        break
      case 'RENDIMENTO_FUNDO':
        item.rendimentos += provento.totalValue
        break
      case 'SUBSCRICAO':
        item.subscriptions += provento.totalValue
        break
    }

    item.totalTaxWithheld += provento.taxWithheld || 0
    item.netIncome = (item.dividends + item.jcp + item.bonifications + item.rendimentos + item.subscriptions) - item.totalTaxWithheld
    item.proventoCount += 1

    // Atualizar datas
    if (new Date(provento.paymentDate) < new Date(item.firstProventoDate)) {
      item.firstProventoDate = provento.paymentDate
    }
    if (new Date(provento.paymentDate) > new Date(item.lastProventoDate)) {
      item.lastProventoDate = provento.paymentDate
    }

    // Calcular yield aproximado (apenas dividendos / preço atual)
    if (asset.currentPrice > 0) {
      item.approximateYield = (item.dividends / asset.currentPrice) * 100
    }
  })

  return Array.from(consolidation.values())
}

/**
 * Valida se um provento está correto antes de ser salvo
 */
export function validateProvento(
  provento: Partial<Provento>,
  custodyAccounts: CustodyAccount[],
  assets: Asset[]
): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Validações obrigatórias
  if (!provento.custodyAccountId) {
    errors.push('Conta de custódia é obrigatória')
  } else {
    const account = custodyAccounts.find(a => a.id === provento.custodyAccountId)
    if (!account) {
      errors.push('Conta de custódia não encontrada')
    } else if (!account.isActive) {
      warnings.push('Conta de custódia está inativa')
    }
  }

  if (!provento.assetId) {
    errors.push('Ativo é obrigatório')
  } else {
    const asset = assets.find(a => a.id === provento.assetId)
    if (!asset) {
      errors.push('Ativo não encontrado')
    }
  }

  if (!provento.type) {
    errors.push('Tipo de provento é obrigatório')
  }

  if (!provento.paymentDate) {
    errors.push('Data de pagamento é obrigatória')
  } else {
    const paymentDate = new Date(provento.paymentDate)
    if (paymentDate > new Date()) {
      warnings.push('Data de pagamento está no futuro')
    }
  }

  if (provento.totalValue === undefined || provento.totalValue <= 0) {
    errors.push('Valor total deve ser maior que zero')
  }

  if (provento.affectedQuantity === undefined || provento.affectedQuantity <= 0) {
    errors.push('Quantidade afetada deve ser maior que zero')
  }

  // Validações específicas por tipo
  if (provento.type === 'BONIFICACAO') {
    if (!provento.bonusQuantity || provento.bonusQuantity <= 0) {
      errors.push('Quantidade de bonificação é obrigatória para bonificações')
    }
    if (!provento.bonusRatio) {
      warnings.push('Proporção da bonificação não informada')
    }
  }

  // Validações de valores
  if (provento.valuePerUnit && provento.affectedQuantity) {
    const calculatedTotal = provento.valuePerUnit * provento.affectedQuantity
    if (Math.abs(calculatedTotal - (provento.totalValue || 0)) > 0.01) {
      warnings.push('Valor total calculado não confere com o informado')
    }
  }

  if (provento.taxWithheld && provento.taxWithheld > (provento.totalValue || 0)) {
    errors.push('Imposto retido não pode ser maior que o valor total')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}
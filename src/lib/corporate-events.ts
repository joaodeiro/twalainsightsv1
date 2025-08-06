// Sistema de Eventos Corporativos - Twala Insights

import type { 
  CorporateEvent, 
  CorporateEventAdjustment,
  CorporateEventValidation,
  Transaction,
  Asset,
  CustodyAccount
} from '@/types'

/**
 * Aplica evento corporativo a uma posição
 * CONFORME DOCUMENTO: Seção 3.2 - Desdobramentos e Agrupamentos
 */
export function applyCorporateEvent(
  event: CorporateEvent,
  currentQuantity: number,
  currentAverageCost: number,
  currentTotalInvested: number
): {
  newQuantity: number
  newAverageCost: number
  newTotalInvested: number
  newAssetQuantity?: number
  newAssetValue?: number
} {
  
  switch (event.type) {
    case 'SPLIT':
      // Desdobramento: "quantidade * fator, preço / fator"
      // Ex: Split 1:2 -> 100 ações viram 200 ações, preço AOA 20 vira AOA 10
      return {
        newQuantity: currentQuantity * event.quantityFactor,
        newAverageCost: currentAverageCost / event.quantityFactor,
        newTotalInvested: currentTotalInvested // Valor total permanece igual
      }

    case 'REVERSE_SPLIT':
      // Agrupamento: "quantidade / fator, preço * fator"  
      // Ex: Inplit 10:1 -> 100 ações viram 10 ações, preço AOA 2 vira AOA 20
      return {
        newQuantity: currentQuantity / event.quantityFactor,
        newAverageCost: currentAverageCost * event.quantityFactor,
        newTotalInvested: currentTotalInvested // Valor total permanece igual
      }

    case 'BONUS':
      // Bonificação: novas ações sem custo
      // Ex: Bonificação 1:10 -> a cada 10 ações, recebe 1 nova
      const bonusShares = Math.floor(currentQuantity / event.quantityFactor)
      return {
        newQuantity: currentQuantity + bonusShares,
        newAverageCost: currentTotalInvested / (currentQuantity + bonusShares),
        newTotalInvested: currentTotalInvested
      }

    case 'SPINOFF':
      // Spin-off: recebe ações de nova empresa
      const newAssetShares = currentQuantity * (event.newAssetRatio || 1)
      return {
        newQuantity: currentQuantity, // Posição original mantida
        newAverageCost: currentAverageCost,
        newTotalInvested: currentTotalInvested,
        newAssetQuantity: newAssetShares,
        newAssetValue: 0 // Valor inicial será determinado pelo mercado
      }

    case 'RIGHTS_ISSUE':
      // Direitos de subscrição - não altera posição atual automaticamente
      return {
        newQuantity: currentQuantity,
        newAverageCost: currentAverageCost,
        newTotalInvested: currentTotalInvested
      }

    default:
      throw new Error(`Tipo de evento corporativo não suportado: ${event.type}`)
  }
}

/**
 * Ajusta preços históricos após evento corporativo
 * CONFORME DOCUMENTO: Necessário para manter precisão histórica
 */
export function adjustHistoricalPrices(
  transactions: Transaction[],
  event: CorporateEvent
): Transaction[] {
  
  // Filtrar transações anteriores ao evento
  const eventDate = new Date(event.effectiveDate)
  
  return transactions.map(transaction => {
    const transactionDate = new Date(transaction.date || transaction.operationDate)
    
    // Só ajustar transações anteriores ao evento e do mesmo ativo
    if (transactionDate < eventDate && transaction.assetId === event.assetId) {
      let adjustedTransaction = { ...transaction }

      switch (event.type) {
        case 'SPLIT':
          // Ajustar quantidade e preço
          adjustedTransaction.quantity = transaction.quantity * event.quantityFactor
          adjustedTransaction.price = (transaction.price || 0) / event.quantityFactor
          adjustedTransaction.unitPrice = (transaction.unitPrice || transaction.price || 0) / event.quantityFactor
          // Total permanece o mesmo
          break

        case 'REVERSE_SPLIT':
          // Ajustar quantidade e preço (inverso do split)
          adjustedTransaction.quantity = transaction.quantity / event.quantityFactor
          adjustedTransaction.price = (transaction.price || 0) * event.quantityFactor
          adjustedTransaction.unitPrice = (transaction.unitPrice || transaction.price || 0) * event.quantityFactor
          // Total permanece o mesmo
          break

        case 'BONUS':
          // Para bonificações, não ajustamos transações históricas
          // O evento é tratado como uma transação separada
          break

        case 'SPINOFF':
          // Spin-offs não alteram transações históricas do ativo original
          break
      }

      return adjustedTransaction
    }

    return transaction
  })
}

/**
 * Cria evento corporativo com validação
 */
export function createCorporateEvent(
  eventData: Partial<CorporateEvent>,
  assets: Asset[]
): { 
  event?: CorporateEvent
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Validações básicas
  if (!eventData.assetId) {
    errors.push('ID do ativo é obrigatório')
  } else {
    const asset = assets.find(a => a.id === eventData.assetId)
    if (!asset) {
      errors.push('Ativo não encontrado')
    }
  }

  if (!eventData.type) {
    errors.push('Tipo de evento é obrigatório')
  }

  if (!eventData.effectiveDate) {
    errors.push('Data de vigência é obrigatória')
  }

  if (!eventData.adjustmentRatio) {
    errors.push('Proporção de ajuste é obrigatória')
  }

  if (eventData.quantityFactor === undefined || eventData.quantityFactor <= 0) {
    errors.push('Fator de quantidade deve ser maior que zero')
  }

  if (eventData.priceFactor === undefined || eventData.priceFactor <= 0) {
    errors.push('Fator de preço deve ser maior que zero')
  }

  // Validações específicas por tipo
  if (eventData.type === 'SPINOFF') {
    if (!eventData.newAssetId) {
      errors.push('ID do novo ativo é obrigatório para spin-off')
    }
    if (!eventData.newAssetRatio || eventData.newAssetRatio <= 0) {
      errors.push('Proporção do novo ativo deve ser maior que zero')
    }
  }

  if (eventData.type === 'RIGHTS_ISSUE') {
    if (!eventData.subscriptionPrice || eventData.subscriptionPrice <= 0) {
      errors.push('Preço de subscrição é obrigatório para direitos')
    }
    if (!eventData.subscriptionRatio) {
      errors.push('Proporção de subscrição é obrigatória')
    }
  }

  // Validar datas
  if (eventData.effectiveDate && eventData.recordDate) {
    const effective = new Date(eventData.effectiveDate)
    const record = new Date(eventData.recordDate)
    
    if (effective < record) {
      warnings.push('Data de vigência anterior à data de corte')
    }
  }

  if (errors.length === 0) {
    const event: CorporateEvent = {
      id: eventData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
      assetId: eventData.assetId!,
      type: eventData.type!,
      approvalDate: eventData.approvalDate || eventData.effectiveDate!,
      recordDate: eventData.recordDate || eventData.effectiveDate!,
      effectiveDate: eventData.effectiveDate!,
      adjustmentRatio: eventData.adjustmentRatio!,
      quantityFactor: eventData.quantityFactor!,
      priceFactor: eventData.priceFactor!,
      newAssetId: eventData.newAssetId,
      newAssetRatio: eventData.newAssetRatio,
      subscriptionPrice: eventData.subscriptionPrice,
      subscriptionRatio: eventData.subscriptionRatio,
      description: eventData.description || `${eventData.type} ${eventData.adjustmentRatio}`,
      officialNotice: eventData.officialNotice,
      status: eventData.status || 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return { event, errors, warnings }
  }

  return { errors, warnings }
}

/**
 * Valida se um evento corporativo pode ser aplicado
 */
export function validateCorporateEvent(
  event: CorporateEvent,
  transactions: Transaction[],
  custodyAccounts: CustodyAccount[]
): CorporateEventValidation {
  const errors: string[] = []
  const warnings: string[] = []

  // Verificar se há posições do ativo
  const assetTransactions = transactions.filter(t => t.assetId === event.assetId)
  if (assetTransactions.length === 0) {
    warnings.push('Nenhuma transação encontrada para este ativo')
  }

  // Verificar se evento já foi aplicado
  const eventDate = new Date(event.effectiveDate)
  const futureTransactions = assetTransactions.filter(t => {
    const transactionDate = new Date(t.date || t.operationDate)
    return transactionDate > eventDate
  })

  if (futureTransactions.length > 0) {
    warnings.push(`Existem ${futureTransactions.length} transações posteriores ao evento que podem ser afetadas`)
  }

  // Contar posições afetadas
  const accountsWithPosition = new Set(assetTransactions.map(t => t.custodyAccountId))
  const affectedPositions = accountsWithPosition.size

  // Validar status
  if (event.status === 'CANCELLED') {
    errors.push('Não é possível aplicar evento cancelado')
  }

  if (event.status === 'ANNOUNCED' && new Date(event.effectiveDate) <= new Date()) {
    warnings.push('Evento anunciado mas data de vigência já passou')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    affectedPositions
  }
}

/**
 * Calcula o impacto de múltiplos eventos corporativos em sequência
 */
export function calculateCumulativeEvents(
  events: CorporateEvent[],
  initialQuantity: number,
  initialAverageCost: number
): {
  finalQuantity: number
  finalAverageCost: number
  eventChain: Array<{
    event: CorporateEvent
    quantityAfter: number
    averageCostAfter: number
  }>
} {
  // Ordenar eventos por data
  const sortedEvents = events.sort((a, b) => 
    new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime()
  )

  let currentQuantity = initialQuantity
  let currentAverageCost = initialAverageCost
  let currentTotalInvested = initialQuantity * initialAverageCost

  const eventChain = sortedEvents.map(event => {
    const result = applyCorporateEvent(
      event,
      currentQuantity,
      currentAverageCost,
      currentTotalInvested
    )

    currentQuantity = result.newQuantity
    currentAverageCost = result.newAverageCost
    currentTotalInvested = result.newTotalInvested

    return {
      event,
      quantityAfter: currentQuantity,
      averageCostAfter: currentAverageCost
    }
  })

  return {
    finalQuantity: currentQuantity,
    finalAverageCost: currentAverageCost,
    eventChain
  }
}
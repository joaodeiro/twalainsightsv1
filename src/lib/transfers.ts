// Sistema de Transferências entre Contas - Twala Insights

import type { 
  Transfer, 
  TransferValidation,
  TransferHistory,
  Transaction,
  Asset,
  CustodyAccount 
} from '@/types'

/**
 * Valida transferência antes da execução
 * CONFORME DOCUMENTO: Seção 3.3 - Transferências de Ativos
 */
export function validateTransfer(
  transferData: Partial<Transfer>,
  transactions: Transaction[],
  custodyAccounts: CustodyAccount[],
  assets: Asset[]
): TransferValidation {
  const errors: string[] = []
  const warnings: string[] = []

  // Validações básicas
  if (!transferData.fromCustodyAccountId) {
    errors.push('Conta de origem é obrigatória')
  }

  if (!transferData.toCustodyAccountId) {
    errors.push('Conta de destino é obrigatória')
  }

  if (transferData.fromCustodyAccountId === transferData.toCustodyAccountId) {
    errors.push('Conta de origem e destino não podem ser iguais')
  }

  if (!transferData.assetId) {
    errors.push('Ativo é obrigatório')
  }

  if (!transferData.quantity || transferData.quantity <= 0) {
    errors.push('Quantidade deve ser maior que zero')
  }

  // Verificar se contas existem e estão ativas
  const fromAccount = custodyAccounts.find(a => a.id === transferData.fromCustodyAccountId)
  const toAccount = custodyAccounts.find(a => a.id === transferData.toCustodyAccountId)

  if (!fromAccount) {
    errors.push('Conta de origem não encontrada')
  } else if (!fromAccount.isActive) {
    errors.push('Conta de origem está inativa')
  }

  if (!toAccount) {
    errors.push('Conta de destino não encontrada')
  } else if (!toAccount.isActive) {
    warnings.push('Conta de destino está inativa')
  }

  // Verificar se ativo existe
  const asset = assets.find(a => a.id === transferData.assetId)
  if (!asset) {
    errors.push('Ativo não encontrado')
  }

  // Calcular posição atual na conta de origem
  let availableQuantity = 0
  let currentAverageCost = 0
  let currentTotalInvested = 0

  if (transferData.fromCustodyAccountId && transferData.assetId) {
    const assetTransactions = transactions.filter(t => 
      t.custodyAccountId === transferData.fromCustodyAccountId && 
      t.assetId === transferData.assetId
    )

    // Calcular posição usando lógica simplificada
    let quantity = 0
    let totalInvested = 0

    assetTransactions.forEach(transaction => {
      switch (transaction.type) {
        case 'BUY':
          const fees = transaction.fees || 0
          const totalCost = (transaction.quantity * transaction.price) + fees
          quantity += transaction.quantity
          totalInvested += totalCost
          break
        case 'SELL':
          if (quantity >= transaction.quantity) {
            const sellRatio = transaction.quantity / quantity
            const soldInvestment = totalInvested * sellRatio
            quantity -= transaction.quantity
            totalInvested -= soldInvestment
          }
          break
      }
    })

    availableQuantity = quantity
    currentTotalInvested = totalInvested
    currentAverageCost = quantity > 0 ? totalInvested / quantity : 0
  }

  // Verificar disponibilidade
  if (transferData.quantity && transferData.quantity > availableQuantity) {
    errors.push(`Quantidade insuficiente. Disponível: ${availableQuantity}, Solicitado: ${transferData.quantity}`)
  }

  // Calcular posições após transferência
  const transferQuantity = transferData.quantity || 0
  const transferredInvestment = transferQuantity * currentAverageCost

  const sourcePositionAfter = {
    quantity: availableQuantity - transferQuantity,
    averagePrice: currentAverageCost, // Preço médio não muda na origem
    totalInvested: currentTotalInvested - transferredInvestment
  }

  // Para destino, precisamos calcular posição atual também
  let destinationCurrentQuantity = 0
  let destinationCurrentInvested = 0

  if (transferData.toCustodyAccountId && transferData.assetId) {
    const destTransactions = transactions.filter(t => 
      t.custodyAccountId === transferData.toCustodyAccountId && 
      t.assetId === transferData.assetId
    )

    destTransactions.forEach(transaction => {
      switch (transaction.type) {
        case 'BUY':
          const fees = transaction.fees || 0
          const totalCost = (transaction.quantity * transaction.price) + fees
          destinationCurrentQuantity += transaction.quantity
          destinationCurrentInvested += totalCost
          break
        case 'SELL':
          if (destinationCurrentQuantity >= transaction.quantity) {
            const sellRatio = transaction.quantity / destinationCurrentQuantity
            const soldInvestment = destinationCurrentInvested * sellRatio
            destinationCurrentQuantity -= transaction.quantity
            destinationCurrentInvested -= soldInvestment
          }
          break
      }
    })
  }

  // Calcular nova posição de destino (custo médio ponderado)
  const newDestinationQuantity = destinationCurrentQuantity + transferQuantity
  const newDestinationInvested = destinationCurrentInvested + transferredInvestment
  const newDestinationAverageCost = newDestinationQuantity > 0 
    ? newDestinationInvested / newDestinationQuantity 
    : 0

  const destinationPositionAfter = {
    quantity: newDestinationQuantity,
    averagePrice: newDestinationAverageCost,
    totalInvested: newDestinationInvested
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    availableQuantity,
    requestedQuantity: transferData.quantity || 0,
    sourcePositionAfter,
    destinationPositionAfter
  }
}

/**
 * Executa transferência entre contas
 */
export function executeTransfer(
  transfer: Transfer,
  transactions: Transaction[],
  custodyAccounts: CustodyAccount[] = [],
  assets: Asset[] = []
): {
  success: boolean
  sourceTransaction?: Transaction
  destinationTransaction?: Transaction
  errors: string[]
} {
  const errors: string[] = []

  // Validar transferência novamente (opcional se já foi validada)
  if (custodyAccounts.length > 0 && assets.length > 0) {
    const validation = validateTransfer(transfer, transactions, custodyAccounts, assets)
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      }
    }
  }

  try {
    const now = new Date()

    // Criar transação de saída (venda fictícia na conta origem)
    const sourceTransaction: Transaction = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: transfer.userId,
      custodyAccountId: transfer.fromCustodyAccountId,
      assetId: transfer.assetId,
      type: 'SELL',
      quantity: transfer.quantity,
      price: transfer.transferredAverageCost,
      date: now,
      operationDate: now,
      unitPrice: transfer.transferredAverageCost,
      fees: 0, // Transferências geralmente não têm taxas
      totalOperationValue: transfer.quantity * transfer.transferredAverageCost,
      total: transfer.quantity * transfer.transferredAverageCost,
      notes: `Transferência para conta ${transfer.toCustodyAccountId} - ${transfer.description || ''}`,
      externalId: `TRANSFER_OUT_${transfer.id}`,
      createdAt: now,
      updatedAt: now,
      createdBy: transfer.executedBy
    }

    // Criar transação de entrada (compra fictícia na conta destino)
    const destinationTransaction: Transaction = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: transfer.userId,
      custodyAccountId: transfer.toCustodyAccountId,
      assetId: transfer.assetId,
      type: 'BUY',
      quantity: transfer.quantity,
      price: transfer.transferredAverageCost,
      date: now,
      operationDate: now,
      unitPrice: transfer.transferredAverageCost,
      fees: 0, // Transferências geralmente não têm taxas
      totalOperationValue: transfer.quantity * transfer.transferredAverageCost,
      total: transfer.quantity * transfer.transferredAverageCost,
      notes: `Transferência da conta ${transfer.fromCustodyAccountId} - ${transfer.description || ''}`,
      externalId: `TRANSFER_IN_${transfer.id}`,
      createdAt: now,
      updatedAt: now,
      createdBy: transfer.executedBy
    }

    return {
      success: true,
      sourceTransaction,
      destinationTransaction,
      errors: []
    }

  } catch (error) {
    return {
      success: false,
      errors: [`Erro ao executar transferência: ${error}`]
    }
  }
}

/**
 * Cria registro de transferência
 */
export function createTransfer(
  transferData: Partial<Transfer>,
  userId: string
): { 
  transfer?: Transfer
  errors: string[]
} {
  const errors: string[] = []

  // Validações básicas
  if (!transferData.fromCustodyAccountId) {
    errors.push('Conta de origem é obrigatória')
  }

  if (!transferData.toCustodyAccountId) {
    errors.push('Conta de destino é obrigatória')
  }

  if (!transferData.assetId) {
    errors.push('Ativo é obrigatório')
  }

  if (!transferData.quantity || transferData.quantity <= 0) {
    errors.push('Quantidade deve ser maior que zero')
  }

  if (!transferData.transferredAverageCost || transferData.transferredAverageCost <= 0) {
    errors.push('Custo médio transferido deve ser maior que zero')
  }

  if (errors.length === 0) {
    const transfer: Transfer = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: transferData.type || 'INTERNAL',
      fromCustodyAccountId: transferData.fromCustodyAccountId!,
      toCustodyAccountId: transferData.toCustodyAccountId!,
      assetId: transferData.assetId!,
      quantity: transferData.quantity!,
      transferredAverageCost: transferData.transferredAverageCost!,
      transferredTotalInvested: transferData.quantity! * transferData.transferredAverageCost!,
      requestDate: new Date().toISOString(),
      status: 'PENDING',
      description: transferData.description,
      externalReferenceId: transferData.externalReferenceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return { transfer, errors: [] }
  }

  return { errors }
}

/**
 * Registra ação no histórico de transferências
 */
export function logTransferHistory(
  transferId: string,
  action: 'CREATE' | 'EXECUTE' | 'CANCEL' | 'VALIDATE',
  details: any,
  userId?: string
): TransferHistory {
  return {
    transferId,
    action,
    details,
    timestamp: new Date().toISOString(),
    userId
  }
}
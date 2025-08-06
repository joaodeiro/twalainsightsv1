// Sistema de Auditoria - Twala Insights

import type { 
  AuditLog, 
  AuditQuery, 
  AuditReport,
  ManualAdjustment,
  AuditAction,
  AuditEntityType
} from '@/types'

/**
 * Cria log de auditoria
 * CONFORME DOCUMENTO: Todas operações devem ser auditáveis
 */
export function createAuditLog(
  entityType: AuditEntityType,
  entityId: string,
  action: AuditAction,
  options: {
    previousData?: any
    newData?: any
    changedFields?: string[]
    userId?: string
    sessionId?: string
    ipAddress?: string
    userAgent?: string
    reason?: string
    description?: string
    source?: 'WEB' | 'API' | 'SYSTEM' | 'BATCH'
    isReversible?: boolean
  } = {}
): AuditLog {
  
  const now = new Date().toISOString()
  
  // Detectar campos alterados automaticamente se não fornecido
  let changedFields = options.changedFields
  if (!changedFields && options.previousData && options.newData) {
    changedFields = detectChangedFields(options.previousData, options.newData)
  }

  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    entityType,
    entityId,
    action,
    previousData: options.previousData,
    newData: options.newData,
    changedFields,
    userId: options.userId,
    sessionId: options.sessionId,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    reason: options.reason,
    description: options.description,
    timestamp: now,
    source: options.source || 'WEB',
    isReversible: options.isReversible ?? false
  }
}

/**
 * Detecta campos que foram alterados entre dois objetos
 */
function detectChangedFields(previousData: any, newData: any): string[] {
  const changed: string[] = []
  
  if (!previousData || !newData) return changed

  // Verificar todas as chaves do objeto novo
  Object.keys(newData).forEach(key => {
    if (previousData[key] !== newData[key]) {
      changed.push(key)
    }
  })

  // Verificar chaves que foram removidas
  Object.keys(previousData).forEach(key => {
    if (!(key in newData)) {
      changed.push(key)
    }
  })

  return changed
}

/**
 * Cria ajuste manual com validação
 * CONFORME DOCUMENTO: Seção 3.4 - Ajustes Manuais
 */
export function createManualAdjustment(
  adjustmentData: Partial<ManualAdjustment>,
  userId: string
): {
  adjustment?: ManualAdjustment
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Validações obrigatórias
  if (!adjustmentData.positionId) {
    errors.push('ID da posição é obrigatório')
  }

  if (!adjustmentData.custodyAccountId) {
    errors.push('ID da conta de custódia é obrigatório')
  }

  if (!adjustmentData.assetId) {
    errors.push('ID do ativo é obrigatório')
  }

  if (!adjustmentData.adjustmentType) {
    errors.push('Tipo de ajuste é obrigatório')
  }

  if (adjustmentData.previousValue === undefined) {
    errors.push('Valor anterior é obrigatório')
  }

  if (adjustmentData.newValue === undefined) {
    errors.push('Novo valor é obrigatório')
  }

  if (!adjustmentData.reason || adjustmentData.reason.trim().length < 10) {
    errors.push('Razão do ajuste deve ter pelo menos 10 caracteres')
  }

  // Validações de valores
  if (adjustmentData.previousValue !== undefined && 
      adjustmentData.newValue !== undefined) {
    
    if (adjustmentData.previousValue === adjustmentData.newValue) {
      errors.push('Novo valor deve ser diferente do valor anterior')
    }

    // Validações específicas por tipo
    switch (adjustmentData.adjustmentType) {
      case 'QUANTITY':
        if (adjustmentData.newValue < 0) {
          errors.push('Quantidade não pode ser negativa')
        }
        if (adjustmentData.previousValue < 0) {
          warnings.push('Quantidade anterior era negativa')
        }
        break

      case 'AVERAGE_COST':
        if (adjustmentData.newValue <= 0) {
          errors.push('Custo médio deve ser maior que zero')
        }
        break

      case 'TOTAL_INVESTED':
        if (adjustmentData.newValue < 0) {
          warnings.push('Total investido negativo pode indicar erro')
        }
        break
    }

    // Calcular diferença
    const difference = adjustmentData.newValue - adjustmentData.previousValue
    const percentChange = adjustmentData.previousValue !== 0 
      ? Math.abs(difference / adjustmentData.previousValue) * 100 
      : 100

    // Alertas para mudanças significativas
    if (percentChange > 50) {
      warnings.push(`Mudança significativa detectada: ${percentChange.toFixed(1)}%`)
    }

    if (percentChange > 100) {
      warnings.push('Mudança superior a 100% - verificar se está correto')
    }
  }

  if (errors.length === 0) {
    const adjustment: ManualAdjustment = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      positionId: adjustmentData.positionId!,
      custodyAccountId: adjustmentData.custodyAccountId!,
      assetId: adjustmentData.assetId!,
      adjustmentType: adjustmentData.adjustmentType!,
      previousValue: adjustmentData.previousValue!,
      newValue: adjustmentData.newValue!,
      difference: adjustmentData.newValue! - adjustmentData.previousValue!,
      reason: adjustmentData.reason!,
      description: adjustmentData.description,
      supportingDocuments: adjustmentData.supportingDocuments || [],
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      createdBy: userId,
      updatedAt: new Date().toISOString()
    }

    return { adjustment, errors: [], warnings }
  }

  return { errors, warnings }
}

/**
 * Aprova ou rejeita ajuste manual
 */
export function processManualAdjustment(
  adjustment: ManualAdjustment,
  action: 'APPROVE' | 'REJECT',
  approvedBy: string,
  reason?: string
): ManualAdjustment {
  
  const now = new Date().toISOString()

  return {
    ...adjustment,
    status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
    approvedBy,
    approvedAt: now,
    rejectionReason: action === 'REJECT' ? reason : undefined,
    updatedAt: now
  }
}

/**
 * Gera relatório de auditoria
 */
export function generateAuditReport(
  logs: AuditLog[],
  query: AuditQuery
): AuditReport {
  
  // Aplicar filtros
  let filteredLogs = logs

  if (query.entityType) {
    filteredLogs = filteredLogs.filter(log => log.entityType === query.entityType)
  }

  if (query.entityId) {
    filteredLogs = filteredLogs.filter(log => log.entityId === query.entityId)
  }

  if (query.userId) {
    filteredLogs = filteredLogs.filter(log => log.userId === query.userId)
  }

  if (query.actions) {
    filteredLogs = filteredLogs.filter(log => query.actions!.includes(log.action))
  }

  if (query.dateFrom) {
    const fromDate = new Date(query.dateFrom)
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= fromDate)
  }

  if (query.dateTo) {
    const toDate = new Date(query.dateTo)
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= toDate)
  }

  // Ordenar por timestamp descendente
  filteredLogs = filteredLogs.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  // Aplicar paginação
  const offset = query.offset || 0
  const limit = query.limit || 100
  const paginatedLogs = filteredLogs.slice(offset, offset + limit)

  // Gerar estatísticas
  const actionSummary: Record<AuditAction, number> = {
    CREATE: 0, UPDATE: 0, DELETE: 0, CALCULATE: 0, ADJUST: 0,
    TRANSFER: 0, VALIDATE: 0, APPROVE: 0, REJECT: 0, EXECUTE: 0
  }

  const entitySummary: Record<AuditEntityType, number> = {
    TRANSACTION: 0, PROVENTO: 0, CORPORATE_EVENT: 0, TRANSFER: 0,
    PORTFOLIO_POSITION: 0, CUSTODY_ACCOUNT: 0, MANUAL_ADJUSTMENT: 0
  }

  const userActivityMap = new Map<string, { count: number, lastActivity: string }>()

  filteredLogs.forEach(log => {
    // Contabilizar ações
    actionSummary[log.action] = (actionSummary[log.action] || 0) + 1
    
    // Contabilizar entidades
    entitySummary[log.entityType] = (entitySummary[log.entityType] || 0) + 1
    
    // Atividade por usuário
    if (log.userId) {
      const current = userActivityMap.get(log.userId) || { count: 0, lastActivity: log.timestamp }
      userActivityMap.set(log.userId, {
        count: current.count + 1,
        lastActivity: log.timestamp > current.lastActivity ? log.timestamp : current.lastActivity
      })
    }
  })

  // Converter atividade de usuários para array
  const userActivity = Array.from(userActivityMap.entries()).map(([userId, data]) => ({
    userId,
    actionCount: data.count,
    lastActivity: data.lastActivity
  })).sort((a, b) => b.actionCount - a.actionCount)

  // Determinar intervalo de datas
  const dateRange = {
    from: query.dateFrom || (filteredLogs.length > 0 ? filteredLogs[filteredLogs.length - 1].timestamp : new Date().toISOString()),
    to: query.dateTo || (filteredLogs.length > 0 ? filteredLogs[0].timestamp : new Date().toISOString())
  }

  return {
    totalRecords: filteredLogs.length,
    dateRange,
    actionSummary,
    entitySummary,
    userActivity,
    logs: paginatedLogs
  }
}

/**
 * Verifica se uma operação é auditável
 */
export function isAuditable(entityType: AuditEntityType, action: AuditAction): boolean {
  // Operações sempre auditáveis
  const criticalOperations: Array<{type: AuditEntityType, action: AuditAction}> = [
    { type: 'TRANSACTION', action: 'CREATE' },
    { type: 'TRANSACTION', action: 'UPDATE' },
    { type: 'TRANSACTION', action: 'DELETE' },
    { type: 'MANUAL_ADJUSTMENT', action: 'CREATE' },
    { type: 'MANUAL_ADJUSTMENT', action: 'APPROVE' },
    { type: 'MANUAL_ADJUSTMENT', action: 'REJECT' },
    { type: 'TRANSFER', action: 'CREATE' },
    { type: 'TRANSFER', action: 'EXECUTE' },
    { type: 'CORPORATE_EVENT', action: 'CREATE' },
    { type: 'CORPORATE_EVENT', action: 'EXECUTE' }
  ]

  return criticalOperations.some(op => 
    op.type === entityType && op.action === action
  )
}

/**
 * Cria reversal de uma operação auditada
 */
export function createReversal(
  originalLog: AuditLog,
  reversalReason: string,
  userId: string
): AuditLog {
  
  if (!originalLog.isReversible) {
    throw new Error('Esta operação não pode ser revertida')
  }

  const reversalLog = createAuditLog(
    originalLog.entityType,
    originalLog.entityId,
    'DELETE', // Reversal é sempre um DELETE conceitual
    {
      previousData: originalLog.newData,
      newData: originalLog.previousData,
      reason: reversalReason,
      description: `Reversão de operação ${originalLog.id}`,
      userId,
      source: 'SYSTEM',
      isReversible: false // Reversões não podem ser revertidas
    }
  )

  // Marcar o log original como revertido
  originalLog.reversalLogId = reversalLog.id

  return reversalLog
}
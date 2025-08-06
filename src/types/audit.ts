// Sistema de Auditoria - Twala Insights

export type AuditAction = 
  | 'CREATE' | 'UPDATE' | 'DELETE'
  | 'CALCULATE' | 'ADJUST' | 'TRANSFER'
  | 'VALIDATE' | 'APPROVE' | 'REJECT' | 'EXECUTE'

export type AuditEntityType = 
  | 'TRANSACTION' | 'PROVENTO' | 'CORPORATE_EVENT'
  | 'TRANSFER' | 'PORTFOLIO_POSITION' | 'CUSTODY_ACCOUNT'
  | 'MANUAL_ADJUSTMENT'

export interface AuditLog {
  id: string
  entityType: AuditEntityType
  entityId: string
  action: AuditAction
  
  // Dados da mudança
  previousData?: any
  newData?: any
  changedFields?: string[]
  
  // Contexto
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  
  // Razão/Justificativa
  reason?: string
  description?: string
  
  // Metadados
  timestamp: string
  source: 'WEB' | 'API' | 'SYSTEM' | 'BATCH'
  
  // Para rollback
  isReversible: boolean
  reversalLogId?: string
}

export interface ManualAdjustment {
  id: string
  positionId: string
  custodyAccountId: string
  assetId: string
  
  // Tipo de ajuste
  adjustmentType: 'QUANTITY' | 'AVERAGE_COST' | 'TOTAL_INVESTED'
  
  // Valores
  previousValue: number
  newValue: number
  difference: number
  
  // Justificativa
  reason: string
  description?: string
  supportingDocuments?: string[] // URLs de documentos
  
  // Aprovação
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  
  // Auditoria
  createdAt: string
  createdBy: string
  updatedAt: string
}

// Interface para consultas de auditoria
export interface AuditQuery {
  entityType?: AuditEntityType
  entityId?: string
  userId?: string
  actions?: AuditAction[]
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}

export interface AuditReport {
  totalRecords: number
  dateRange: {
    from: string
    to: string
  }
  
  // Estatísticas
  actionSummary: Record<AuditAction, number>
  entitySummary: Record<AuditEntityType, number>
  userActivity: Array<{
    userId: string
    actionCount: number
    lastActivity: string
  }>
  
  // Logs
  logs: AuditLog[]
}
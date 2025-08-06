// Transferências entre Contas - Twala Insights

export type TransferStatus = 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'FAILED'
export type TransferType = 'INTERNAL' | 'EXTERNAL' | 'CUSTODY_CHANGE'

export interface Transfer {
  id: string
  userId: string
  type: TransferType
  
  // Contas envolvidas
  fromCustodyAccountId: string
  toCustodyAccountId: string
  
  // Ativo transferido
  assetId: string
  quantity: number
  
  // Custo médio preservado
  transferredAverageCost: number
  transferredTotalInvested: number
  
  // Datas
  requestDate: string
  executedDate?: string
  
  // Status e validação
  status: TransferStatus
  validationErrors?: string[]
  
  // Metadados
  description?: string
  externalReferenceId?: string // Para transferências externas
  
  // Auditoria
  createdAt: string
  updatedAt: string
  executedBy?: string
}

export interface TransferValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  
  // Disponibilidade
  availableQuantity: number
  requestedQuantity: number
  
  // Impactos calculados
  sourcePositionAfter: {
    quantity: number
    averagePrice: number
    totalInvested: number
  }
  
  destinationPositionAfter: {
    quantity: number
    averagePrice: number
    totalInvested: number
  }
}

// Histórico de movimentações para auditoria
export interface TransferHistory {
  transferId: string
  action: 'CREATE' | 'EXECUTE' | 'CANCEL' | 'VALIDATE'
  details: any
  timestamp: string
  userId?: string
}
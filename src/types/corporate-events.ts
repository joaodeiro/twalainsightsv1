// Eventos Corporativos - Twala Insights

export type CorporateEventType = 'SPLIT' | 'REVERSE_SPLIT' | 'BONUS' | 'SPINOFF' | 'MERGER' | 'RIGHTS_ISSUE'

export interface CorporateEvent {
  id: string
  assetId: string
  type: CorporateEventType
  
  // Datas importantes
  approvalDate: string      // Data de aprovação
  recordDate: string        // Data de corte (ex-date)
  effectiveDate: string     // Data de vigência do evento
  
  // Fatores de ajuste
  adjustmentRatio: string   // Proporção (ex: "1:2", "3:1")
  quantityFactor: number    // Fator multiplicador da quantidade
  priceFactor: number       // Fator divisor do preço
  
  // Para eventos com emissão de novos ativos
  newAssetId?: string       // ID do novo ativo (spinoff)
  newAssetRatio?: number    // Proporção do novo ativo
  
  // Para subscrições
  subscriptionPrice?: number // Preço de subscrição
  subscriptionRatio?: string // Direitos por ação
  
  // Metadados
  description: string
  officialNotice?: string   // Link para comunicado oficial
  status: 'ANNOUNCED' | 'CONFIRMED' | 'EXECUTED' | 'CANCELLED'
  
  // Auditoria
  createdAt: string
  updatedAt: string
}

export interface CorporateEventAdjustment {
  eventId: string
  custodyAccountId: string
  assetId: string
  
  // Posição antes do evento
  quantityBefore: number
  averagePriceBefore: number
  totalInvestedBefore: number
  
  // Posição após o evento
  quantityAfter: number
  averagePriceAfter: number
  totalInvestedAfter: number
  
  // Novos ativos recebidos (se aplicável)
  newAssetQuantity?: number
  newAssetValue?: number
  
  // Metadados
  processedAt: string
  processedBy?: string
}

// Interface para validação de eventos
export interface CorporateEventValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  affectedPositions: number
}
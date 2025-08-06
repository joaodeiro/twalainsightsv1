// Sistema Completo de Proventos - Twala Insights

export type ProventoType = 'DIVIDEND' | 'JCP' | 'BONIFICACAO' | 'RENDIMENTO_FUNDO' | 'SUBSCRICAO'

export interface Provento {
  id: string
  custodyAccountId: string
  assetId: string
  type: ProventoType
  
  // Datas importantes
  recordDate: string        // Data de corte (ex-date)
  paymentDate: string       // Data de pagamento
  approvalDate?: string     // Data de aprovação em assembleia
  
  // Valores financeiros
  valuePerUnit: number      // Valor por unidade (ex: AOA 0.50 por ação)
  affectedQuantity: number  // Quantidade de unidades que geram o provento
  totalValue: number        // Valor total do provento
  
  // Para bonificações
  bonusQuantity?: number    // Quantidade de novas ações/cotas recebidas
  bonusRatio?: string       // Proporção (ex: "1:10" = 1 nova para cada 10)
  
  // Tributação
  taxWithheld?: number      // Imposto retido na fonte
  netValue?: number         // Valor líquido recebido
  
  // Metadados
  description?: string      // Descrição do provento
  source: 'MANUAL' | 'API' | 'CORPORATE_EVENT'
  status: 'PENDING' | 'PAID' | 'CANCELLED'
  
  // Auditoria
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface ProventoCalculation {
  // Valores totais por tipo
  totalDividends: number
  totalJCP: number
  totalBonifications: number
  totalRendimentos: number
  totalSubscriptions: number
  
  // Impactos
  totalGrossIncome: number
  totalTaxWithheld: number
  totalNetIncome: number
  
  // Quantidade de ações/cotas recebidas via bonificação
  totalBonusShares: number
  
  // Detalhes por ativo
  proventosByAsset: Array<{
    assetId: string
    assetName: string
    totalIncome: number
    bonusShares: number
    lastProventoDate: string
    proventoCount: number
  }>
}

// Histórico detalhado para auditoria
export interface ProventoHistoryItem {
  id: string
  proventoId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CALCULATE'
  previousValue?: any
  newValue?: any
  timestamp: string
  userId?: string
  reason?: string
}
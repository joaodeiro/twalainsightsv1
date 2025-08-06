// Tipos específicos para proventos conforme documento
export interface Dividend {
  id: string
  userId: string
  custodyAccountId: string
  assetId: string
  type: 'DIVIDEND' | 'INTEREST' | 'BONUS' // Expandido conforme documento
  paymentDate: Date
  recordDate: Date // Data de registro para ter direito ao provento
  valuePerUnit: number // Valor por unidade do ativo
  affectedQuantity: number // Quantidade de unidades que geraram o provento
  totalValue: number // Valor total recebido
  bonusQuantity?: number // Quantidade de novas ações (para bonificações)
  description: string // Descrição do provento
  source: string // Fonte/empresa que pagou
  currency: 'AOA' | 'USD' | 'EUR' // Moeda do pagamento
  taxWithheld?: number // Imposto retido na fonte
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Interface para calcular proventos futuros (projeções)
export interface DividendProjection {
  assetId: string
  expectedPaymentDate: Date
  estimatedValuePerUnit: number
  userQuantity: number
  estimatedTotalValue: number
  confidence: 'LOW' | 'MEDIUM' | 'HIGH'
  source: string // De onde veio a projeção
}

// Histórico consolidado de proventos por ativo
export interface AssetDividendSummary {
  assetId: string
  assetName: string
  totalDividendsReceived: number
  totalInterestReceived: number
  totalBonusShares: number
  averageYield: number // Yield médio baseado no preço médio de compra
  lastPaymentDate: Date | null
  paymentsCount: number
  yearlyBreakdown: Array<{
    year: number
    totalValue: number
    paymentsCount: number
    averageYield: number
  }>
}

// Tipos para formulários
export type DividendFormData = Omit<Dividend, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'totalValue'> & {
  // totalValue será calculado automaticamente
}

export type DividendCalculation = {
  valuePerUnit: number
  affectedQuantity: number
  totalValue: number
  effectOnAveragePrice: number // Para bonificações
  effectOnYield: number
}
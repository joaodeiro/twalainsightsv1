// Tipos básicos para o projeto Twala Insights

// Re-exports dos novos módulos especializados
export * from './proventos'
export * from './corporate-events'
export * from './transfers'
export * from './audit'

export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

// Tipos para Contas de Custódia (conforme documento)
export interface CustodyAccount {
  id: string
  userId: string
  brokerName: string        // nome_corretora
  accountNickname: string   // apelido_conta  
  accountNumber?: string    // numero_conta
  accountType?: string      // tipo_conta
  baseCurrency?: string     // moeda_base (ex: "AOA", "USD")
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  
  // Para compatibilidade (deprecated)
  name?: string
  institution?: string
}

// Tipos para Ativos
export interface Asset {
  id: string
  ticker: string
  name: string
  sector: string
  currentPrice: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  peRatio?: number
  dividendYield?: number
  beta?: number
}

// Tipos para Transações (conforme documento - entidade Operacao)
export interface Transaction {
  id: string
  userId: string
  custodyAccountId: string
  assetId: string
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'INTEREST'
  
  // Dados da operação
  operationDate: Date       // data_operacao
  quantity: number          // quantidade
  unitPrice: number         // preco_unitario  
  fees: number             // custos_taxas (obrigatório nos cálculos)
  totalOperationValue: number // valor_total_operacao
  
  // Para compatibilidade (deprecated)
  price: number
  date: Date  
  total: number
  
  // Campos expandidos para proventos (conforme documento)
  valuePerUnit?: number     // Para dividendos: valor por ação
  recordDate?: Date         // Data de registro para ter direito
  paymentDate?: Date        // Data efetiva do pagamento
  bonusQuantity?: number    // Para bonificações
  taxWithheld?: number      // IR retido na fonte
  source?: string           // Empresa/fonte pagadora
  
  // Metadados
  broker?: string
  notes?: string
  externalId?: string       // ID externo (ex: da corretora)
  
  // Auditoria
  createdAt: Date
  updatedAt: Date
  createdBy?: string
}

// Tipos para Proventos (Juros e Dividendos)
export interface Income {
  id: string
  userId: string
  assetId: string
  type: 'DIVIDEND' | 'INTEREST'
  amount: number
  date: Date
  description: string
  createdAt: Date
}

// Tipos para Carteira/Portfolio
export interface Portfolio {
  userId: string
  totalValue: number
  totalReturn: number
  totalReturnPercent: number
  assets: PortfolioAsset[]
  lastUpdate: Date
}

export interface PortfolioAsset {
  assetId: string
  ticker: string
  name: string
  quantity: number
  averagePrice: number
  currentPrice: number
  totalValue: number
  return: number
  returnPercent: number
  weight: number // % na carteira
}

// Tipos para Indicadores de Performance
export interface PerformanceIndicator {
  assetId: string
  ticker: string
  name: string
  totalReturn: number
  totalReturnPercent: number
  annualizedReturn: number
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  beta: number
  alpha: number
}

// Tipos para Screeners e Filtros
export interface ScreenerFilter {
  id: string
  userId: string
  name: string
  criteria: FilterCriteria[]
  isActive: boolean
  createdAt: Date
}

export interface FilterCriteria {
  field: string
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains'
  value: string | number
}

// Tipos para Insights de Mercado
export interface MarketInsight {
  id: string
  title: string
  content: string
  category: 'TIP' | 'ANALYSIS' | 'NEWS' | 'ALERT'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  publishedAt: Date
  isActive: boolean
}

// Tipos para Alertas
export interface Alert {
  id: string
  userId: string
  screenerFilterId?: string
  assetId?: string
  type: 'PRICE' | 'VOLUME' | 'PERFORMANCE' | 'CUSTOM'
  condition: string
  isTriggered: boolean
  triggeredAt?: Date
  createdAt: Date
}

// Tipos para Simulação
export interface Simulation {
  id: string
  userId: string
  name: string
  scenario: SimulationScenario[]
  results: SimulationResult
  createdAt: Date
}

export interface SimulationScenario {
  action: 'BUY' | 'SELL'
  assetId: string
  quantity: number
  price: number
  date: Date
}

export interface SimulationResult {
  initialValue: number
  finalValue: number
  return: number
  returnPercent: number
  impact: number
}

// Tipos para Relatórios
export interface Report {
  id: string
  userId: string
  type: 'PORTFOLIO' | 'TRANSACTIONS' | 'PERFORMANCE' | 'CUSTOM'
  format: 'PDF' | 'EXCEL'
  data: any
  generatedAt: Date
  downloadUrl?: string
}

// Tipos para formulários
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface CustodyAccountForm {
  name: string
  institution: string
  accountNumber: string
}

export interface TransactionForm {
  custodyAccountId: string
  assetId: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  date: Date
  fees?: number
  notes?: string
}

export interface IncomeForm {
  assetId: string
  type: 'DIVIDEND' | 'INTEREST'
  amount: number
  date: Date
  description: string
}

export interface ScreenerFilterForm {
  name: string
  criteria: FilterCriteria[]
}

// Tipos para API responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Tipos para dados de mercado
export interface MarketData {
  assets: Asset[]
  lastUpdate: Date
  totalAssets: number
  totalVolume: number
  marketCap: number
} 
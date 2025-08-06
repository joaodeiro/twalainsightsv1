// Testes para Sistema de Proventos - Twala Insights

import { 
  calculateDividendDetails, 
  calculateBonusShares,
  consolidateDividendsByAsset,
  validateProvento
} from '@/lib/proventos'
import type { Provento, Asset, CustodyAccount } from '@/types'

// Mock de dados
const mockAssets: Asset[] = [
  {
    id: 'bfa-001',
    ticker: 'BFA',
    name: 'Banco de Fomento Angola',
    sector: 'Bancos',
    currentPrice: 18500,
    change: 200,
    changePercent: 1.09,
    volume: 1000,
    marketCap: 50000000
  },
  {
    id: 'bic-001', 
    ticker: 'BIC',
    name: 'Banco BIC',
    sector: 'Bancos',
    currentPrice: 12000,
    change: -150,
    changePercent: -1.23,
    volume: 800,
    marketCap: 30000000
  }
]

const mockAccounts: CustodyAccount[] = [
  {
    id: 'acc-001',
    userId: 'user-001',
    brokerName: 'Corretora A',
    accountNickname: 'Conta Principal',
    accountNumber: '12345',
    accountType: 'Corretagem',
    baseCurrency: 'AOA',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const mockProventos: Provento[] = [
  {
    id: 'prov-001',
    custodyAccountId: 'acc-001',
    assetId: 'bfa-001',
    type: 'DIVIDEND',
    recordDate: '2024-01-15',
    paymentDate: '2024-02-01',
    valuePerUnit: 500,
    affectedQuantity: 100,
    totalValue: 50000,
    taxWithheld: 7500,
    netValue: 42500,
    description: 'Dividendos 2023',
    source: 'MANUAL',
    status: 'PAID',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01'
  },
  {
    id: 'prov-002',
    custodyAccountId: 'acc-001',
    assetId: 'bfa-001',
    type: 'BONIFICACAO',
    recordDate: '2024-03-01',
    paymentDate: '2024-03-15',
    valuePerUnit: 0,
    affectedQuantity: 100,
    totalValue: 0,
    bonusQuantity: 10,
    bonusRatio: '1:10',
    description: 'Bonificação 10%',
    source: 'CORPORATE_EVENT',
    status: 'PAID',
    createdAt: '2024-03-15',
    updatedAt: '2024-03-15'
  },
  {
    id: 'prov-003',
    custodyAccountId: 'acc-001',
    assetId: 'bic-001',
    type: 'JCP',
    recordDate: '2024-02-01',
    paymentDate: '2024-02-15',
    valuePerUnit: 300,
    affectedQuantity: 50,
    totalValue: 15000,
    taxWithheld: 0,
    netValue: 15000,
    description: 'Juros sobre Capital Próprio',
    source: 'MANUAL',
    status: 'PAID',
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15'
  }
]

describe('Sistema de Proventos', () => {
  
  describe('calculateDividendDetails', () => {
    it('deve calcular totais por tipo de provento', () => {
      const result = calculateDividendDetails(mockProventos, [], mockAssets)
      
      expect(result.totalDividends).toBe(50000)
      expect(result.totalJCP).toBe(15000)
      expect(result.totalBonifications).toBe(0)
      expect(result.totalBonusShares).toBe(10)
      expect(result.totalTaxWithheld).toBe(7500)
      expect(result.totalGrossIncome).toBe(65000)
      expect(result.totalNetIncome).toBe(57500)
    })

    it('deve agrupar proventos por ativo', () => {
      const result = calculateDividendDetails(mockProventos, [], mockAssets)
      
      expect(result.proventosByAsset).toHaveLength(2)
      
      const bfaData = result.proventosByAsset.find(p => p.assetId === 'bfa-001')
      expect(bfaData?.totalIncome).toBe(50000)
      expect(bfaData?.bonusShares).toBe(10)
      expect(bfaData?.proventoCount).toBe(2)
      
      const bicData = result.proventosByAsset.find(p => p.assetId === 'bic-001')
      expect(bicData?.totalIncome).toBe(15000)
      expect(bicData?.bonusShares).toBe(0)
      expect(bicData?.proventoCount).toBe(1)
    })
  })

  describe('calculateBonusShares', () => {
    it('deve calcular bonificação corretamente', () => {
      // Conforme documento: diluir custo médio
      const result = calculateBonusShares(
        100,    // quantidade atual
        18000,  // custo médio atual  
        10      // bonificação
      )
      
      expect(result.newQuantity).toBe(110)
      expect(result.newAverageCost).toBeCloseTo(16363.64) // 18000 * 100 / 110
      expect(result.dilutionFactor).toBeCloseTo(0.909)
    })

    it('deve lidar com quantidade zero', () => {
      const result = calculateBonusShares(0, 0, 5)
      
      expect(result.newQuantity).toBe(5)
      expect(result.newAverageCost).toBe(0)
      expect(result.dilutionFactor).toBe(1)
    })
  })

  describe('consolidateDividendsByAsset', () => {
    it('deve consolidar proventos por ativo', () => {
      const result = consolidateDividendsByAsset(mockProventos, mockAssets)
      
      expect(result).toHaveLength(2)
      
      const bfaConsolidation = result.find(c => c.assetId === 'bfa-001')
      expect(bfaConsolidation?.dividends).toBe(50000)
      expect(bfaConsolidation?.totalBonusShares).toBe(10)
      expect(bfaConsolidation?.netIncome).toBe(42500)
      expect(bfaConsolidation?.proventoCount).toBe(2)
      expect(bfaConsolidation?.approximateYield).toBeCloseTo(270.27) // 50000/18500*100
    })

    it('deve calcular datas corretamente', () => {
      const result = consolidateDividendsByAsset(mockProventos, mockAssets)
      
      const bfaConsolidation = result.find(c => c.assetId === 'bfa-001')
      expect(bfaConsolidation?.firstProventoDate).toBe('2024-02-01')
      expect(bfaConsolidation?.lastProventoDate).toBe('2024-03-15')
    })
  })

  describe('validateProvento', () => {
    it('deve validar provento completo', () => {
      const validProvento: Partial<Provento> = {
        custodyAccountId: 'acc-001',
        assetId: 'bfa-001',
        type: 'DIVIDEND',
        paymentDate: '2024-01-15',
        totalValue: 10000,
        affectedQuantity: 50,
        valuePerUnit: 200
      }
      
      const result = validateProvento(validProvento, mockAccounts, mockAssets)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('deve detectar campos obrigatórios faltando', () => {
      const invalidProvento: Partial<Provento> = {
        type: 'DIVIDEND'
      }
      
      const result = validateProvento(invalidProvento, mockAccounts, mockAssets)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Conta de custódia é obrigatória')
      expect(result.errors).toContain('Ativo é obrigatório')
      expect(result.errors).toContain('Data de pagamento é obrigatória')
    })

    it('deve validar bonificação específica', () => {
      const bonusProvento: Partial<Provento> = {
        custodyAccountId: 'acc-001',
        assetId: 'bfa-001',
        type: 'BONIFICACAO',
        paymentDate: '2024-01-15',
        totalValue: 0,
        affectedQuantity: 100
        // Faltando bonusQuantity
      }
      
      const result = validateProvento(bonusProvento, mockAccounts, mockAssets)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Quantidade de bonificação é obrigatória para bonificações')
    })

    it('deve detectar inconsistências de valores', () => {
      const inconsistentProvento: Partial<Provento> = {
        custodyAccountId: 'acc-001',
        assetId: 'bfa-001',
        type: 'DIVIDEND',
        paymentDate: '2024-01-15',
        totalValue: 10000,
        affectedQuantity: 50,
        valuePerUnit: 300 // 50 * 300 = 15000, mas totalValue = 10000
      }
      
      const result = validateProvento(inconsistentProvento, mockAccounts, mockAssets)
      
      expect(result.warnings).toContain('Valor total calculado não confere com o informado')
    })

    it('deve validar imposto retido', () => {
      const invalidTaxProvento: Partial<Provento> = {
        custodyAccountId: 'acc-001',
        assetId: 'bfa-001',
        type: 'DIVIDEND',
        paymentDate: '2024-01-15',
        totalValue: 10000,
        affectedQuantity: 50,
        taxWithheld: 15000 // Maior que totalValue
      }
      
      const result = validateProvento(invalidTaxProvento, mockAccounts, mockAssets)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Imposto retido não pode ser maior que o valor total')
    })
  })
})
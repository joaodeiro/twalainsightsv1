// Testes para Sistema de Eventos Corporativos - Twala Insights

import { 
  applyCorporateEvent,
  adjustHistoricalPrices,
  createCorporateEvent,
  validateCorporateEvent,
  calculateCumulativeEvents
} from '@/lib/corporate-events'
import type { CorporateEvent, Transaction, Asset, CustodyAccount } from '@/types'

// Mock de dados
const mockAsset: Asset = {
  id: 'bfa-001',
  ticker: 'BFA',
  name: 'Banco de Fomento Angola',
  sector: 'Bancos',
  currentPrice: 18500,
  change: 200,
  changePercent: 1.09,
  volume: 1000,
  marketCap: 50000000
}

const mockSplitEvent: CorporateEvent = {
  id: 'event-001',
  assetId: 'bfa-001',
  type: 'SPLIT',
  approvalDate: '2024-01-01',
  recordDate: '2024-01-15',
  effectiveDate: '2024-02-01',
  adjustmentRatio: '1:2',
  quantityFactor: 2,
  priceFactor: 2,
  description: 'Desdobramento 1:2',
  status: 'CONFIRMED',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
}

const mockBonusEvent: CorporateEvent = {
  id: 'event-002',
  assetId: 'bfa-001',
  type: 'BONUS',
  approvalDate: '2024-03-01',
  recordDate: '2024-03-15',
  effectiveDate: '2024-04-01',
  adjustmentRatio: '1:10',
  quantityFactor: 10,
  priceFactor: 1,
  description: 'Bonificação 10%',
  status: 'CONFIRMED',
  createdAt: '2024-03-01',
  updatedAt: '2024-03-01'
}

const mockTransactions: Transaction[] = [
  {
    id: 'trans-001',
    userId: 'user-001',
    custodyAccountId: 'acc-001',
    assetId: 'bfa-001',
    type: 'BUY',
    quantity: 100,
    price: 20000,
    date: new Date('2024-01-01'),
    operationDate: new Date('2024-01-01'),
    unitPrice: 20000,
    fees: 500,
    totalOperationValue: 2000500,
    total: 2000500,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'trans-002',
    userId: 'user-001',
    custodyAccountId: 'acc-001',
    assetId: 'bfa-001',
    type: 'BUY',
    quantity: 50,
    price: 18000,
    date: new Date('2024-02-15'), // Após split
    operationDate: new Date('2024-02-15'),
    unitPrice: 18000,
    fees: 250,
    totalOperationValue: 900250,
    total: 900250,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  }
]

describe('Sistema de Eventos Corporativos', () => {
  
  describe('applyCorporateEvent', () => {
    it('deve aplicar split corretamente', () => {
      const result = applyCorporateEvent(
        mockSplitEvent,
        100,    // quantidade atual
        20000,  // custo médio atual
        2000000 // total investido
      )
      
      expect(result.newQuantity).toBe(200) // 100 * 2
      expect(result.newAverageCost).toBe(10000) // 20000 / 2
      expect(result.newTotalInvested).toBe(2000000) // Valor total permanece
    })

    it('deve aplicar reverse split corretamente', () => {
      const reverseSplitEvent: CorporateEvent = {
        ...mockSplitEvent,
        type: 'REVERSE_SPLIT',
        adjustmentRatio: '10:1',
        quantityFactor: 10,
        priceFactor: 10
      }
      
      const result = applyCorporateEvent(
        reverseSplitEvent,
        100,    // quantidade atual
        10000,  // custo médio atual
        1000000 // total investido
      )
      
      expect(result.newQuantity).toBe(10) // 100 / 10
      expect(result.newAverageCost).toBe(100000) // 10000 * 10
      expect(result.newTotalInvested).toBe(1000000) // Valor total permanece
    })

    it('deve aplicar bonificação corretamente', () => {
      const result = applyCorporateEvent(
        mockBonusEvent,
        100,    // quantidade atual
        18000,  // custo médio atual
        1800000 // total investido
      )
      
      expect(result.newQuantity).toBe(110) // 100 + floor(100/10)
      expect(result.newAverageCost).toBeCloseTo(16363.64) // 1800000 / 110
      expect(result.newTotalInvested).toBe(1800000) // Valor total permanece
    })

    it('deve aplicar spinoff corretamente', () => {
      const spinoffEvent: CorporateEvent = {
        ...mockSplitEvent,
        type: 'SPINOFF',
        newAssetId: 'new-asset-001',
        newAssetRatio: 0.5
      }
      
      const result = applyCorporateEvent(
        spinoffEvent,
        100,
        18000,
        1800000
      )
      
      expect(result.newQuantity).toBe(100) // Posição original mantida
      expect(result.newAverageCost).toBe(18000)
      expect(result.newAssetQuantity).toBe(50) // 100 * 0.5
      expect(result.newAssetValue).toBe(0)
    })
  })

  describe('adjustHistoricalPrices', () => {
    it('deve ajustar preços históricos para split', () => {
      const adjustedTransactions = adjustHistoricalPrices(mockTransactions, mockSplitEvent)
      
      // Primeira transação (antes do split) deve ser ajustada
      const firstTransaction = adjustedTransactions.find(t => t.id === 'trans-001')
      expect(firstTransaction?.quantity).toBe(200) // 100 * 2
      expect(firstTransaction?.price).toBe(10000) // 20000 / 2
      expect(firstTransaction?.unitPrice).toBe(10000)
      
      // Segunda transação (após split) não deve ser alterada
      const secondTransaction = adjustedTransactions.find(t => t.id === 'trans-002')
      expect(secondTransaction?.quantity).toBe(50)
      expect(secondTransaction?.price).toBe(18000)
    })

    it('não deve ajustar transações de outros ativos', () => {
      const otherAssetTransaction: Transaction = {
        ...mockTransactions[0],
        id: 'other-trans',
        assetId: 'other-asset'
      }
      
      const transactions = [...mockTransactions, otherAssetTransaction]
      const adjusted = adjustHistoricalPrices(transactions, mockSplitEvent)
      
      const otherTransaction = adjusted.find(t => t.id === 'other-trans')
      expect(otherTransaction?.quantity).toBe(100) // Não alterado
      expect(otherTransaction?.price).toBe(20000) // Não alterado
    })
  })

  describe('createCorporateEvent', () => {
    it('deve criar evento válido', () => {
      const eventData = {
        assetId: 'bfa-001',
        type: 'SPLIT' as const,
        effectiveDate: '2024-02-01',
        adjustmentRatio: '1:2',
        quantityFactor: 2,
        priceFactor: 2,
        description: 'Split 1:2'
      }
      
      const result = createCorporateEvent(eventData, [mockAsset])
      
      expect(result.event).toBeDefined()
      expect(result.errors).toHaveLength(0)
      expect(result.event?.type).toBe('SPLIT')
    })

    it('deve validar campos obrigatórios', () => {
      const invalidEventData = {
        type: 'SPLIT' as const
      }
      
      const result = createCorporateEvent(invalidEventData, [mockAsset])
      
      expect(result.event).toBeUndefined()
      expect(result.errors).toContain('ID do ativo é obrigatório')
      expect(result.errors).toContain('Data de vigência é obrigatória')
    })

    it('deve validar spinoff específico', () => {
      const spinoffData = {
        assetId: 'bfa-001',
        type: 'SPINOFF' as const,
        effectiveDate: '2024-02-01',
        adjustmentRatio: '1:1',
        quantityFactor: 1,
        priceFactor: 1
        // Faltando newAssetId
      }
      
      const result = createCorporateEvent(spinoffData, [mockAsset])
      
      expect(result.errors).toContain('ID do novo ativo é obrigatório para spin-off')
    })
  })

  describe('validateCorporateEvent', () => {
    it('deve validar evento com transações existentes', () => {
      const result = validateCorporateEvent(mockSplitEvent, mockTransactions, [])
      
      expect(result.isValid).toBe(true)
      expect(result.affectedPositions).toBe(1)
      expect(result.warnings).toContain('Existem 1 transações posteriores ao evento que podem ser afetadas')
    })

    it('deve rejeitar evento cancelado', () => {
      const cancelledEvent = { ...mockSplitEvent, status: 'CANCELLED' as const }
      
      const result = validateCorporateEvent(cancelledEvent, mockTransactions, [])
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Não é possível aplicar evento cancelado')
    })

    it('deve avisar sobre evento anunciado vencido', () => {
      const expiredEvent = { 
        ...mockSplitEvent, 
        status: 'ANNOUNCED' as const,
        effectiveDate: '2020-01-01' // Data no passado
      }
      
      const result = validateCorporateEvent(expiredEvent, mockTransactions, [])
      
      expect(result.warnings).toContain('Evento anunciado mas data de vigência já passou')
    })
  })

  describe('calculateCumulativeEvents', () => {
    it('deve aplicar múltiplos eventos em sequência', () => {
      const events = [mockSplitEvent, mockBonusEvent]
      
      const result = calculateCumulativeEvents(
        events,
        100,   // quantidade inicial
        20000  // custo médio inicial
      )
      
      expect(result.eventChain).toHaveLength(2)
      
      // Após split: 200 ações a AOA 10.000
      expect(result.eventChain[0].quantityAfter).toBe(200)
      expect(result.eventChain[0].averageCostAfter).toBe(10000)
      
      // Após bonus: 220 ações a custo diluído
      expect(result.finalQuantity).toBe(220) // 200 + floor(200/10)
      expect(result.finalAverageCost).toBeCloseTo(9090.91) // 2000000 / 220
    })

    it('deve ordenar eventos por data', () => {
      const laterEvent = { 
        ...mockBonusEvent, 
        effectiveDate: '2024-01-15' // Antes do split
      }
      const events = [mockSplitEvent, laterEvent] // Ordem errada
      
      const result = calculateCumulativeEvents(events, 100, 20000)
      
      // Deve aplicar bonus primeiro (data anterior)
      expect(result.eventChain[0].event.type).toBe('BONUS')
      expect(result.eventChain[1].event.type).toBe('SPLIT')
    })
  })
})
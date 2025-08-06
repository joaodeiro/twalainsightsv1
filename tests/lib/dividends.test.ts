// Mock do Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {}
}))

import { calculateDividendDetails, calculateBonusShares, consolidateDividendsByAsset } from '@/lib/dividends'
import type { Transaction, Asset } from '@/types'

describe('Lógica de Proventos - Conforme Documento', () => {
  const mockAssets: Asset[] = [
    {
      id: 'BFA',
      ticker: 'BFA',
      name: 'Banco de Fomento Angola',
      sector: 'Bancos',
      currency: 'AOA',
      currentPrice: 19000,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  describe('calculateDividendDetails', () => {
    it('deve calcular dividendo corretamente', () => {
      // Cenário: 100 ações, AOA 500 por ação, preço médio AOA 18.000
      const result = calculateDividendDetails(500, 100, 18000)

      expect(result.totalValue).toBe(50000) // 500 * 100
      expect(result.yieldPercent).toBeCloseTo(2.78, 2) // (500/18000) * 100
      expect(result.effectOnAveragePrice).toBe(0) // Dividendos não afetam preço médio
    })

    it('deve calcular yield zerado para preço médio zero', () => {
      const result = calculateDividendDetails(500, 100, 0)

      expect(result.totalValue).toBe(50000)
      expect(result.yieldPercent).toBe(0)
    })
  })

  describe('calculateBonusShares - Conforme Documento', () => {
    it('deve calcular bonificação conforme fórmula do documento', () => {
      // Cenário: 100 ações a AOA 18.000 de custo médio, bonificação de 10 ações
      const result = calculateBonusShares(100, 18000, 10)

      expect(result.newQuantity).toBe(110) // 100 + 10
      expect(result.newAveragePrice).toBeCloseTo(16363.64, 2) // 1.800.000 / 110
      expect(result.totalValue).toBe(1800000) // Valor total não muda
    })

    it('deve tratar quantidade zero corretamente', () => {
      const result = calculateBonusShares(0, 0, 10)

      expect(result.newQuantity).toBe(10)
      expect(result.newAveragePrice).toBe(0)
      expect(result.totalValue).toBe(0)
    })

    it('deve seguir a fórmula exata do documento', () => {
      // Verificar a fórmula: Novo Custo Médio = (Custo Médio Atual * Quantidade Atual) / (Quantidade Atual + Quantidade Bonificada)
      const currentQuantity = 50
      const currentAveragePrice = 20000
      const bonusQuantity = 25

      const result = calculateBonusShares(currentQuantity, currentAveragePrice, bonusQuantity)

      const expectedTotalInvestment = currentQuantity * currentAveragePrice // 1.000.000
      const expectedNewQuantity = currentQuantity + bonusQuantity // 75
      const expectedNewAveragePrice = expectedTotalInvestment / expectedNewQuantity // 13.333,33

      expect(result.newQuantity).toBe(expectedNewQuantity)
      expect(result.newAveragePrice).toBeCloseTo(expectedNewAveragePrice, 2)
      expect(result.totalValue).toBe(expectedTotalInvestment)
    })
  })

  describe('consolidateDividendsByAsset', () => {
    it('deve consolidar proventos por ativo corretamente', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          userId: 'user1',
          custodyAccountId: 'acc1',
          assetId: 'BFA',
          type: 'DIVIDEND',
          quantity: 100,
          price: 500,
          date: new Date('2024-01-15'),
          total: 50000,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          userId: 'user1',
          custodyAccountId: 'acc1',
          assetId: 'BFA',
          type: 'DIVIDEND',
          quantity: 100,
          price: 600,
          date: new Date('2024-07-15'),
          total: 60000,
          paymentDate: new Date('2024-07-20'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          userId: 'user1',
          custodyAccountId: 'acc1',
          assetId: 'BFA',
          type: 'INTEREST',
          quantity: 100,
          price: 200,
          date: new Date('2024-03-15'),
          total: 20000,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      const result = consolidateDividendsByAsset(transactions, mockAssets)

      expect(result).toHaveLength(1)
      
      const bfaSummary = result[0]
      expect(bfaSummary.assetId).toBe('BFA')
      expect(bfaSummary.assetName).toBe('Banco de Fomento Angola')
      expect(bfaSummary.totalDividendsReceived).toBe(110000) // 50000 + 60000
      expect(bfaSummary.totalInterestReceived).toBe(20000)
      expect(bfaSummary.paymentsCount).toBe(3)
      expect(bfaSummary.lastPaymentDate).toEqual(new Date('2024-07-20'))
      
      // Verificar breakdown anual
      expect(bfaSummary.yearlyBreakdown).toHaveLength(1)
      expect(bfaSummary.yearlyBreakdown[0].year).toBe(2024)
      expect(bfaSummary.yearlyBreakdown[0].totalValue).toBe(130000)
      expect(bfaSummary.yearlyBreakdown[0].paymentsCount).toBe(3)
    })

    it('deve tratar bonificações corretamente', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          userId: 'user1',
          custodyAccountId: 'acc1',
          assetId: 'BFA',
          type: 'DIVIDEND',
          quantity: 100,
          price: 0, // Bonificação tem preço zero
          date: new Date('2024-01-15'),
          total: 0,
          bonusQuantity: 10, // 10 ações bonificadas
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      const result = consolidateDividendsByAsset(transactions, mockAssets)

      expect(result).toHaveLength(1)
      expect(result[0].totalBonusShares).toBe(10)
      expect(result[0].totalDividendsReceived).toBe(0)
    })

    it('deve separar breakdown por anos diferentes', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          userId: 'user1',
          custodyAccountId: 'acc1',
          assetId: 'BFA',
          type: 'DIVIDEND',
          quantity: 100,
          price: 500,
          date: new Date('2023-12-15'),
          total: 50000,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          userId: 'user1',
          custodyAccountId: 'acc1',
          assetId: 'BFA',
          type: 'DIVIDEND',
          quantity: 100,
          price: 600,
          date: new Date('2024-01-15'),
          total: 60000,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      const result = consolidateDividendsByAsset(transactions, mockAssets)

      expect(result[0].yearlyBreakdown).toHaveLength(2)
      
      // Deve estar ordenado por ano (mais recente primeiro)
      expect(result[0].yearlyBreakdown[0].year).toBe(2024)
      expect(result[0].yearlyBreakdown[0].totalValue).toBe(60000)
      expect(result[0].yearlyBreakdown[1].year).toBe(2023)
      expect(result[0].yearlyBreakdown[1].totalValue).toBe(50000)
    })

    it('deve ignorar transações que não são proventos', () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          userId: 'user1',
          custodyAccountId: 'acc1',
          assetId: 'BFA',
          type: 'BUY',
          quantity: 100,
          price: 18000,
          date: new Date('2024-01-15'),
          total: 1800000,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          userId: 'user1',
          custodyAccountId: 'acc1',
          assetId: 'BFA',
          type: 'DIVIDEND',
          quantity: 100,
          price: 500,
          date: new Date('2024-02-15'),
          total: 50000,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      const result = consolidateDividendsByAsset(transactions, mockAssets)

      expect(result).toHaveLength(1)
      expect(result[0].paymentsCount).toBe(1) // Apenas o dividendo
      expect(result[0].totalDividendsReceived).toBe(50000)
    })
  })
})
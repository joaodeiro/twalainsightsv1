// Mock do Supabase para evitar dependências externas
jest.mock('@/lib/supabase', () => ({
  supabase: {}
}))

import { calculatePortfolioStats } from '@/lib/portfolio'
import type { Transaction, Asset } from '@/types'

describe('calculatePortfolioStats', () => {
  // Mock de ativos para os testes
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
    },
    {
      id: 'BAI',
      ticker: 'BAI',
      name: 'Banco Angolano de Investimentos',
      sector: 'Bancos', 
      currency: 'AOA',
      currentPrice: 15000,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  // Função auxiliar para criar transações
  const createTransaction = (
    type: 'BUY' | 'SELL' | 'DIVIDEND' | 'INTEREST',
    assetId: string,
    quantity: number,
    price: number,
    fees: number = 0,
    date: string = '2024-01-01'
  ): Transaction => ({
    id: `tx-${Date.now()}-${Math.random()}`,
    userId: 'test-user',
    custodyAccountId: 'test-account',
    assetId,
    type,
    quantity,
    price,
    date: new Date(date),
    total: (quantity * price) + fees, // Total inclui fees
    fees,
    createdAt: new Date(),
    updatedAt: new Date()
  })

  it('deve retornar valores zerados para portfólio vazio', () => {
    const result = calculatePortfolioStats([], mockAssets)
    
    expect(result.totalInvested).toBe(0)
    expect(result.totalSold).toBe(0)
    expect(result.totalIncome).toBe(0)
    expect(result.currentValue).toBe(0)
    expect(result.totalReturn).toBe(0)
    expect(result.totalReturnPercent).toBe(0)
    expect(result.positions).toHaveLength(0)
    expect(result.totalTransactions).toBe(0)
    expect(result.uniqueAssets).toBe(0)
  })

  describe('Cenários de Compra - Conforme Documento', () => {
    it('deve calcular corretamente primeira compra do ativo BFA', () => {
      // Cenário 1 do documento: Primeira compra de 10 ações BFA a AOA 18.000 cada, com AOA 100 de taxas
      const transactions = [
        createTransaction('BUY', 'BFA', 10, 18000, 100, '2024-01-01')
      ]

      const result = calculatePortfolioStats(transactions, mockAssets)

      // Verificações conforme documento
      expect(result.totalInvested).toBe(180100) // (10 * 18000) + 100
      expect(result.positions).toHaveLength(1)
      
      const bfaPosition = result.positions.find(p => p.assetId === 'BFA')!
      expect(bfaPosition.quantity).toBe(10)
      expect(bfaPosition.averagePrice).toBe(18010) // 180100 / 10
      expect(bfaPosition.totalInvested).toBe(180100)
    })

    it('deve calcular corretamente segunda compra (custo médio ponderado)', () => {
      // Cenário 2 do documento: Segunda compra de 5 ações BFA a AOA 18.500 cada, com AOA 50 de taxas
      const transactions = [
        createTransaction('BUY', 'BFA', 10, 18000, 100, '2024-01-01'),
        createTransaction('BUY', 'BFA', 5, 18500, 50, '2024-01-02')
      ]

      const result = calculatePortfolioStats(transactions, mockAssets)

      const bfaPosition = result.positions.find(p => p.assetId === 'BFA')!
      
      // Verificações conforme documento
      expect(bfaPosition.quantity).toBe(15) // 10 + 5
      expect(bfaPosition.totalInvested).toBe(272650) // 180100 + 92550
      expect(bfaPosition.averagePrice).toBeCloseTo(18176.67, 2) // 272650 / 15
      expect(result.totalInvested).toBe(272650)
    })
  })

  describe('Cenários de Venda - Conforme Documento', () => {
    it('deve calcular corretamente venda parcial com lucro', () => {
      // Baseado no exemplo do documento: venda de 5 ações a AOA 19.000 com AOA 60 de taxas
      const transactions = [
        createTransaction('BUY', 'BFA', 15, 18176.67, 0, '2024-01-01'), // Posição inicial
        createTransaction('SELL', 'BFA', 5, 19000, 60, '2024-01-02')
      ]

      const result = calculatePortfolioStats(transactions, mockAssets)

      const bfaPosition = result.positions.find(p => p.assetId === 'BFA')!
      
      // Verificações conforme documento
      expect(bfaPosition.quantity).toBe(10) // 15 - 5
      expect(bfaPosition.averagePrice).toBeCloseTo(18176.67, 2) // Custo médio não muda na venda
      
      // Valor vendido: (5 * 19000) + 60 = 95060 (incluindo fees)
      // Custo das unidades vendidas: 5 * 18176.67 = 90883.35
      // Lucro realizado: 95060 - 90883.35 = 4056.65 (devido às taxas)
      expect(bfaPosition.realizedProfit).toBeCloseTo(4056.65, 2)
    })

    it('deve calcular corretamente venda total', () => {
      const transactions = [
        createTransaction('BUY', 'BFA', 10, 18176.67, 0, '2024-01-01'),
        createTransaction('SELL', 'BFA', 10, 19500, 80, '2024-01-02')
      ]

      const result = calculatePortfolioStats(transactions, mockAssets)

      const bfaPosition = result.positions.find(p => p.assetId === 'BFA')!
      
      // Após venda total, quantidade deve ser zero
      expect(bfaPosition.quantity).toBe(0)
      
      // Valor vendido: (10 * 19500) + 80 = 195080
      // Custo das unidades: 10 * 18176.67 = 181766.70  
      // Lucro realizado: 195080 - 181766.70 = 13153.30 (devido às taxas)
      expect(bfaPosition.realizedProfit).toBeCloseTo(13153.30, 2)
    })
  })

  describe('Cenários de Proventos', () => {
    it('deve calcular dividendos corretamente', () => {
      const transactions = [
        createTransaction('BUY', 'BFA', 100, 18000, 0, '2024-01-01'),
        createTransaction('DIVIDEND', 'BFA', 100, 500, 0, '2024-02-01') // AOA 500 por ação
      ]

      const result = calculatePortfolioStats(transactions, mockAssets)

      const bfaPosition = result.positions.find(p => p.assetId === 'BFA')!
      
      expect(bfaPosition.quantity).toBe(100) // Dividendos não afetam quantidade
      expect(bfaPosition.totalIncome).toBe(50000) // 100 * 500
      expect(result.totalIncome).toBe(50000)
      
      // Retorno total deve incluir proventos
      expect(bfaPosition.totalReturn).toBe(bfaPosition.unrealizedProfit + bfaPosition.totalIncome)
    })

    it('deve calcular juros corretamente', () => {
      const transactions = [
        createTransaction('BUY', 'BAI', 50, 15000, 0, '2024-01-01'),
        createTransaction('INTEREST', 'BAI', 50, 200, 0, '2024-02-01') // AOA 200 por ação
      ]

      const result = calculatePortfolioStats(transactions, mockAssets)

      const baiPosition = result.positions.find(p => p.assetId === 'BAI')!
      
      expect(baiPosition.quantity).toBe(50) // Juros não afetam quantidade
      expect(baiPosition.totalIncome).toBe(10000) // 50 * 200
      expect(result.totalIncome).toBe(10000)
    })
  })

  describe('Cenários Complexos', () => {
    it('deve calcular portfólio multi-ativo com múltiplas operações', () => {
      const transactions = [
        // BFA: Compra, venda parcial, dividendo
        createTransaction('BUY', 'BFA', 100, 18000, 100, '2024-01-01'),
        createTransaction('SELL', 'BFA', 30, 19000, 50, '2024-02-01'),
        createTransaction('DIVIDEND', 'BFA', 70, 500, 0, '2024-03-01'),
        
        // BAI: Apenas compra e juros
        createTransaction('BUY', 'BAI', 200, 14000, 200, '2024-01-15'),
        createTransaction('INTEREST', 'BAI', 200, 300, 0, '2024-03-15')
      ]

      const result = calculatePortfolioStats(transactions, mockAssets)

      // Verificações gerais
      expect(result.positions).toHaveLength(2)
      expect(result.totalTransactions).toBe(5)
      expect(result.uniqueAssets).toBe(2)
      
      // Total investido deve ser soma das compras
      expect(result.totalInvested).toBe(1800100 + 2800200) // BFA: 1800100, BAI: 2800200
      
      // Total de proventos
      expect(result.totalIncome).toBe(35000 + 60000) // BFA: 35000, BAI: 60000
      
      // Posições ativas (quantidade > 0)
      const activePositions = result.positions.filter(p => p.quantity > 0)
      expect(activePositions).toHaveLength(2)
    })

    it('deve tratar operações em ordem cronológica', () => {
      // Transações fora de ordem cronológica
      const transactions = [
        createTransaction('SELL', 'BFA', 5, 19000, 0, '2024-01-03'), // Venda depois
        createTransaction('BUY', 'BFA', 10, 18000, 0, '2024-01-01'),  // Compra primeiro
        createTransaction('BUY', 'BFA', 5, 18500, 0, '2024-01-02')   // Segunda compra
      ]

      const result = calculatePortfolioStats(transactions, mockAssets)

      // Deve processar na ordem cronológica correta
      const bfaPosition = result.positions.find(p => p.assetId === 'BFA')!
      expect(bfaPosition.quantity).toBe(10) // 10 + 5 - 5
      expect(bfaPosition.realizedProfit).toBeGreaterThan(0) // Deve ter lucro da venda
    })
  })

  describe('Cálculos de Performance', () => {
    it('deve calcular retorno percentual total corretamente', () => {
      const transactions = [
        createTransaction('BUY', 'BFA', 10, 18000, 100, '2024-01-01'), // Investido: 180100
        createTransaction('DIVIDEND', 'BFA', 10, 500, 0, '2024-02-01')  // Proventos: 5000
      ]

      const result = calculatePortfolioStats(transactions, mockAssets)

      // Valor atual: 10 * 19000 = 190000 (preço atual do mock)
      // Lucro não realizado: 190000 - 180100 = 9900
      // Retorno total: 9900 + 5000 = 14900
      // Retorno %: (14900 / 180100) * 100 = 8.27%
      
      expect(result.currentValue).toBe(190000)
      expect(result.totalReturn).toBeCloseTo(14900, 0)
      expect(result.totalReturnPercent).toBeCloseTo(8.27, 2)
    })

    it('deve calcular prejuízo corretamente', () => {
      const transactions = [
        createTransaction('BUY', 'BFA', 10, 20000, 100, '2024-01-01') // Compra a preço alto
      ]

      const result = calculatePortfolioStats(transactions, mockAssets)

      // Investido: 200100, Valor atual: 190000
      // Prejuízo não realizado: 190000 - 200100 = -10100
      expect(result.totalReturn).toBeCloseTo(-10100, 0)
      expect(result.totalReturnPercent).toBeLessThan(0)
    })
  })
})
// Testes para Sistema de Transferências - Twala Insights

import { 
  validateTransfer,
  executeTransfer,
  createTransfer
} from '@/lib/transfers'
import type { Transfer, Transaction, Asset, CustodyAccount } from '@/types'

// Mock de dados
const mockAccounts: CustodyAccount[] = [
  {
    id: 'acc-001',
    userId: 'user-001',
    brokerName: 'Corretora A',
    accountNickname: 'Conta Principal',
    accountNumber: '12345',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'acc-002',
    userId: 'user-001',
    brokerName: 'Corretora B',
    accountNickname: 'Conta Secundária',
    accountNumber: '67890',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

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
  }
]

const mockTransactions: Transaction[] = [
  {
    id: 'trans-001',
    userId: 'user-001',
    custodyAccountId: 'acc-001',
    assetId: 'bfa-001',
    type: 'BUY',
    quantity: 100,
    price: 18000,
    date: new Date('2024-01-01'),
    operationDate: new Date('2024-01-01'),
    unitPrice: 18000,
    fees: 500,
    totalOperationValue: 1800500,
    total: 1800500,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

describe('Sistema de Transferências', () => {
  
  describe('validateTransfer', () => {
    it('deve validar transferência válida', () => {
      const transferData: Partial<Transfer> = {
        fromCustodyAccountId: 'acc-001',
        toCustodyAccountId: 'acc-002',
        assetId: 'bfa-001',
        quantity: 50
      }
      
      const result = validateTransfer(
        transferData,
        mockTransactions,
        mockAccounts,
        mockAssets
      )
      
      expect(result.isValid).toBe(true)
      expect(result.availableQuantity).toBe(100)
      expect(result.requestedQuantity).toBe(50)
      expect(result.sourcePositionAfter.quantity).toBe(50)
    })

    it('deve rejeitar quantidade insuficiente', () => {
      const transferData: Partial<Transfer> = {
        fromCustodyAccountId: 'acc-001',
        toCustodyAccountId: 'acc-002',
        assetId: 'bfa-001',
        quantity: 150 // Maior que disponível
      }
      
      const result = validateTransfer(
        transferData,
        mockTransactions,
        mockAccounts,
        mockAssets
      )
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Quantidade insuficiente. Disponível: 100, Solicitado: 150')
    })

    it('deve calcular custo médio ponderado no destino', () => {
      // Adicionar posição existente no destino
      const destTransaction: Transaction = {
        ...mockTransactions[0],
        id: 'trans-002',
        custodyAccountId: 'acc-002',
        quantity: 30,
        price: 20000
      }
      
      const allTransactions = [...mockTransactions, destTransaction]
      
      const transferData: Partial<Transfer> = {
        fromCustodyAccountId: 'acc-001',
        toCustodyAccountId: 'acc-002',
        assetId: 'bfa-001',
        quantity: 50
      }
      
      const result = validateTransfer(
        transferData,
        allTransactions,
        mockAccounts,
        mockAssets
      )
      
      expect(result.isValid).toBe(true)
      expect(result.destinationPositionAfter.quantity).toBe(80) // 30 + 50
      // Custo médio ponderado: (30*20000.5 + 50*18005) / 80 = 18759.375
      expect(result.destinationPositionAfter.averagePrice).toBeCloseTo(18759.375)
    })

    it('deve validar campos obrigatórios', () => {
      const invalidTransfer: Partial<Transfer> = {
        quantity: 50
      }
      
      const result = validateTransfer(
        invalidTransfer,
        mockTransactions,
        mockAccounts,
        mockAssets
      )
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Conta de origem é obrigatória')
      expect(result.errors).toContain('Conta de destino é obrigatória')
      expect(result.errors).toContain('Ativo é obrigatório')
    })

    it('deve rejeitar contas iguais', () => {
      const transferData: Partial<Transfer> = {
        fromCustodyAccountId: 'acc-001',
        toCustodyAccountId: 'acc-001', // Mesma conta
        assetId: 'bfa-001',
        quantity: 50
      }
      
      const result = validateTransfer(
        transferData,
        mockTransactions,
        mockAccounts,
        mockAssets
      )
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Conta de origem e destino não podem ser iguais')
    })
  })

  describe('executeTransfer', () => {
    it('deve executar transferência criando transações fictícias', () => {
      const transfer: Transfer = {
        id: 'transfer-001',
        userId: 'user-001',
        type: 'INTERNAL',
        fromCustodyAccountId: 'acc-001',
        toCustodyAccountId: 'acc-002',
        assetId: 'bfa-001',
        quantity: 50,
        transferredAverageCost: 18005,
        transferredTotalInvested: 900250,
        requestDate: '2024-01-15',
        status: 'PENDING',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      }
      
      const result = executeTransfer(transfer, mockTransactions)
      
      expect(result.success).toBe(true)
      expect(result.sourceTransaction).toBeDefined()
      expect(result.destinationTransaction).toBeDefined()
      
      // Transação de saída
      expect(result.sourceTransaction?.type).toBe('SELL')
      expect(result.sourceTransaction?.custodyAccountId).toBe('acc-001')
      expect(result.sourceTransaction?.quantity).toBe(50)
      expect(result.sourceTransaction?.fees).toBe(0) // Transferências sem taxa
      
      // Transação de entrada
      expect(result.destinationTransaction?.type).toBe('BUY')
      expect(result.destinationTransaction?.custodyAccountId).toBe('acc-002')
      expect(result.destinationTransaction?.quantity).toBe(50)
      expect(result.destinationTransaction?.price).toBe(18005)
    })
  })

  describe('createTransfer', () => {
    it('deve criar transferência válida', () => {
      const transferData: Partial<Transfer> = {
        fromCustodyAccountId: 'acc-001',
        toCustodyAccountId: 'acc-002',
        assetId: 'bfa-001',
        quantity: 50,
        transferredAverageCost: 18000,
        description: 'Transferência teste'
      }
      
      const result = createTransfer(transferData, 'user-001')
      
      expect(result.transfer).toBeDefined()
      expect(result.errors).toHaveLength(0)
      expect(result.transfer?.status).toBe('PENDING')
      expect(result.transfer?.transferredTotalInvested).toBe(900000) // 50 * 18000
    })

    it('deve validar campos obrigatórios', () => {
      const invalidTransfer: Partial<Transfer> = {
        quantity: 50
      }
      
      const result = createTransfer(invalidTransfer, 'user-001')
      
      expect(result.transfer).toBeUndefined()
      expect(result.errors).toContain('Conta de origem é obrigatória')
      expect(result.errors).toContain('Custo médio transferido deve ser maior que zero')
    })
  })
})
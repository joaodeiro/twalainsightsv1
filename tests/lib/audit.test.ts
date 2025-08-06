// Testes para Sistema de Auditoria - Twala Insights

import { 
  createAuditLog,
  createManualAdjustment,
  processManualAdjustment,
  generateAuditReport,
  isAuditable,
  createReversal
} from '@/lib/audit'
import type { AuditLog, ManualAdjustment } from '@/types'

describe('Sistema de Auditoria', () => {
  
  describe('createAuditLog', () => {
    it('deve criar log de auditoria básico', () => {
      const log = createAuditLog(
        'TRANSACTION',
        'trans-001',
        'CREATE',
        {
          newData: { amount: 1000 },
          userId: 'user-001',
          reason: 'Nova transação'
        }
      )
      
      expect(log.entityType).toBe('TRANSACTION')
      expect(log.entityId).toBe('trans-001')
      expect(log.action).toBe('CREATE')
      expect(log.newData).toEqual({ amount: 1000 })
      expect(log.userId).toBe('user-001')
      expect(log.id).toBeDefined()
      expect(log.timestamp).toBeDefined()
    })

    it('deve detectar campos alterados automaticamente', () => {
      const previousData = { name: 'João', age: 30, city: 'Luanda' }
      const newData = { name: 'João Silva', age: 31, city: 'Luanda' }
      
      const log = createAuditLog(
        'TRANSACTION',
        'trans-001',
        'UPDATE',
        { previousData, newData }
      )
      
      expect(log.changedFields).toContain('name')
      expect(log.changedFields).toContain('age')
      expect(log.changedFields).not.toContain('city')
    })
  })

  describe('createManualAdjustment', () => {
    it('deve criar ajuste manual válido', () => {
      const adjustmentData: Partial<ManualAdjustment> = {
        positionId: 'pos-001',
        custodyAccountId: 'acc-001',
        assetId: 'bfa-001',
        adjustmentType: 'QUANTITY',
        previousValue: 100,
        newValue: 105,
        reason: 'Correção de bonificação não registrada automaticamente'
      }
      
      const result = createManualAdjustment(adjustmentData, 'user-001')
      
      expect(result.adjustment).toBeDefined()
      expect(result.errors).toHaveLength(0)
      expect(result.adjustment?.difference).toBe(5)
      expect(result.adjustment?.status).toBe('PENDING')
    })

    it('deve validar campos obrigatórios', () => {
      const invalidAdjustment: Partial<ManualAdjustment> = {
        adjustmentType: 'QUANTITY'
      }
      
      const result = createManualAdjustment(invalidAdjustment, 'user-001')
      
      expect(result.adjustment).toBeUndefined()
      expect(result.errors).toContain('ID da posição é obrigatório')
      expect(result.errors).toContain('Razão do ajuste deve ter pelo menos 10 caracteres')
    })

    it('deve detectar mudanças significativas', () => {
      const adjustmentData: Partial<ManualAdjustment> = {
        positionId: 'pos-001',
        custodyAccountId: 'acc-001',
        assetId: 'bfa-001',
        adjustmentType: 'QUANTITY',
        previousValue: 100,
        newValue: 300, // 200% de aumento
        reason: 'Correção de erro significativo no sistema'
      }
      
      const result = createManualAdjustment(adjustmentData, 'user-001')
      
      expect(result.warnings).toContain('Mudança superior a 100% - verificar se está correto')
    })

    it('deve validar valores específicos por tipo', () => {
      const negativeQuantityAdjustment: Partial<ManualAdjustment> = {
        positionId: 'pos-001',
        custodyAccountId: 'acc-001',
        assetId: 'bfa-001',
        adjustmentType: 'QUANTITY',
        previousValue: 100,
        newValue: -10, // Quantidade negativa
        reason: 'Teste de quantidade negativa'
      }
      
      const result = createManualAdjustment(negativeQuantityAdjustment, 'user-001')
      
      expect(result.errors).toContain('Quantidade não pode ser negativa')
    })

    it('deve validar custo médio positivo', () => {
      const zeroCostAdjustment: Partial<ManualAdjustment> = {
        positionId: 'pos-001',
        custodyAccountId: 'acc-001',
        assetId: 'bfa-001',
        adjustmentType: 'AVERAGE_COST',
        previousValue: 18000,
        newValue: 0, // Custo zero
        reason: 'Teste de custo médio inválido'
      }
      
      const result = createManualAdjustment(zeroCostAdjustment, 'user-001')
      
      expect(result.errors).toContain('Custo médio deve ser maior que zero')
    })
  })

  describe('processManualAdjustment', () => {
    it('deve aprovar ajuste manual', () => {
      const adjustment: ManualAdjustment = {
        id: 'adj-001',
        positionId: 'pos-001',
        custodyAccountId: 'acc-001',
        assetId: 'bfa-001',
        adjustmentType: 'QUANTITY',
        previousValue: 100,
        newValue: 105,
        difference: 5,
        reason: 'Correção necessária',
        status: 'PENDING',
        createdAt: '2024-01-01',
        createdBy: 'user-001',
        updatedAt: '2024-01-01'
      }
      
      const result = processManualAdjustment(adjustment, 'APPROVE', 'admin-001')
      
      expect(result.status).toBe('APPROVED')
      expect(result.approvedBy).toBe('admin-001')
      expect(result.approvedAt).toBeDefined()
      expect(result.rejectionReason).toBeUndefined()
    })

    it('deve rejeitar ajuste manual', () => {
      const adjustment: ManualAdjustment = {
        id: 'adj-001',
        positionId: 'pos-001',
        custodyAccountId: 'acc-001',
        assetId: 'bfa-001',
        adjustmentType: 'QUANTITY',
        previousValue: 100,
        newValue: 105,
        difference: 5,
        reason: 'Correção necessária',
        status: 'PENDING',
        createdAt: '2024-01-01',
        createdBy: 'user-001',
        updatedAt: '2024-01-01'
      }
      
      const result = processManualAdjustment(
        adjustment, 
        'REJECT', 
        'admin-001', 
        'Documentação insuficiente'
      )
      
      expect(result.status).toBe('REJECTED')
      expect(result.approvedBy).toBe('admin-001')
      expect(result.rejectionReason).toBe('Documentação insuficiente')
    })
  })

  describe('generateAuditReport', () => {
    const mockLogs: AuditLog[] = [
      {
        id: 'log-001',
        entityType: 'TRANSACTION',
        entityId: 'trans-001',
        action: 'CREATE',
        newData: { amount: 1000 },
        userId: 'user-001',
        timestamp: '2024-01-01T10:00:00Z',
        source: 'WEB',
        isReversible: true
      },
      {
        id: 'log-002',
        entityType: 'TRANSACTION',
        entityId: 'trans-001',
        action: 'UPDATE',
        previousData: { amount: 1000 },
        newData: { amount: 1500 },
        userId: 'user-002',
        timestamp: '2024-01-02T10:00:00Z',
        source: 'API',
        isReversible: true
      },
      {
        id: 'log-003',
        entityType: 'MANUAL_ADJUSTMENT',
        entityId: 'adj-001',
        action: 'APPROVE',
        userId: 'admin-001',
        timestamp: '2024-01-03T10:00:00Z',
        source: 'WEB',
        isReversible: false
      }
    ]

    it('deve gerar relatório completo', () => {
      const query = {}
      const report = generateAuditReport(mockLogs, query)
      
      expect(report.totalRecords).toBe(3)
      expect(report.logs).toHaveLength(3)
      expect(report.actionSummary.CREATE).toBe(1)
      expect(report.actionSummary.UPDATE).toBe(1)
      expect(report.actionSummary.APPROVE).toBe(1)
      expect(report.entitySummary.TRANSACTION).toBe(2)
      expect(report.entitySummary.MANUAL_ADJUSTMENT).toBe(1)
    })

    it('deve filtrar por tipo de entidade', () => {
      const query = { entityType: 'TRANSACTION' as const }
      const report = generateAuditReport(mockLogs, query)
      
      expect(report.totalRecords).toBe(2)
      expect(report.logs.every(log => log.entityType === 'TRANSACTION')).toBe(true)
    })

    it('deve filtrar por usuário', () => {
      const query = { userId: 'user-001' }
      const report = generateAuditReport(mockLogs, query)
      
      expect(report.totalRecords).toBe(1)
      expect(report.logs[0].userId).toBe('user-001')
    })

    it('deve aplicar paginação', () => {
      const query = { limit: 2, offset: 1 }
      const report = generateAuditReport(mockLogs, query)
      
      expect(report.logs).toHaveLength(2)
      expect(report.totalRecords).toBe(3) // Total não muda
    })

    it('deve gerar estatísticas de atividade do usuário', () => {
      const query = {}
      const report = generateAuditReport(mockLogs, query)
      
      expect(report.userActivity).toHaveLength(3)
      
      const user001Activity = report.userActivity.find(u => u.userId === 'user-001')
      expect(user001Activity?.actionCount).toBe(1)
      
      const user002Activity = report.userActivity.find(u => u.userId === 'user-002')
      expect(user002Activity?.actionCount).toBe(1)
    })
  })

  describe('isAuditable', () => {
    it('deve identificar operações críticas como auditáveis', () => {
      expect(isAuditable('TRANSACTION', 'CREATE')).toBe(true)
      expect(isAuditable('MANUAL_ADJUSTMENT', 'APPROVE')).toBe(true)
      expect(isAuditable('TRANSFER', 'EXECUTE')).toBe(true)
    })

    it('deve identificar operações não críticas como não auditáveis', () => {
      expect(isAuditable('PORTFOLIO_POSITION', 'CALCULATE')).toBe(false)
    })
  })

  describe('createReversal', () => {
    it('deve criar reversão de log auditável', () => {
      const originalLog: AuditLog = {
        id: 'log-001',
        entityType: 'TRANSACTION',
        entityId: 'trans-001',
        action: 'CREATE',
        newData: { amount: 1000 },
        userId: 'user-001',
        timestamp: '2024-01-01T10:00:00Z',
        source: 'WEB',
        isReversible: true
      }
      
      const reversal = createReversal(originalLog, 'Erro detectado', 'admin-001')
      
      expect(reversal.action).toBe('DELETE')
      expect(reversal.previousData).toEqual(originalLog.newData)
      expect(reversal.newData).toEqual(originalLog.previousData)
      expect(reversal.reason).toBe('Erro detectado')
      expect(reversal.isReversible).toBe(false)
      expect(originalLog.reversalLogId).toBe(reversal.id)
    })

    it('deve rejeitar reversão de log não reversível', () => {
      const nonReversibleLog: AuditLog = {
        id: 'log-001',
        entityType: 'TRANSACTION',
        entityId: 'trans-001',
        action: 'CREATE',
        timestamp: '2024-01-01T10:00:00Z',
        source: 'WEB',
        isReversible: false
      }
      
      expect(() => {
        createReversal(nonReversibleLog, 'Tentativa de reversão', 'admin-001')
      }).toThrow('Esta operação não pode ser revertida')
    })
  })
})
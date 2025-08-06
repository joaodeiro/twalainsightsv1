'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Edit3, Trash2, Plus, Download } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { ExportSelector, type ExportType } from '@/components/ui/ExportSelector'
import { getAssets } from '@/lib/assets'
import { useApp } from '@/contexts/AppContext'
import { Header } from '@/components/ui/Header'
import { 
  exportTransactionsToCSV, 
  exportTransactionsToPDF 
} from '@/lib/export'
import type { Asset } from '@/types'

export default function TransactionsPage() {
  const { transactions, custodyAccounts, removeTransaction } = useApp()
  const { showToast, ToastContainer } = useToast()
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>([])
  const [showExportSelector, setShowExportSelector] = useState(false)

  // Carregar ativos na inicialização
  useEffect(() => {
    const loadAssets = async () => {
      const assetsData = await getAssets()
      setAssets(assetsData)
    }
    loadAssets()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
    }).format(value)
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Data inválida'
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Verificar se a data é válida
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida'
    }
    
    return new Intl.DateTimeFormat('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj)
  }

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'BUY': return 'Compra'
      case 'SELL': return 'Venda'
      case 'DIVIDEND': return 'Dividendo'
      case 'INTEREST': return 'Juros'
      default: return type
    }
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'BUY': return 'bg-success-100 text-success-800'
      case 'SELL': return 'bg-error-100 text-error-800'
      case 'DIVIDEND': return 'bg-warning-100 text-warning-800'
      case 'INTEREST': return 'bg-primary-100 text-primary-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleEdit = (transactionId: string) => {
    router.push(`/transactions/edit/${transactionId}`)
  }

  const handleDelete = async (transactionId: string, assetName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a transação de ${assetName}? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      await removeTransaction(transactionId)
      showToast('Transação excluída com sucesso!', 'success')
    } catch (error) {
      console.error('Erro ao excluir transação:', error)
      showToast('Erro ao excluir transação. Tente novamente.', 'error')
    }
  }

  const handleAddTransaction = () => {
    router.push('/portfolio')
  }

  const handleExportTransactions = () => {
    setShowExportSelector(true)
  }

  const handleExportSelect = async (type: ExportType) => {
    try {
      if (type === 'CSV') {
        await exportTransactionsToCSV(transactions, custodyAccounts)
        showToast('success', 'Histórico exportado em CSV com sucesso!')
      } else {
        await exportTransactionsToPDF(transactions, custodyAccounts)
        showToast('success', 'Histórico exportado em PDF com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao exportar:', error)
      showToast('error', 'Erro ao exportar histórico. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Histórico de Transações
              </h1>
              <p className="text-gray-600">
                Visualize e gerencie todas as suas operações de investimento.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleExportTransactions}
                variant="secondary"
                className="flex items-center gap-2"
                disabled={transactions.length === 0}
              >
                <Download className="w-4 h-4" />
                Exportar
              </Button>
              <Button
                onClick={handleAddTransaction}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Transação
              </Button>
            </div>
          </div>
        </div>

        <ToastContainer />
        
        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card padding="sm">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total de Transações</p>
                <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
              </div>
            </Card>
            <Card padding="sm">
              <div className="text-center">
                <p className="text-sm text-gray-600">Compras</p>
                <p className="text-2xl font-bold text-success-600">
                  {transactions.filter(t => t.type === 'BUY').length}
                </p>
              </div>
            </Card>
            <Card padding="sm">
              <div className="text-center">
                <p className="text-sm text-gray-600">Vendas</p>
                <p className="text-2xl font-bold text-error-600">
                  {transactions.filter(t => t.type === 'SELL').length}
                </p>
              </div>
            </Card>
            <Card padding="sm">
              <div className="text-center">
                <p className="text-sm text-gray-600">Proventos</p>
                <p className="text-2xl font-bold text-warning-600">
                  {transactions.filter(t => t.type === 'DIVIDEND' || t.type === 'INTEREST').length}
                </p>
              </div>
            </Card>
          </div>

          {/* Lista de Transações */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Transações ({transactions.length})
            </h2>
            
            {transactions.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma transação registrada
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Comece registrando suas primeiras transações para ver o histórico aqui.
                  </p>
                  <Button 
                    onClick={() => window.history.back()}
                    className="btn-primary"
                  >
                    Voltar
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => {
                  const asset = assets.find(a => a.id === transaction.assetId)
                  const account = custodyAccounts.find(a => a.id === transaction.custodyAccountId)
                  
                  return (
                    <Card key={transaction.id} padding="sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3 flex-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                            {getTransactionTypeLabel(transaction.type)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(transaction.date)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold text-gray-900">
                            {formatCurrency(transaction.total)}
                          </span>
                          
                          {/* Botões de ação */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEdit(transaction.id)}
                              className="p-2 hover:bg-primary-50 hover:text-primary-600"
                              title="Editar transação"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleDelete(transaction.id, asset?.name || 'ativo')}
                              className="p-2 hover:bg-red-50 hover:text-red-600"
                              title="Excluir transação"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">
                          {asset?.ticker} - {asset?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {transaction.quantity} ações × {formatCurrency(transaction.price)}
                          {transaction.fees && transaction.fees > 0 && (
                            <span className="text-gray-500"> + {formatCurrency(transaction.fees)} taxas</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          Conta: {account?.name || account?.accountNickname}
                        </p>
                        {transaction.notes && (
                          <p className="text-sm text-gray-600 italic">
                            &quot;{transaction.notes}&quot;
                          </p>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Exportação */}
      <ExportSelector
        isOpen={showExportSelector}
        onClose={() => setShowExportSelector(false)}
        onSelect={handleExportSelect}
        title="Exportar Histórico"
        description="Escolha o formato para exportar seu histórico de transações:"
      />
    </div>
  )
}
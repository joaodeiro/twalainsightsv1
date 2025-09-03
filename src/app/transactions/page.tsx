'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Edit3, Trash2, Plus, Download, Calculator, Filter, TrendingUp, TrendingDown, DollarSign, Activity, Calendar, ChevronDown, ArrowUpCircle, ArrowDownCircle, ArrowRightLeft } from 'lucide-react'
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
import type { Asset, Transaction } from '@/types'

type PeriodFilter = 'all' | 'today' | '7d' | '30d' | '3m' | '6m' | '1y'
type TypeFilter = 'all' | 'BUY' | 'SELL' | 'DIVIDEND' | 'INTEREST'

export default function TransactionsPage() {
  const { transactions, custodyAccounts, removeTransaction } = useApp()
  const { showToast, ToastContainer } = useToast()
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>([])
  const [showExportSelector, setShowExportSelector] = useState(false)
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'asset'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Carregar ativos na inicialização
  useEffect(() => {
    const loadAssets = async () => {
      const assetsData = await getAssets()
      setAssets(assetsData)
    }
    loadAssets()
  }, [])

  // Filtrar transações por período e tipo
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]
    
    // Filtrar por período
    if (periodFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (periodFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case '7d':
          filterDate.setDate(now.getDate() - 7)
          break
        case '30d':
          filterDate.setDate(now.getDate() - 30)
          break
        case '3m':
          filterDate.setDate(now.getDate() - 90)
          break
        case '6m':
          filterDate.setDate(now.getDate() - 180)
          break
        case '1y':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter(t => {
        if (!t.date) return false
        const transactionDate = new Date(t.date)
        return transactionDate >= filterDate
      })
    }
    
    // Filtrar por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter)
    }
    
    // Ordenar transações
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
           const dateA = a.date ? new Date(a.date).getTime() : 0
           const dateB = b.date ? new Date(b.date).getTime() : 0
           comparison = dateA - dateB
           break
        case 'value':
          comparison = (a.totalOperationValue || a.total || 0) - (b.totalOperationValue || b.total || 0)
          break
        case 'asset':
          const assetA = assets.find(asset => asset.id === a.assetId)?.ticker || ''
          const assetB = assets.find(asset => asset.id === b.assetId)?.ticker || ''
          comparison = assetA.localeCompare(assetB)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    return filtered
  }, [transactions, periodFilter, typeFilter, sortBy, sortOrder, assets])

  // Calcular estatísticas do período
  const periodStats = useMemo(() => {
    const buys = filteredTransactions.filter(t => t.type === 'BUY')
    const sells = filteredTransactions.filter(t => t.type === 'SELL')
    const dividends = filteredTransactions.filter(t => t.type === 'DIVIDEND' || t.type === 'INTEREST')
    
    const totalBuyValue = buys.reduce((sum, t) => sum + (t.totalOperationValue || t.total || 0), 0)
    const totalSellValue = sells.reduce((sum, t) => sum + (t.totalOperationValue || t.total || 0), 0)
    const totalDividendValue = dividends.reduce((sum, t) => sum + (t.totalOperationValue || t.total || 0), 0)
    
    return {
      totalTransactions: filteredTransactions.length,
      totalBuys: buys.length,
      totalSells: sells.length,
      totalDividends: dividends.length,
      totalBuyValue,
      totalSellValue,
      totalDividendValue,
      netFlow: totalBuyValue - totalSellValue
    }
  }, [filteredTransactions])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Data inválida'
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
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
      case 'BUY': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'SELL': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'DIVIDEND': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'INTEREST': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
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
      showToast('success', 'Transação excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir transação:', error)
      showToast('error', 'Erro ao excluir transação. Tente novamente.')
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
        await exportTransactionsToCSV(filteredTransactions, custodyAccounts)
        showToast('success', 'Histórico exportado em CSV com sucesso, meu!')
      } else {
        await exportTransactionsToPDF(filteredTransactions, custodyAccounts)
        showToast('success', 'Histórico exportado em PDF com sucesso, meu!')
      }
    } catch (error) {
      console.error('Erro ao exportar:', error)
      showToast('error', 'Eish, deu erro ao exportar o histórico. Tenta outra vez, né.')
    }
  }

  const getPeriodLabel = (period: PeriodFilter) => {
    switch (period) {
      case 'all': return 'Desde sempre'
      case 'today': return 'Hoje'
      case '7d': return 'Últimos 7 dias'
      case '30d': return 'Últimos 30 dias'
      case '3m': return 'Últimos 3 meses'
      case '6m': return 'Últimos 6 meses'
      case '1y': return 'Últimos 12 meses'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Histórico das Minhas Operações
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Aqui podes ver e gerir todas as tuas operações de investimento, meu.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleExportTransactions}
                variant="secondary"
                className="flex items-center gap-2"
                disabled={filteredTransactions.length === 0}
              >
                <Download className="w-4 h-4" />
                Exportar
              </Button>
              <Button
                onClick={handleAddTransaction}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Operação
              </Button>
            </div>
          </div>
        </div>

        <ToastContainer />
        
        <div className="space-y-6">
          {/* Cards de Estatísticas Modernos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total de Transações */}
            <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Total de Operações</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{periodStats.totalTransactions}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/30 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            {/* Volume de Compras */}
            <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Volume de Compras</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(periodStats.totalBuyValue)}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{periodStats.totalBuys} {periodStats.totalBuys === 1 ? 'operação' : 'operações'}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-800/30 rounded-lg flex items-center justify-center">
                  <ArrowUpCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            {/* Volume de Vendas */}
            <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Volume de Vendas</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(periodStats.totalSellValue)}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{periodStats.totalSells} {periodStats.totalSells === 1 ? 'operação' : 'operações'}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-800/30 rounded-lg flex items-center justify-center">
                  <ArrowDownCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>

            {/* Fluxo Líquido */}
            <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Fluxo Líquido</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(Math.abs(periodStats.netFlow))}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {periodStats.netFlow >= 0 ? 'Investimento' : 'Levantamento'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800/30 rounded-lg flex items-center justify-center">
                  <ArrowRightLeft className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Tabela de Transações */}
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Operações ({filteredTransactions.length})
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Filtra e organiza as tuas operações aqui
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Filtro por Tipo */}
                <div className="flex flex-col">
                  <div className="relative">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                      className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer min-w-[140px] shadow-sm"
                    >
                      <option value="all">Tipo: Todos os tipos</option>
                      <option value="BUY">Tipo: Compras</option>
                      <option value="SELL">Tipo: Vendas</option>
                      <option value="DIVIDEND">Tipo: Dividendos</option>
                      <option value="INTEREST">Tipo: Juros</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Filtro por Período */}
                <div className="flex flex-col">
                  <div className="relative">
                    <select
                      value={periodFilter}
                      onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
                      className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer min-w-[160px] shadow-sm"
                    >
                      <option value="all">Período: Desde sempre</option>
                      <option value="1y">Período: Últimos 12 meses</option>
                      <option value="6m">Período: Últimos 6 meses</option>
                      <option value="3m">Período: Últimos 3 meses</option>
                      <option value="30d">Período: Últimos 30 dias</option>
                      <option value="7d">Período: Últimos 7 dias</option>
                      <option value="today">Período: Hoje</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* Separador visual */}
                <div className="hidden lg:block w-px h-12 bg-gray-200 dark:bg-gray-700 mx-2"></div>
                
                {/* Ordenar por */}
                <div className="flex flex-col">
                  <div className="relative">
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'value' | 'asset')}
                      className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer min-w-[140px] shadow-sm"
                    >
                      <option value="date">Ordenar por: Data</option>
                      <option value="value">Ordenar por: Valor</option>
                      <option value="asset">Ordenar por: Ativo</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* Ordem */}
                <div className="flex flex-col">
                  <div className="relative">
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                      className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer min-w-[140px] shadow-sm"
                    >
                      <option value="desc">Ordem: Mais recente primeiro</option>
                      <option value="asc">Ordem: Mais antigo primeiro</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
            
            {filteredTransactions.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Calculator className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {periodFilter === 'all' ? 'Ainda não tens operações registadas' : 'Não há operações neste período'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {periodFilter === 'all' 
                      ? 'Começa por registar as tuas primeiras operações para veres o histórico aqui, meu.'
                      : 'Tenta selecionar um período diferente ou regista novas operações.'
                    }
                  </p>
                  <Button 
                    onClick={handleAddTransaction}
                    className="btn-primary"
                  >
                    Nova Operação
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Ativo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Quantidade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Preço Unitário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Valor Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Conta
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Acções
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredTransactions.map((transaction) => {
                        const asset = assets.find(a => a.id === transaction.assetId)
                        const account = custodyAccounts.find(a => a.id === transaction.custodyAccountId)
                        
                        return (
                          <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                                {getTransactionTypeLabel(transaction.type)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {asset?.ticker}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {asset?.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {transaction.quantity?.toLocaleString('pt-AO')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {formatCurrency(transaction.unitPrice || transaction.price || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatCurrency(transaction.totalOperationValue || transaction.total || 0)}
                              </div>
                              {transaction.fees && transaction.fees > 0 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  + {formatCurrency(transaction.fees)} taxas
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {account?.name || account?.accountNickname}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleEdit(transaction.id)}
                                  className="p-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                                  title="Editar operação"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleDelete(transaction.id, asset?.name || 'ativo')}
                                  className="p-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                  title="Apagar operação"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
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
        description="Escolhe o formato para exportar o teu histórico de operações:"
      />
    </div>
  )
}
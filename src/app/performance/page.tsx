'use client'

import { useState, useEffect, useMemo } from 'react'
import { useApp } from '@/contexts/AppContext'
import { getAssets } from '@/lib/assets'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'
import { Button } from '@/components/ui/Button'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  RefreshCw,
  Plus,
  History,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Target,
  AlertTriangle
} from 'lucide-react'
import type { Asset, Transaction, CustodyAccount } from '@/types'
import { PortfolioEvolutionChart } from '@/components/charts/PortfolioEvolutionChart'
import { PortfolioDistributionChart, CHART_COLORS } from '@/components/charts/PortfolioDistributionChart'
import { demoTransactions, demoCustodyAccounts, demoAssets } from '@/lib/demo-data'

interface PortfolioPosition {
  assetId: string
  assetName: string
  quantity: number
  avgPrice: number
  currentPrice: number
  totalCost: number
  marketValue: number
  totalReturn: number
  totalReturnPercent: number
  dayReturn: number
  dayReturnPercent: number
  weight: number
}

interface PortfolioMetrics {
  totalMarketValue: number
  totalCost: number
  totalReturn: number
  totalReturnPercent: number
  totalDayReturn: number
  totalDayReturnPercent: number
}

export default function PerformancePage() {
  const { transactions, custodyAccounts } = useApp()
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1A')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [showDemo, setShowDemo] = useState<boolean>(false)

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const assetsData = await getAssets()
        setAssets(assetsData)
      } catch (error) {
        console.error('Erro ao carregar ativos:', error)
        setAssets([])
      }
    }
    loadAssets()
  }, [])

  // Usar dados demo se não houver transações reais
  const effectiveTransactions = useMemo(() => 
    transactions.length > 0 ? transactions : (showDemo ? demoTransactions : []), 
    [transactions, showDemo]
  )
  const effectiveCustodyAccounts = useMemo(() => 
    custodyAccounts.length > 0 ? custodyAccounts : (showDemo ? demoCustodyAccounts : []), 
    [custodyAccounts, showDemo]
  )
  const effectiveAssets = useMemo(() => 
    assets.length > 0 ? assets : (showDemo ? demoAssets : []), 
    [assets, showDemo]
  )

  // Filtrar transações pela conta selecionada
  const filteredTransactions = useMemo(() => {
    if (selectedAccount === 'all') return effectiveTransactions
    return effectiveTransactions.filter(t => t.custodyAccountId === selectedAccount)
  }, [effectiveTransactions, selectedAccount])

  // Calcular posições consolidadas por ativo
  const portfolioPositions = useMemo((): PortfolioPosition[] => {
    const positions = new Map<string, {
      quantity: number
      totalCost: number
      transactions: Transaction[]
    }>()

    // Consolidar transações por ativo
    filteredTransactions.forEach(transaction => {
      const { assetId, type, quantity, unitPrice, price, total, totalOperationValue } = transaction
      const effectivePrice = unitPrice || price || 0
      const effectiveTotal = totalOperationValue || total || (quantity * effectivePrice)
      
      if (!positions.has(assetId)) {
        positions.set(assetId, {
          quantity: 0,
          totalCost: 0,
          transactions: []
        })
      }

      const position = positions.get(assetId)!
      position.transactions.push(transaction)

      if (type === 'BUY') {
        position.quantity += quantity
        position.totalCost += effectiveTotal
      } else if (type === 'SELL') {
        position.quantity -= quantity
        // Reduzir custo proporcionalmente
        const avgPrice = position.totalCost / (position.quantity + quantity)
        position.totalCost -= (avgPrice * quantity)
      }
    })

    // Converter para array de posições com cálculos
    return Array.from(positions.entries())
      .filter(([_, pos]) => pos.quantity > 0)
      .map(([assetId, pos]): PortfolioPosition => {
        const avgPrice = pos.totalCost / pos.quantity
        
        // Cotação atual baseada no ativo (determinística)
        const assetHash = assetId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
        const priceVariation = 0.95 + (assetHash % 100) / 1000 // Variação determinística baseada no ID
        const currentPrice = Math.max(0.01, avgPrice * priceVariation)
        
        const marketValue = Math.max(0, pos.quantity * currentPrice)
        const totalReturn = marketValue - pos.totalCost
        const totalReturnPercent = pos.totalCost > 0 ? (totalReturn / pos.totalCost) * 100 : 0
        
        // Variação do dia baseada no ativo (determinística)
        const dayVariation = ((assetHash % 40) - 20) / 1000 // ±2% baseado no hash
        const dayReturn = marketValue * dayVariation
        const dayReturnPercent = dayVariation * 100

        // Buscar nome do ativo
        const asset = effectiveAssets.find(a => a.id === assetId)
        const assetName = asset?.name || asset?.ticker || 'Ativo Desconhecido'

        return {
          assetId,
          assetName,
          quantity: pos.quantity,
          avgPrice,
          currentPrice,
          totalCost: pos.totalCost,
          marketValue,
          totalReturn,
          totalReturnPercent,
          dayReturn,
          dayReturnPercent,
          weight: 0 // Será calculado depois
        }
      })
  }, [filteredTransactions, effectiveAssets])

  // Calcular métricas totais da carteira
  const portfolioMetrics = useMemo((): PortfolioMetrics => {
    if (portfolioPositions.length === 0) {
      return {
        totalMarketValue: 0,
        totalCost: 0,
        totalReturn: 0,
        totalReturnPercent: 0,
        totalDayReturn: 0,
        totalDayReturnPercent: 0
      }
    }

    const totalMarketValue = portfolioPositions.reduce((sum, pos) => sum + (pos.marketValue || 0), 0)
    const totalCost = portfolioPositions.reduce((sum, pos) => sum + (pos.totalCost || 0), 0)
    const totalReturn = totalMarketValue - totalCost
    const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0
    const totalDayReturn = portfolioPositions.reduce((sum, pos) => sum + (pos.dayReturn || 0), 0)
    const totalDayReturnPercent = totalMarketValue > 0 ? (totalDayReturn / totalMarketValue) * 100 : 0

    return {
      totalMarketValue: isFinite(totalMarketValue) ? totalMarketValue : 0,
      totalCost: isFinite(totalCost) ? totalCost : 0,
      totalReturn: isFinite(totalReturn) ? totalReturn : 0,
      totalReturnPercent: isFinite(totalReturnPercent) ? totalReturnPercent : 0,
      totalDayReturn: isFinite(totalDayReturn) ? totalDayReturn : 0,
      totalDayReturnPercent: isFinite(totalDayReturnPercent) ? totalDayReturnPercent : 0
    }
  }, [portfolioPositions])

  // Atualizar pesos dos ativos
  const positionsWithWeights = useMemo(() => {
    return portfolioPositions.map(pos => ({
      ...pos,
      weight: portfolioMetrics.totalMarketValue > 0 ? 
        (pos.marketValue / portfolioMetrics.totalMarketValue) * 100 : 0
    })).sort((a, b) => b.marketValue - a.marketValue)
  }, [portfolioPositions, portfolioMetrics.totalMarketValue])

  // Utilitários de formatação
  const formatCurrency = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return 'Kz 0,00'
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 2
    }).format(value)
  }

  const formatPercent = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return '0,00%'
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const handleRefresh = () => {
    setLastUpdate(new Date())
  }

  const handleAccountChange = (accountId: string) => {
    setSelectedAccount(accountId)
  }

  const periodOptions = ['1D', '7D', '1M', '3M', '6M', '1A', 'YTD', 'Tudo']

  // Gerar alertas baseados na performance
  const alerts = useMemo(() => {
    const alertList = []
    
    if (portfolioMetrics.totalDayReturnPercent > 2) {
      alertList.push({
        type: 'success',
        message: `🎉 Sua carteira subiu ${formatPercent(portfolioMetrics.totalDayReturnPercent)} hoje!`
      })
    } else if (portfolioMetrics.totalDayReturnPercent < -2) {
      alertList.push({
        type: 'warning',
        message: `⚠️ Sua carteira caiu ${formatPercent(Math.abs(portfolioMetrics.totalDayReturnPercent))} hoje`
      })
    }

    if (portfolioMetrics.totalReturnPercent > 10) {
      alertList.push({
        type: 'success',
        message: '💰 Parabéns! Rentabilidade acima de 10%'
      })
    }

    // Simular dividendo
    const recentDividends = filteredTransactions.filter(t => 
      t.type === 'DIVIDEND' && 
      new Date(t.operationDate || t.date || Date.now()) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )
    
    if (recentDividends.length > 0) {
      const totalDividends = recentDividends.reduce((sum, t) => sum + (t.totalOperationValue || t.total || 0), 0)
      alertList.push({
        type: 'info',
        message: `💰 Dividendos recebidos: ${formatCurrency(totalDividends)}`
      })
    }

    return alertList.slice(0, 3) // Máximo 3 alertas
  }, [portfolioMetrics, filteredTransactions])

  const toggleDemo = () => {
    setShowDemo(!showDemo)
  }

  if (effectiveTransactions.length === 0) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Performance da Carteira
          </h1>
          <p className="text-gray-600">
              Acompanhe o desempenho de seus investimentos de forma consolidada.
          </p>
        </div>

          <Card className="p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum investimento encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Registre suas primeiras transações para visualizar a performance da sua carteira.
            </p>
            <div className="space-y-3">
              <Button onClick={() => window.location.href = '/transactions/buy'}>
                Registrar Primeira Operação
              </Button>
              <div className="text-center">
                <span className="text-gray-500 text-sm">ou</span>
              </div>
              <Button 
                variant="secondary" 
                onClick={toggleDemo}
                className="w-full"
              >
                🎭 Ver Demonstração com Dados de Exemplo
              </Button>
            </div>
          </Card>
        </div>
                  </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header da Performance */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Performance da Carteira
              </h1>
              <p className="text-gray-600">
                Acompanhe o desempenho de seus investimentos de forma consolidada.
              </p>
            </div>
            
            {/* Controles */}
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              {/* Seleção de Conta */}
              <select
                value={selectedAccount}
                onChange={(e) => handleAccountChange(e.target.value)}
                className="px-3 py-2 pr-8 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[200px] max-w-[300px] truncate"
              >
                <option value="all">Todas as Contas</option>
                {effectiveCustodyAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.institution})
                  </option>
                ))}
              </select>
              
              <Button 
                variant="secondary" 
                onClick={handleRefresh}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
                  </div>
                </div>

          {/* Última atualização */}
                      <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Última atualização: {lastUpdate.toLocaleString('pt-AO')}
              </p>
              {showDemo && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    🎭 Modo Demonstração
                  </span>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={toggleDemo}
                    className="text-xs"
                  >
                    Desativar
                  </Button>
                </div>
              )}
            </div>
                  </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Saldo Total */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
                  <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Saldo Total da Carteira
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(portfolioMetrics.totalMarketValue)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Custo: {formatCurrency(portfolioMetrics.totalCost)}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

          {/* Rentabilidade Total */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Rentabilidade Total
                </p>
                <p className={`text-3xl font-bold ${
                  portfolioMetrics.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercent(portfolioMetrics.totalReturnPercent)}
                </p>
                <p className={`text-sm ${
                  portfolioMetrics.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(portfolioMetrics.totalReturn)}
                </p>
                  </div>
                            <div className={`p-2 rounded-lg ${
                portfolioMetrics.totalReturn >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {portfolioMetrics.totalReturn >= 0 ? (
                  <ArrowUp className="w-6 h-6 text-green-600" />
                ) : (
                  <ArrowDown className="w-6 h-6 text-red-600" />
                )}
                  </div>
                </div>
              </Card>

          {/* Variação do Dia */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Variação do Dia
                </p>
                <p className={`text-3xl font-bold ${
                  portfolioMetrics.totalDayReturn >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercent(portfolioMetrics.totalDayReturnPercent)}
                </p>
                <p className={`text-sm ${
                  portfolioMetrics.totalDayReturn >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(portfolioMetrics.totalDayReturn)}
                </p>
                  </div>
                            <div className={`p-2 rounded-lg ${
                portfolioMetrics.totalDayReturn >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {portfolioMetrics.totalDayReturn >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
                  </div>
                </div>
              </Card>
            </div>

        {/* Layout Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Coluna Principal (2/3) */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-8">
            {/* Gráfico de Evolução */}
              <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Evolução da Carteira
                </h3>
                
                {/* Filtros de Período */}
                <div className="flex space-x-2">
                  {periodOptions.map(period => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        selectedPeriod === period
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              
              <PortfolioEvolutionChart
                transactions={filteredTransactions}
                selectedPeriod={selectedPeriod}
                totalMarketValue={portfolioMetrics.totalMarketValue}
              />
              </Card>

            {/* Posições da Carteira */}
              <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Posições Atuais ({positionsWithWeights.length} ativos)
                </h3>
                
                {/* Ações Rápidas */}
                <div className="flex space-x-2">
                  <Button 
                    size="sm"
                    onClick={() => window.location.href = '/transactions/buy'}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nova Operação</span>
                  </Button>
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => window.location.href = '/transactions'}
                    className="flex items-center space-x-2"
                  >
                    <History className="w-4 h-4" />
                    <span>Histórico</span>
                  </Button>
                </div>
            </div>

              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ativo
                      </th>
                      <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantidade
                      </th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço Médio
                      </th>
                      <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cotação Atual
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Atual
                      </th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rent. Dia
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rent. Total
                      </th>
                      <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Peso
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {positionsWithWeights.map((position) => (
                      <tr key={position.assetId} className="hover:bg-gray-50 cursor-pointer">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{position.assetName}</div>
                            <div className="text-xs text-gray-500 sm:hidden">
                              {Math.floor(position.quantity)} un. • {isFinite(position.weight) ? position.weight.toFixed(1) : '0'}%
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {Math.floor(position.quantity).toLocaleString('pt-AO')}
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(position.avgPrice)}
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(position.currentPrice)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(position.marketValue)}
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm">
                          <div className={`${
                            position.dayReturn >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <div>{formatPercent(position.dayReturnPercent)}</div>
                            <div className="text-xs">{formatCurrency(position.dayReturn)}</div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                          <div className={`${
                            position.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <div>{formatPercent(position.totalReturnPercent)}</div>
                            <div className="text-xs hidden sm:block">{formatCurrency(position.totalReturn)}</div>
                          </div>
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {isFinite(position.weight) ? position.weight.toFixed(1) : '0'}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Coluna Lateral (1/3) */}
          <div className="lg:col-span-1 space-y-4 lg:space-y-8">
            {/* Distribuição da Carteira */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Distribuição por Ativo
              </h3>
              
                              <div className="space-y-4">
                {positionsWithWeights.slice(0, 5).map((position, index) => (
                  <div key={position.assetId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {position.assetName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.floor(position.quantity)} unidades
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-medium text-gray-900">
                        {isFinite(position.weight) ? position.weight.toFixed(1) : '0'}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(position.marketValue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <PortfolioDistributionChart positions={positionsWithWeights} />
              </div>
            </Card>


          </div>
        </div>
      </div>
    </div>
  )
}
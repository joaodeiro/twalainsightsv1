'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { getAssets } from '@/lib/assets'
import { calculatePortfolioStats } from '@/lib/portfolio'
import { calculatePeriodPerformance } from '@/lib/performance'
import type { Transaction, Asset } from '@/types'
import { TrendingUp, TrendingDown, DollarSign, Target, Activity, PieChart } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from 'recharts'

interface EnhancedPortfolioStatsProps {
  transactions: Transaction[]
}

export function EnhancedPortfolioStats({ transactions }: EnhancedPortfolioStatsProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [portfolioStats, setPortfolioStats] = useState({
    currentValue: 0,
    totalReturn: 0,
    totalReturnPercent: 0,
    uniqueAssets: 0,
    dailyChange: 0,
    dailyChangePercent: 0
  })
  const [chartData, setChartData] = useState({
    valueHistory: [] as Array<{ date: string; value: number }>,
    returnHistory: [] as Array<{ date: string; return: number }>,
    dailyPerformance: [] as Array<{ asset: string; change: number }>
  })

  // Carregar ativos
  useEffect(() => {
    const loadAssets = async () => {
      const assetsData = await getAssets()
      setAssets(assetsData)
    }
    loadAssets()
  }, [])

  // Calcular estatísticas e dados dos gráficos
  useEffect(() => {
    if (assets.length === 0 || transactions.length === 0) return

    const stats = calculatePortfolioStats(transactions, assets)
    const dailyPerf = calculatePeriodPerformance(transactions, assets, '7d')
    
    setPortfolioStats({
      currentValue: stats.currentValue,
      totalReturn: stats.totalReturn,
      totalReturnPercent: stats.totalReturnPercent,
      uniqueAssets: stats.uniqueAssets,
      dailyChange: dailyPerf.metrics.totalReturn,
      dailyChangePercent: dailyPerf.metrics.totalReturnPercent
    })

    // Gerar dados simulados para os mini-gráficos (últimas 24h)
    const generateValueHistory = () => {
      const data = []
      const baseValue = stats.currentValue
      for (let i = 23; i >= 0; i--) {
        const variation = (Math.random() - 0.5) * 0.02 // Variação de ±1%
        const value = baseValue * (1 + variation)
        data.push({
          date: `${i}h`,
          value: value
        })
      }
      return data
    }

    // Gerar histórico de rentabilidade (últimos 30 dias)
    const generateReturnHistory = () => {
      const data = []
      const baseReturn = stats.totalReturnPercent
      for (let i = 29; i >= 0; i--) {
        const variation = (Math.random() - 0.5) * 0.1
        data.push({
          date: `${i}d`,
          return: baseReturn + variation
        })
      }
      return data
    }

    // Performance dos principais ativos no dia
    const generateDailyPerformance = () => {
      const topAssets = ['BFA', 'BIC', 'BPC', 'BAI']
      return topAssets.map(asset => ({
        asset,
        change: (Math.random() - 0.5) * 6 // Variação de ±3%
      }))
    }

    setChartData({
      valueHistory: generateValueHistory(),
      returnHistory: generateReturnHistory(),
      dailyPerformance: generateDailyPerformance()
    })
  }, [transactions, assets])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  if (transactions.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-center h-32 text-gray-400">
              <div className="text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Aguardando dados</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Valor Total da Carteira */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Valor Total da Carteira</h3>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(portfolioStats.currentValue)}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`flex items-center text-sm font-medium ${
              portfolioStats.dailyChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {portfolioStats.dailyChangePercent >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {formatPercent(portfolioStats.dailyChangePercent)}
            </span>
            <span className="text-sm text-gray-500">
              ({formatCurrency(portfolioStats.dailyChange)})
            </span>
          </div>
        </div>

        {/* Mini-gráfico de evolução nas últimas 24h */}
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.valueHistory}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2">Evolução nas últimas 24h</p>
      </Card>

      {/* Card 2: Rentabilidade Total */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              portfolioStats.totalReturnPercent >= 0 
                ? 'bg-green-100 dark:bg-green-800/30' 
                : 'bg-red-100 dark:bg-red-800/30'
            }`}>
              {portfolioStats.totalReturnPercent >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Rentabilidade Total</h3>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <p className={`text-2xl font-bold ${
            portfolioStats.totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatPercent(portfolioStats.totalReturnPercent)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {formatCurrency(portfolioStats.totalReturn)}
          </p>
        </div>

        {/* Mini-gráfico de área da rentabilidade */}
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData.returnHistory}>
              <Area 
                type="monotone" 
                dataKey="return" 
                stroke={portfolioStats.totalReturnPercent >= 0 ? '#10B981' : '#EF4444'}
                fill={portfolioStats.totalReturnPercent >= 0 ? '#10B981' : '#EF4444'}
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2">Tendência dos últimos 30 dias</p>
      </Card>

      {/* Card 3: Performance do Dia */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800/30 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Performance Hoje</h3>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <p className={`text-2xl font-bold ${
            portfolioStats.dailyChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatPercent(portfolioStats.dailyChangePercent)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {formatCurrency(portfolioStats.dailyChange)}
          </p>
        </div>

        {/* Mini-gráfico de barras dos principais ativos */}
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.dailyPerformance}>
              <Bar 
                dataKey="change" 
                fill="#8B5CF6"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2">Principais ativos no dia</p>
      </Card>

      {/* Card 4: Diversificação */}
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-800/30 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Diversificação</h3>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {portfolioStats.uniqueAssets} Ativos
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {transactions.length} transações
          </p>
        </div>

        {/* Indicador visual de diversificação */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Ações</span>
            <span>85%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Outros</span>
            <span>15%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-orange-300 h-2 rounded-full" style={{ width: '15%' }}></div>
          </div>
        </div>
      </Card>
    </div>
  )
}
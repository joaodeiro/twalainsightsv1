'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Transaction, Asset } from '@/types'
import { calculatePeriodPerformance, PeriodPerformance, formatCurrency, formatPercent } from '@/lib/performance'
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, BarChart3 } from 'lucide-react'

interface PeriodAnalysisProps {
  transactions: Transaction[]
  assets: Asset[]
}

export function PeriodAnalysis({ transactions, assets }: PeriodAnalysisProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d')
  const [periodData, setPeriodData] = useState<PeriodPerformance | null>(null)

  const periods = [
    { key: '7d' as const, label: '7 dias', icon: Calendar },
    { key: '30d' as const, label: '30 dias', icon: Calendar },
    { key: '90d' as const, label: '90 dias', icon: BarChart3 },
    { key: '1y' as const, label: '1 ano', icon: TrendingUp },
    { key: 'all' as const, label: 'Desde início', icon: Target }
  ]

  useEffect(() => {
    if (transactions.length > 0) {
      const data = calculatePeriodPerformance(transactions, assets, selectedPeriod)
      setPeriodData(data)
    }
  }, [transactions, assets, selectedPeriod])

  if (!periodData || transactions.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise por Período</h3>
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>Dados insuficientes para análise</p>
          </div>
        </div>
      </Card>
    )
  }

  const isPositive = periodData.metrics.totalReturn >= 0

  return (
    <div className="space-y-6">
      {/* Seletor de Período */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise por Período</h3>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {periods.map((period) => {
            const Icon = period.icon
            return (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  selectedPeriod === period.key
                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{period.label}</span>
              </button>
            )
          })}
        </div>

        {/* Métricas do Período */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Valor Total */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                ATUAL
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(periodData.metrics.totalValue)}
            </div>
            <div className="text-sm text-blue-700">Valor Total</div>
          </div>

          {/* Total Investido */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-gray-600" />
              <span className="text-xs font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded">
                BASE
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(periodData.metrics.totalInvested)}
            </div>
            <div className="text-sm text-gray-700">Total Investido</div>
          </div>

          {/* Retorno Absoluto */}
          <div className={`${isPositive ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-2">
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                isPositive 
                  ? 'text-green-600 bg-green-100' 
                  : 'text-red-600 bg-red-100'
              }`}>
                {isPositive ? 'LUCRO' : 'PREJUÍZO'}
              </span>
            </div>
            <div className={`text-2xl font-bold ${
              isPositive ? 'text-green-900' : 'text-red-900'
            }`}>
              {isPositive ? '+' : ''}{formatCurrency(periodData.metrics.totalReturn)}
            </div>
            <div className={`text-sm ${
              isPositive ? 'text-green-700' : 'text-red-700'
            }`}>
              Retorno Absoluto
            </div>
          </div>

          {/* Retorno Percentual */}
          <div className={`${isPositive ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className={`w-5 h-5 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                isPositive 
                  ? 'text-green-600 bg-green-100' 
                  : 'text-red-600 bg-red-100'
              }`}>
                %
              </span>
            </div>
            <div className={`text-2xl font-bold ${
              isPositive ? 'text-green-900' : 'text-red-900'
            }`}>
              {isPositive ? '+' : ''}{periodData.metrics.totalReturnPercent.toFixed(2)}%
            </div>
            <div className={`text-sm ${
              isPositive ? 'text-green-700' : 'text-red-700'
            }`}>
              Retorno %
            </div>
          </div>
        </div>

        {/* Detalhamento dos Ganhos */}
        {periodData.metrics.realizedGains > 0 || periodData.metrics.unrealizedGains > 0 || periodData.metrics.dividendsReceived > 0 ? (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Detalhamento do Retorno ({periodData.label})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ganhos Realizados:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(periodData.metrics.realizedGains)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ganhos Não Realizados:</span>
                <span className="font-medium text-blue-600">
                  {formatCurrency(periodData.metrics.unrealizedGains)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dividendos/Juros:</span>
                <span className="font-medium text-purple-600">
                  {formatCurrency(periodData.metrics.dividendsReceived)}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Resumo de Transações do Período */}
        {periodData.transactions.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Atividade no Período ({periodData.label})
            </h4>
            <div className="text-sm text-blue-700">
              <span className="font-medium">{periodData.transactions.length}</span> transações realizadas
              {periodData.transactions.filter(t => t.type === 'BUY').length > 0 && (
                <span className="ml-2">
                  • <span className="font-medium">{periodData.transactions.filter(t => t.type === 'BUY').length}</span> compras
                </span>
              )}
              {periodData.transactions.filter(t => t.type === 'SELL').length > 0 && (
                <span className="ml-2">
                  • <span className="font-medium">{periodData.transactions.filter(t => t.type === 'SELL').length}</span> vendas
                </span>
              )}
              {periodData.transactions.filter(t => t.type === 'DIVIDEND' || t.type === 'INTEREST').length > 0 && (
                <span className="ml-2">
                  • <span className="font-medium">{periodData.transactions.filter(t => t.type === 'DIVIDEND' || t.type === 'INTEREST').length}</span> proventos
                </span>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
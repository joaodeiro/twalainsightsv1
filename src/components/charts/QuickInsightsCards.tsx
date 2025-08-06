'use client'

import { Card } from '@/components/ui/Card'
import { Transaction, Asset } from '@/types'
import { calculatePortfolioStats } from '@/lib/portfolio'
import { calculatePeriodPerformance, formatCurrency } from '@/lib/performance'
import { TrendingUp, TrendingDown, Target, Activity, DollarSign, BarChart3 } from 'lucide-react'

interface QuickInsightsCardsProps {
  transactions: Transaction[]
  assets: Asset[]
}

export function QuickInsightsCards({ transactions, assets }: QuickInsightsCardsProps) {
  if (transactions.length === 0) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-center h-16 text-gray-400">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div className="text-center text-sm text-gray-500 mt-2">
              Aguardando dados
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const portfolioStats = calculatePortfolioStats(transactions, assets)
  const monthPerformance = calculatePeriodPerformance(transactions, assets, '30d')
  
  // Calcular algumas métricas adicionais
  const totalAssets = portfolioStats.uniqueAssets
  const totalTransactions = portfolioStats.totalTransactions
  const isPositive = portfolioStats.totalReturn >= 0
  const monthIsPositive = monthPerformance.metrics.totalReturn >= 0

  const cards = [
    {
      title: 'Valor Total',
      value: formatCurrency(portfolioStats.currentValue),
      subtitle: 'Carteira atual',
      icon: DollarSign,
      color: 'blue',
      trend: null
    },
    {
      title: 'Retorno Total',
      value: `${isPositive ? '+' : ''}${portfolioStats.totalReturnPercent.toFixed(2)}%`,
      subtitle: formatCurrency(portfolioStats.totalReturn),
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'green' : 'red',
      trend: isPositive ? 'up' : 'down'
    },
    {
      title: 'Performance 30d',
      value: `${monthIsPositive ? '+' : ''}${monthPerformance.metrics.totalReturnPercent.toFixed(2)}%`,
      subtitle: formatCurrency(monthPerformance.metrics.totalReturn),
      icon: monthIsPositive ? TrendingUp : TrendingDown,
      color: monthIsPositive ? 'green' : 'red',
      trend: monthIsPositive ? 'up' : 'down'
    },
    {
      title: 'Diversificação',
      value: `${totalAssets}`,
      subtitle: `${totalTransactions} transações`,
      icon: Target,
      color: 'purple',
      trend: null
    }
  ]

  const getColorClasses = (color: string, trend: string | null) => {
    const baseClasses = {
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      red: 'bg-red-50 border-red-200',
      purple: 'bg-purple-50 border-purple-200'
    }

    const iconClasses = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      red: 'text-red-600 bg-red-100',
      purple: 'text-purple-600 bg-purple-100'
    }

    const valueClasses = {
      blue: 'text-blue-900',
      green: 'text-green-900',
      red: 'text-red-900',
      purple: 'text-purple-900'
    }

    return {
      card: baseClasses[color as keyof typeof baseClasses],
      icon: iconClasses[color as keyof typeof iconClasses],
      value: valueClasses[color as keyof typeof valueClasses]
    }
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        const colors = getColorClasses(card.color, card.trend)
        
        return (
          <Card key={index} className={`p-4 border-2 ${colors.card} hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.icon}`}>
                <Icon className="w-5 h-5" />
              </div>
              {card.trend && (
                <div className={`flex items-center space-x-1 ${
                  card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>
              )}
            </div>
            
            <div className={`text-xl font-bold ${colors.value} mb-1`}>
              {card.value}
            </div>
            
            <div className="text-sm text-gray-600">
              {card.title}
            </div>
            
            <div className="text-xs text-gray-500 mt-1">
              {card.subtitle}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
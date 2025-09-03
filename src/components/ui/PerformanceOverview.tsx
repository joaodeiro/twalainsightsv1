'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { getAssets } from '@/lib/assets'
import { calculatePortfolioStats } from '@/lib/portfolio'
import type { Transaction, Asset } from '@/types'
import { BarChart3 } from 'lucide-react'

interface PerformanceOverviewProps {
  transactions: Transaction[]
}

export function PerformanceOverview({ transactions }: PerformanceOverviewProps) {
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>([])
  const [calculatedStats, setCalculatedStats] = useState({
    totalInvested: 0,
    totalSold: 0,
    totalIncome: 0,
    currentValue: 0,
    totalReturn: 0,
    totalReturnPercent: 0
  })

  // Carregar ativos
  useEffect(() => {
    const loadAssets = async () => {
      const assetsData = await getAssets()
      setAssets(assetsData)
    }
    loadAssets()
  }, [])

  // Calcular estatísticas usando lógica unificada
  useEffect(() => {
    if (assets.length === 0) return

    const calculation = calculatePortfolioStats(transactions, assets)
    
    setCalculatedStats({
      totalInvested: calculation.totalInvested,
      totalSold: calculation.totalSold,
      totalIncome: calculation.totalIncome,
      currentValue: calculation.currentValue,
      totalReturn: calculation.totalReturn,
      totalReturnPercent: calculation.totalReturnPercent
    })
  }, [transactions, assets])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Performance da Carteira
          </h2>
          <Button 
            size="sm"
            variant="secondary"
            onClick={() => router.push('/portfolio')}
            className="text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-300"
          >
            Ver Detalhes
          </Button>
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Valores Principais */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
          <div className="text-center sm:text-left">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {formatCurrency(calculatedStats.currentValue)}
            </div>
            <div className="text-sm text-gray-500">Valor Total da Carteira</div>
          </div>
          <div className="text-center sm:text-right">
            <div className={`text-3xl font-bold mb-1 ${calculatedStats.totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(calculatedStats.totalReturnPercent)}
            </div>
            <div className="text-sm text-gray-500">Retorno Total</div>
          </div>
        </div>

        {/* Métricas Detalhadas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(calculatedStats.totalInvested)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Total Investido</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(calculatedStats.totalIncome)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Proventos</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Este Mês</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {transactions.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Transações</div>
          </div>
        </div>

        {/* Área do Gráfico */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">
              Evolução (Últimos 6 meses)
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Em breve
            </span>
          </div>
          <div className="h-40 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                <BarChart3 className="w-12 h-12 mx-auto text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Gráfico de Performance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
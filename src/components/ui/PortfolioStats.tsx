'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { getAssets } from '@/lib/assets'
import { calculatePortfolioStats } from '@/lib/portfolio'
import type { Transaction, Asset } from '@/types'
import { TrendingUp, DollarSign, PieChart, FileText } from 'lucide-react'

interface PortfolioStatsProps {
  transactions: Transaction[]
  totalValue?: number
  totalReturn?: number
  totalReturnPercent?: number
}

export function PortfolioStats({ 
  transactions, 
  totalValue = 0, 
  totalReturn = 0, 
  totalReturnPercent = 0 
}: PortfolioStatsProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [calculatedStats, setCalculatedStats] = useState({
    totalValue: 0,
    totalReturn: 0,
    totalReturnPercent: 0,
    uniqueAssets: 0
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
      totalValue: calculation.currentValue,
      totalReturn: calculation.totalReturn,
      totalReturnPercent: calculation.totalReturnPercent,
      uniqueAssets: calculation.uniqueAssets
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
    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Valor Total */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6 sm:py-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <dt>
          <div className="absolute">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="ml-14 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Valor Total</p>
        </dt>
        <dd className="ml-14">
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(calculatedStats.totalValue)}</p>
        </dd>
      </div>

      {/* Retorno */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6 sm:py-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <dt>
          <div className="absolute">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${calculatedStats.totalReturnPercent >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="ml-14 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Retorno</p>
        </dt>
        <dd className="ml-14">
          <p className={`text-2xl font-semibold ${calculatedStats.totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(calculatedStats.totalReturnPercent)}
          </p>
        </dd>
      </div>

      {/* Ativos */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6 sm:py-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <dt>
          <div className="absolute">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
              <PieChart className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="ml-14 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Ativos</p>
        </dt>
        <dd className="ml-14">
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{calculatedStats.uniqueAssets}</p>
        </dd>
      </div>

      {/* Transações */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6 sm:py-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <dt>
          <div className="absolute">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="ml-14 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Operações</p>
        </dt>
        <dd className="ml-14">
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{transactions.length}</p>
        </dd>
      </div>
    </div>
  )
}
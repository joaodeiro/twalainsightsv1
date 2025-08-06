'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { getAssets } from '@/lib/assets'
import { calculatePortfolioStats } from '@/lib/portfolio'
import type { Transaction, Asset } from '@/types'

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
      <div className="relative bg-white rounded-xl border border-gray-200 px-4 py-4 sm:px-6 sm:py-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <dt>
          <div className="absolute">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H3.75m0 0v.375c0 .621.504 1.125 1.125 1.125m9.75-1.5h.375c.621 0 1.125.504 1.125 1.125v.75c0 .621-.504 1.125-1.125 1.125h-.375m1.125-1.5H12m0 0v.375c0 .621.504 1.125 1.125 1.125M18 5.625v5.25M18 15.75v-5.25M18 10.5v.375c0 .621.504 1.125 1.125 1.125m-9.375 0c.621 0 1.125-.504 1.125-1.125V10.5M6.75 15.75v-5.25" />
              </svg>
            </div>
          </div>
          <p className="ml-14 text-sm font-medium text-gray-500 truncate">Valor Total</p>
        </dt>
        <dd className="ml-14">
          <p className="text-2xl font-semibold text-gray-900">{formatCurrency(calculatedStats.totalValue)}</p>
        </dd>
      </div>

      {/* Retorno */}
      <div className="relative bg-white rounded-xl border border-gray-200 px-4 py-4 sm:px-6 sm:py-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <dt>
          <div className="absolute">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${calculatedStats.totalReturnPercent >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.94" />
              </svg>
            </div>
          </div>
          <p className="ml-14 text-sm font-medium text-gray-500 truncate">Retorno</p>
        </dt>
        <dd className="ml-14">
          <p className={`text-2xl font-semibold ${calculatedStats.totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(calculatedStats.totalReturnPercent)}
          </p>
        </dd>
      </div>

      {/* Ativos */}
      <div className="relative bg-white rounded-xl border border-gray-200 px-4 py-4 sm:px-6 sm:py-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <dt>
          <div className="absolute">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l-1-3m1 3l-1-3m-16.5 0l1 3m-1-3l1-3" />
              </svg>
            </div>
          </div>
          <p className="ml-14 text-sm font-medium text-gray-500 truncate">Ativos</p>
        </dt>
        <dd className="ml-14">
          <p className="text-2xl font-semibold text-gray-900">{calculatedStats.uniqueAssets}</p>
        </dd>
      </div>

      {/* Transações */}
      <div className="relative bg-white rounded-xl border border-gray-200 px-4 py-4 sm:px-6 sm:py-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <dt>
          <div className="absolute">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
          </div>
          <p className="ml-14 text-sm font-medium text-gray-500 truncate">Transações</p>
        </dt>
        <dd className="ml-14">
          <p className="text-2xl font-semibold text-gray-900">{transactions.length}</p>
        </dd>
      </div>
    </div>
  )
} 
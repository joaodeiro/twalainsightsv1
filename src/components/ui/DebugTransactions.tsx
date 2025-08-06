'use client'

import { Card } from '@/components/ui/Card'
import { calculatePortfolioStats } from '@/lib/portfolio'
import { getAssets } from '@/lib/assets'
import { useState, useEffect } from 'react'
import type { Transaction, Asset } from '@/types'

interface DebugTransactionsProps {
  transactions: Transaction[]
}

export function DebugTransactions({ transactions }: DebugTransactionsProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [calculation, setCalculation] = useState<any>(null)

  useEffect(() => {
    const loadAssets = async () => {
      const assetsData = await getAssets()
      setAssets(assetsData)
    }
    loadAssets()
  }, [])

  useEffect(() => {
    if (assets.length === 0) return
    const calc = calculatePortfolioStats(transactions, assets)

    setCalculation(calc)
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

  if (!calculation) return null

  const buyTransactions = transactions.filter(t => t.type === 'BUY')
  const sellTransactions = transactions.filter(t => t.type === 'SELL')
  const dividendTransactions = transactions.filter(t => t.type === 'DIVIDEND')
  const interestTransactions = transactions.filter(t => t.type === 'INTEREST')

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🔍 Debug - Cálculos do Portfólio
        </h3>
        <p className="text-sm text-gray-600">
          Valores calculados pela nova lógica unificada
        </p>
      </div>

      {/* Resumo por Tipo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Compras</div>
          <div className="text-lg font-bold text-blue-900">{buyTransactions.length}</div>
          <div className="text-sm text-blue-700">{formatCurrency(calculation.totalInvested)}</div>
        </div>
        
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-sm text-red-600 font-medium">Vendas</div>
          <div className="text-lg font-bold text-red-900">{sellTransactions.length}</div>
          <div className="text-sm text-red-700">{formatCurrency(calculation.totalSold)}</div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Dividendos</div>
          <div className="text-lg font-bold text-green-900">{dividendTransactions.length}</div>
          <div className="text-sm text-green-700">{formatCurrency(dividendTransactions.reduce((sum, t) => sum + (t.totalOperationValue || t.total || 0), 0))}</div>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-sm text-purple-600 font-medium">Juros</div>
          <div className="text-lg font-bold text-purple-900">{interestTransactions.length}</div>
          <div className="text-sm text-purple-700">{formatCurrency(interestTransactions.reduce((sum, t) => sum + (t.totalOperationValue || t.total || 0), 0))}</div>
        </div>
      </div>

      {/* Valores Calculados */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 font-medium">Total Investido</div>
          <div className="text-lg font-bold text-gray-900">{formatCurrency(calculation.totalInvested)}</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 font-medium">Valor Atual</div>
          <div className="text-lg font-bold text-gray-900">{formatCurrency(calculation.currentValue)}</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 font-medium">Proventos</div>
          <div className="text-lg font-bold text-gray-900">{formatCurrency(calculation.totalIncome)}</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 font-medium">Retorno Total</div>
          <div className="text-lg font-bold text-gray-900">{formatCurrency(calculation.totalReturn)}</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 font-medium">Retorno %</div>
          <div className={`text-lg font-bold ${calculation.totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(calculation.totalReturnPercent)}
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 font-medium">Ativos Únicos</div>
          <div className="text-lg font-bold text-gray-900">{calculation.uniqueAssets}</div>
        </div>
      </div>

      {/* Posições por Ativo */}
      <div className="mb-4">
        <h4 className="text-md font-semibold text-gray-800 mb-2">Posições por Ativo:</h4>
        <div className="space-y-2">
          {calculation.positions.map((pos: any) => (
            <div key={pos.assetId} className="bg-gray-50 p-3 rounded-lg text-sm">
              <div className="font-medium text-gray-900">
                {pos.assetSymbol} - {pos.assetName}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1 text-xs">
                <div>Qtd: {pos.quantity}</div>
                <div>Preço Médio: {formatCurrency(pos.averagePrice)}</div>
                <div>Valor Atual: {formatCurrency(pos.currentValue)}</div>
                <div>Retorno: {formatPercent(pos.totalReturnPercent)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista Detalhada de Transações */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 mb-2">Transações Detalhadas:</h4>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {transactions.map((transaction, index) => (
            <div key={index} className="bg-gray-50 p-2 rounded text-xs">
              <div className="flex justify-between items-center">
                <span className="font-medium">{transaction.type}</span>
                <span>{formatCurrency(transaction.totalOperationValue || transaction.total || 0)}</span>
              </div>
              <div className="text-gray-600">
                {transaction.quantity} x {formatCurrency(transaction.unitPrice || transaction.price || 0)} = {formatCurrency(transaction.quantity * (transaction.unitPrice || transaction.price || 0))}
                {transaction.fees && transaction.fees > 0 && ` + ${formatCurrency(transaction.fees)} (taxas)`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
} 
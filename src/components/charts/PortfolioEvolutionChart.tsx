'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { Transaction } from '@/types'

interface PortfolioEvolutionChartProps {
  transactions: Transaction[]
  selectedPeriod: string
  totalMarketValue: number
}

interface DataPoint {
  date: string
  value: number
  return: number
  returnPercent: number
}

export function PortfolioEvolutionChart({ 
  transactions, 
  selectedPeriod,
  totalMarketValue 
}: PortfolioEvolutionChartProps) {
  
  const chartData = useMemo((): DataPoint[] => {
    if (transactions.length === 0) return []

    // Calcular período de dados baseado na seleção
    const now = new Date()
    const periodDays = {
      '1D': 1,
      '7D': 7,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1A': 365,
      'YTD': Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)),
      'Tudo': 999999
    }[selectedPeriod] || 365

    const startDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000))
    
    // Ordenar transações por data
    const sortedTransactions = [...transactions]
      .sort((a, b) => new Date(a.operationDate || a.date || Date.now()).getTime() - new Date(b.operationDate || b.date || Date.now()).getTime())
      .filter(t => new Date(t.operationDate || t.date || Date.now()) >= startDate)

    if (sortedTransactions.length === 0) return []

    // Gerar pontos de dados
    const dataPoints: DataPoint[] = []
    let portfolioValue = 0
    let totalInvested = 0

    // Ponto inicial
    const firstTransaction = sortedTransactions[0]
    const firstDate = new Date(firstTransaction.operationDate || firstTransaction.date || Date.now())
    
    // Processar cada transação
    sortedTransactions.forEach((transaction, index) => {
      const { type, total, quantity, price, unitPrice, totalOperationValue } = transaction
      const effectiveTotal = totalOperationValue || total || 0
      
      if (type === 'BUY') {
        portfolioValue += effectiveTotal
        totalInvested += effectiveTotal
      } else if (type === 'SELL') {
        portfolioValue -= effectiveTotal
        totalInvested -= (totalInvested / portfolioValue) * effectiveTotal || 0
      } else if (type === 'DIVIDEND' || type === 'INTEREST') {
        portfolioValue += effectiveTotal
      }

      // Simular variação de mercado baseada no tempo
      const transactionDate = new Date(transaction.operationDate || transaction.date || Date.now())
      const daysSinceFirst = Math.floor((transactionDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
      const marketMultiplier = 1 + (Math.sin(daysSinceFirst * 0.1) * 0.05) + (daysSinceFirst * 0.001)
      const simulatedValue = portfolioValue * marketMultiplier

      const returnValue = simulatedValue - totalInvested
      const returnPercent = totalInvested > 0 ? (returnValue / totalInvested) * 100 : 0

      dataPoints.push({
        date: transactionDate.toLocaleDateString('pt-AO'),
        value: simulatedValue,
        return: returnValue,
        returnPercent
      })
    })

    // Adicionar pontos intermediários para suavizar o gráfico
    if (dataPoints.length > 1 && periodDays <= 30) {
      const smoothedData: DataPoint[] = []
      
      for (let i = 0; i < dataPoints.length - 1; i++) {
        smoothedData.push(dataPoints[i])
        
        // Adicionar ponto intermediário
        const current = dataPoints[i]
        const next = dataPoints[i + 1]
        const avgValue = (current.value + next.value) / 2
        const avgReturn = (current.return + next.return) / 2
        const avgReturnPercent = (current.returnPercent + next.returnPercent) / 2
        
        smoothedData.push({
          date: `${current.date.split('/')[0]}/${current.date.split('/')[1]}`,
          value: avgValue,
          return: avgReturn,
          returnPercent: avgReturnPercent
        })
      }
      
      smoothedData.push(dataPoints[dataPoints.length - 1])
      return smoothedData
    }

    return dataPoints
  }, [transactions, selectedPeriod])

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

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center text-gray-500">
          <div className="text-lg mb-2">📊</div>
          <p className="font-medium">Dados insuficientes</p>
          <p className="text-sm">Registre mais transações para ver a evolução</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCurrency}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900 mb-2">{label}</p>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="text-gray-600">Valor: </span>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(data.value)}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Retorno: </span>
                        <span className={`font-medium ${
                          data.return >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(data.return)} ({formatPercent(data.returnPercent)})
                        </span>
                      </p>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#valueGradient)"
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#FFFFFF' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
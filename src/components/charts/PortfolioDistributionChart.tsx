'use client'

import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'

interface DistributionData {
  name: string
  value: number
  percentage: number
  color: string
}

interface PortfolioDistributionChartProps {
  positions: Array<{
    assetId: string
    assetName: string
    marketValue: number
    weight: number
  }>
}

export const CHART_COLORS = [
  '#3B82F6', // Azul
  '#10B981', // Verde
  '#F59E0B', // Âmbar
  '#EF4444', // Vermelho
  '#8B5CF6', // Roxo
  '#F97316', // Laranja
  '#06B6D4', // Ciano
  '#84CC16', // Lima
  '#EC4899', // Rosa
  '#6B7280'  // Cinza
]

export function PortfolioDistributionChart({ positions }: PortfolioDistributionChartProps) {
  
  const chartData = useMemo((): DistributionData[] => {
    if (positions.length === 0) return []

    const totalValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0)
    
    return positions
      .sort((a, b) => b.marketValue - a.marketValue)
      .slice(0, 10) // Top 10 posições
      .map((position, index) => ({
        name: position.assetName, // Usar nome ao invés de ID
        value: position.marketValue,
        percentage: totalValue > 0 ? (position.marketValue / totalValue) * 100 : 0,
        color: CHART_COLORS[index % CHART_COLORS.length]
      }))
  }, [positions])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <p className="font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">Valor: </span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {formatCurrency(data.value)}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">Participação: </span>
              <span className="font-medium text-purple-600 dark:text-purple-400">
                {data.percentage.toFixed(1)}%
              </span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 5) return null // Não mostrar label para fatias muito pequenas
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-lg mb-2">🥧</div>
          <p className="font-medium">Nenhuma posição</p>
          <p className="text-sm">Registre investimentos para ver a distribuição</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => (
              <span style={{ color: entry.color, fontWeight: 500 }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
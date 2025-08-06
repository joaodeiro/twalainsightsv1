'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TimeSeriesPoint } from '@/lib/performance'
import { formatCurrency, formatPercent } from '@/lib/performance'
import { format, parseISO } from 'date-fns'
import { Card } from '@/components/ui/Card'

interface PerformanceChartProps {
  data: TimeSeriesPoint[]
  title?: string
  height?: number
  showInvested?: boolean
  showReturn?: boolean
}

export function PerformanceChart({ 
  data, 
  title = "Performance da Carteira",
  height = 300,
  showInvested = true,
  showReturn = true
}: PerformanceChartProps) {
  
  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'returnPercent') {
      return [formatPercent(value), 'Retorno %']
    }
    return [formatCurrency(value), name === 'value' ? 'Valor Atual' : name === 'invested' ? 'Total Investido' : 'Retorno']
  }

  const formatXAxisLabel = (tickItem: string) => {
    try {
      return format(parseISO(tickItem), 'dd/MM')
    } catch {
      return tickItem
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = parseISO(label)
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            {format(date, 'dd/MM/yyyy')}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatTooltipValue(entry.value, entry.dataKey)[0]}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
              📈
            </div>
            <p>Dados insuficientes para gerar o gráfico</p>
            <p className="text-sm mt-1">Registre algumas transações para ver a performance</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
      
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxisLabel}
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis 
            yAxisId="currency"
            orientation="left"
            tickFormatter={(value) => formatCurrency(value).replace('AOA', 'K').replace(',00', '')}
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          {showReturn && (
            <YAxis 
              yAxisId="percent"
              orientation="right"
              tickFormatter={(value) => `${value.toFixed(1)}%`}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
          )}
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <Line
            yAxisId="currency"
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            name="Valor Atual"
            connectNulls
          />
          
          {showInvested && (
            <Line
              yAxisId="currency"
              type="monotone"
              dataKey="invested"
              stroke="#6B7280"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Total Investido"
              connectNulls
            />
          )}
          
          {showReturn && (
            <Line
              yAxisId="percent"
              type="monotone"
              dataKey="returnPercent"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              name="Retorno %"
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
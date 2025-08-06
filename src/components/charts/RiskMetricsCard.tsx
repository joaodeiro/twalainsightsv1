'use client'

import { Card } from '@/components/ui/Card'
import { TimeSeriesPoint, calculateRiskMetrics } from '@/lib/performance'
import { AlertTriangle, Shield, TrendingUp, Activity } from 'lucide-react'

interface RiskMetricsCardProps {
  timeSeries: TimeSeriesPoint[]
  title?: string
}

export function RiskMetricsCard({ 
  timeSeries, 
  title = "Indicadores de Risco" 
}: RiskMetricsCardProps) {
  
  const riskMetrics = calculateRiskMetrics(timeSeries)

  const getRiskColor = (metric: string, value: number) => {
    switch (metric) {
      case 'volatility':
        if (value < 15) return 'text-green-600'
        if (value < 25) return 'text-yellow-600'
        return 'text-red-600'
      case 'sharpe':
        if (value > 1.5) return 'text-green-600'
        if (value > 0.5) return 'text-yellow-600'
        return 'text-red-600'
      case 'maxDrawdown':
        if (value < 10) return 'text-green-600'
        if (value < 20) return 'text-yellow-600'
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getRiskLevel = (volatility: number) => {
    if (volatility < 15) return { level: 'Baixo', color: 'bg-green-100 text-green-800' }
    if (volatility < 25) return { level: 'Moderado', color: 'bg-yellow-100 text-yellow-800' }
    return { level: 'Alto', color: 'bg-red-100 text-red-800' }
  }

  if (!timeSeries || timeSeries.length < 2) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>Dados insuficientes</p>
            <p className="text-sm">Histórico muito curto para calcular riscos</p>
          </div>
        </div>
      </Card>
    )
  }

  const riskLevel = getRiskLevel(riskMetrics.volatility)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${riskLevel.color}`}>
          Risco {riskLevel.level}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Volatilidade */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <Activity className={`w-6 h-6 mx-auto mb-2 ${getRiskColor('volatility', riskMetrics.volatility)}`} />
          <div className={`text-2xl font-bold ${getRiskColor('volatility', riskMetrics.volatility)}`}>
            {riskMetrics.volatility.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Volatilidade</div>
          <div className="text-xs text-gray-500 mt-1">Anualizada</div>
        </div>

        {/* Sharpe Ratio */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${getRiskColor('sharpe', riskMetrics.sharpeRatio)}`} />
          <div className={`text-2xl font-bold ${getRiskColor('sharpe', riskMetrics.sharpeRatio)}`}>
            {riskMetrics.sharpeRatio.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Sharpe Ratio</div>
          <div className="text-xs text-gray-500 mt-1">Retorno/Risco</div>
        </div>

        {/* Maximum Drawdown */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <AlertTriangle className={`w-6 h-6 mx-auto mb-2 ${getRiskColor('maxDrawdown', riskMetrics.maxDrawdown)}`} />
          <div className={`text-2xl font-bold ${getRiskColor('maxDrawdown', riskMetrics.maxDrawdown)}`}>
            {riskMetrics.maxDrawdown.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Max Drawdown</div>
          <div className="text-xs text-gray-500 mt-1">Maior queda</div>
        </div>

        {/* Beta */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <Shield className="w-6 h-6 mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold text-blue-600">
            {riskMetrics.beta.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Beta</div>
          <div className="text-xs text-gray-500 mt-1">vs. Mercado</div>
        </div>
      </div>

      {/* Explicação dos Indicadores */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Como interpretar:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li><strong>Volatilidade:</strong> Mede a variação dos preços. Menor é mais estável.</li>
          <li><strong>Sharpe Ratio:</strong> Retorno ajustado ao risco. Maior que 1 é bom.</li>
          <li><strong>Max Drawdown:</strong> Maior perda desde o pico anterior.</li>
          <li><strong>Beta:</strong> Sensibilidade ao mercado. 1 = acompanha mercado.</li>
        </ul>
      </div>
    </Card>
  )
}
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'

export default function IndicatorsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Indicadores
          </h1>
          <p className="text-gray-600">
            Acompanhe os indicadores de desempenho dos seus ativos.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Retorno Total
            </h3>
            <div className="text-3xl font-bold text-success-600 mb-2">
              +0,00%
            </div>
            <p className="text-sm text-gray-500">
              Retorno desde o início
            </p>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Volatilidade
            </h3>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              0,00%
            </div>
            <p className="text-sm text-gray-500">
              Medida de risco
            </p>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Sharpe Ratio
            </h3>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              0,00
            </div>
            <p className="text-sm text-gray-500">
              Retorno ajustado ao risco
            </p>
          </Card>
        </div>

        <Card className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Indicadores por Ativo
          </h2>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-gray-500 mb-2">
              Nenhum indicador disponível
            </p>
            <p className="text-sm text-gray-400">
              Adicione ativos à sua carteira para ver os indicadores
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
} 
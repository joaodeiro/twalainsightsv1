'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { PortfolioStats } from '@/components/ui/PortfolioStats'
import { AssetOverview } from '@/components/ui/AssetOverview'
import { PerformanceOverview } from '@/components/ui/PerformanceOverview'
import { MarketNews } from '@/components/ui/MarketNews'
import { InsightsPreview } from '@/components/ui/InsightsPreview'
import { HomeQuickActions } from '@/components/ui/QuickActions'
import { CustodyAccountsSummary } from '@/components/ui/CustodyAccountsSummary'
import { QuickInsightsCards } from '@/components/charts/QuickInsightsCards'
import { AsyncErrorBoundary } from '@/components/AsyncErrorBoundary'
import { LoadingPage } from '@/components/ui/LoadingPage'
import { PrerequisiteDebug } from '@/components/ui/PrerequisiteDebug'
import { useApp } from '@/contexts/AppContext'
import { getAssets } from '@/lib/assets'
import { useState, useEffect } from 'react'
import type { Asset } from '@/types'

export default function HomePage() {
  const { transactions, custodyAccounts, loading } = useApp()
  const [assets, setAssets] = useState<Asset[]>([])

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const assetsData = await getAssets()
        setAssets(assetsData)
      } catch (error) {
        console.error('Erro ao carregar ativos:', error)
      }
    }

    loadAssets()
  }, [])

  if (loading) {
    return (
      <ProtectedRoute>
        <LoadingPage text="Carregando dashboard..." />
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {/* Header de Boas-vindas */}
          <div className="mb-6 sm:mb-8 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 px-2 sm:px-0">
              Bem-vindo ao Twala Insights
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-2 sm:px-0">
              Sua plataforma completa para gestão de investimentos na BODIVA.
            </p>
          </div>

          {/* Estatísticas Gerais */}
          <div className="mb-6 sm:mb-8 px-2 sm:px-0">
            <PortfolioStats
              transactions={transactions}
              totalValue={0} // TODO: Calcular valor total
              totalReturn={0} // TODO: Calcular retorno total
              totalReturnPercent={0} // TODO: Calcular retorno percentual
            />
          </div>

          {/* Quick Insights Cards */}
          {transactions.length > 0 && (
            <div className="mb-6 sm:mb-8 px-2 sm:px-0">
              <QuickInsightsCards transactions={transactions} assets={assets} />
            </div>
          )}

          {/* Layout Principal - Grid Responsivo */}
          <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-12">
            {/* Coluna 1: Performance e Ativos (6 colunas) */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Asset Overview */}
              <AsyncErrorBoundary errorMessage="Erro ao carregar dados dos ativos">
                <AssetOverview transactions={transactions} />
              </AsyncErrorBoundary>
            </div>

            {/* Coluna 2: Performance da Carteira (6 colunas) */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Performance Overview */}
              <AsyncErrorBoundary errorMessage="Erro ao carregar dados de performance">
                <PerformanceOverview transactions={transactions} />
              </AsyncErrorBoundary>

              {/* Contas de Custódia */}
              <CustodyAccountsSummary
                accounts={custodyAccounts}
                maxDisplay={3}
              />
            </div>
          </div>

          {/* Seção de Notícias e Insights */}
          <div className="mt-8 grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-2">
            {/* Notícias do Mercado */}
            <AsyncErrorBoundary errorMessage="Erro ao carregar notícias">
              <MarketNews />
            </AsyncErrorBoundary>

            {/* Insights Preview */}
            <AsyncErrorBoundary errorMessage="Erro ao carregar insights">
              <InsightsPreview />
            </AsyncErrorBoundary>
          </div>

          {/* Seção de Transações Recentes (Mobile) */}
          <div className="mt-8 lg:hidden">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Transações Recentes
                </h2>
                <button
                  onClick={() => window.location.href = '/transactions'}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Ver todas
                </button>
              </div>
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">
                  Nenhuma transação recente
                </p>
                <p className="text-sm text-gray-400">
                  Registre sua primeira transação para começar
                </p>
              </div>
            </Card>
          </div>

          {/* Seção de Funcionalidades Futuras */}
          <div className="mt-12">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Funcionalidades em Desenvolvimento
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Análise Técnica
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Gráficos avançados, indicadores técnicos e ferramentas de análise.
                  </p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2zM4 3h6V1H4v2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Alertas Inteligentes
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Notificações personalizadas sobre preços, dividendos e oportunidades.
                  </p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Comunidade
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Fórum de investidores, compartilhamento de estratégias e networking.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Componente de Debug - apenas em desenvolvimento */}
      <PrerequisiteDebug />
    </ProtectedRoute>
  )
} 
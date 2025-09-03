'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { EnhancedPortfolioStats } from '@/components/ui/EnhancedPortfolioStats'
import { AssetOverview } from '@/components/ui/AssetOverview'
import { PerformanceOverview } from '@/components/ui/PerformanceOverview'
import { MarketNews } from '@/components/ui/MarketNews'
import { InsightsPreview } from '@/components/ui/InsightsPreview'
import { HomeQuickActions } from '@/components/ui/QuickActions'
import { CustodyAccountsSummary } from '@/components/ui/CustodyAccountsSummary'
import { AsyncErrorBoundary } from '@/components/AsyncErrorBoundary'
import { LoadingPage } from '@/components/ui/LoadingPage'
import { PrerequisiteDebug } from '@/components/ui/PrerequisiteDebug'
import { useApp } from '@/contexts/AppContext'
import { getAssets } from '@/lib/assets'
import { useState, useEffect } from 'react'
import { Calculator, BarChart3, Bell, Users } from 'lucide-react'
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
        <LoadingPage text="A carregar dashboard..." />
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {/* Header de Boas-vindas */}
          <div className="mb-6 sm:mb-8 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 px-2 sm:px-0">
              Bem-vindo ao Twala Insights
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-2 sm:px-0">
              A tua plataforma completa para gestão de investimentos na BODIVA.
            </p>
          </div>

          {/* Primeira Dobra - Cards Principais */}
          <div className="mb-6 sm:mb-8 px-2 sm:px-0">
            <EnhancedPortfolioStats transactions={transactions} />
          </div>

          {/* Performance da Carteira - 100% largura */}
          <div className="mb-6 sm:mb-8 px-2 sm:px-0">
            <AsyncErrorBoundary errorMessage="Erro ao carregar dados do desempenho">
              <PerformanceOverview transactions={transactions} />
            </AsyncErrorBoundary>
          </div>

          {/* Layout Principal - Grid Responsivo */}
          <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-2">
            {/* Coluna 1: Principais Ativos */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <AsyncErrorBoundary errorMessage="Erro ao carregar dados dos ativos">
                <AssetOverview transactions={transactions} />
              </AsyncErrorBoundary>
            </div>

            {/* Coluna 2: Contas de Custódia */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <CustodyAccountsSummary
                accounts={custodyAccounts}
                maxDisplay={3}
              />
            </div>
          </div>

          {/* Seção de Notícias e Insights */}
          <div className="mt-8 grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-2">
            {/* Notícias do Mercado */}
            <AsyncErrorBoundary errorMessage="Erro ao carregar as notícias">
              <MarketNews />
            </AsyncErrorBoundary>

            {/* Insights Preview */}
            <AsyncErrorBoundary errorMessage="Erro ao carregar os insights">
              <InsightsPreview />
            </AsyncErrorBoundary>
          </div>

          {/* Seção de Transações Recentes (Mobile) */}
          <div className="mt-8 lg:hidden">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Operações Recentes
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
                  <Calculator className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">
                  Nenhuma operação recente
                </p>
                <p className="text-sm text-gray-400">
                  Regista a tua primeira operação para começar
                </p>
              </div>
            </Card>
          </div>

          {/* Seção de Funcionalidades Futuras */}
          <div className="mt-12">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Funcionalidades em Desenvolvimento
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Análise Técnica
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Gráficos avançados, indicadores técnicos e ferramentas para análise.
                  </p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-800/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Alertas Inteligentes
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Notificações personalizadas sobre preços, dividendos e outras oportunidades.
                  </p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Comunidade
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Fórum de investidores, partilha de estratégias e networking.
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
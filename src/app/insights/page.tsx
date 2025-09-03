'use client'

import { useState } from 'react'
import { Header } from '@/components/ui/Header'
import { Card } from '@/components/ui/Card'
import { LoadingPage } from '@/components/ui/LoadingPage'
import { Newspaper, BookOpen, TrendingUp, Clock, ExternalLink } from 'lucide-react'

export default function InsightsPage() {
  const [isLoading] = useState(false)

  if (isLoading) {
    return <LoadingPage text="Carregando insights..." />
  }

  const articles = [
    {
      id: 1,
      title: "Mercado de Capitais Angolano em Crescimento",
      excerpt: "O mercado de capitais angolano continua a mostrar sinais de crescimento com novas empresas listadas na BODIVA.",
      category: "Mercado",
      readTime: "5 min",
      publishedAt: "2024-01-15",
      image: "📈"
    },
    {
      id: 2,
      title: "Estratégias de Diversificação para 2024",
      excerpt: "Como diversificar sua carteira de investimentos no mercado angolano para maximizar retornos.",
      category: "Educação",
      readTime: "8 min",
      publishedAt: "2024-01-12",
      image: "🎯"
    },
    {
      id: 3,
      title: "Análise Setorial: Telecomunicações",
      excerpt: "Perspectivas do setor de telecomunicações e oportunidades de investimento.",
      category: "Análise",
      readTime: "12 min",
      publishedAt: "2024-01-10",
      image: "📱"
    }
  ]

  const news = [
    {
      id: 1,
      title: "BODIVA anuncia novas medidas para atrair investidores",
      time: "2h atrás",
      source: "BODIVA Official"
    },
    {
      id: 2,
      title: "Banco Nacional de Angola ajusta taxa de juros",
      time: "4h atrás",
      source: "BNA"
    },
    {
      id: 3,
      title: "Petróleo Kwanza fecha em alta de 3.2%",
      time: "6h atrás",
      source: "Market Watch"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Insights & Notícias
          </h1>
          <p className="text-gray-600">
            Fica por dentro das últimas notícias e análises do mercado financeiro angolano.
          </p>
        </div>

        {/* Cards de Navegação */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Notícias</div>
                <div className="text-xs text-gray-500">Últimas atualizações</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Artigos</div>
                <div className="text-xs text-gray-500">Análises detalhadas</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Tendências</div>
                <div className="text-xs text-gray-500">Mercado em foco</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Tempo Real</div>
                <div className="text-xs text-gray-500">Atualizações live</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Artigos em Destaque */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Artigos em Destaque</h2>
            <div className="space-y-6">
              {articles.map((article) => (
                <Card key={article.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{article.image}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                          {article.category}
                        </span>
                        <span className="text-xs text-gray-500">{article.readTime} de leitura</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(article.publishedAt).toLocaleDateString('pt-AO')}
                        </span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Notícias Recentes */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Notícias Recentes</h2>
            <Card className="p-4">
              <div className="space-y-4">
                {news.map((item) => (
                  <div key={item.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <h4 className="text-sm font-medium text-gray-900 mb-1 hover:text-primary-600 cursor-pointer">
                      {item.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{item.source}</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Ver todas as notícias →
                </button>
              </div>
            </Card>

            {/* Newsletter Signup */}
            <Card className="p-4 mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Newsletter Semanal
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                Receba as principais análises e notícias do mercado diretamente no seu email.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Seu email"
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Inscrever-se
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
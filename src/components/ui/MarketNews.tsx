'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  date: string
  category: 'market' | 'company' | 'economy' | 'regulation'
}

const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'BODIVA registra crescimento de 12% no volume de negociações',
    summary: 'A Bolsa de Valores e Derivados de Angola registrou um aumento significativo no volume de negociações no primeiro trimestre.',
    source: 'BODIVA',
    date: '2024-01-15',
    category: 'market'
  },
  {
    id: '2',
    title: 'BFA anuncia pagamento de dividendos para acionistas',
    summary: 'O Banco de Fomento Angola anunciou o pagamento de dividendos de 2,50 AOA por ação para o exercício de 2023.',
    source: 'BFA',
    date: '2024-01-12',
    category: 'company'
  },
  {
    id: '3',
    title: 'Novas regulamentações para investidores estrangeiros',
    summary: 'O Banco Nacional de Angola anunciou novas diretrizes para facilitar investimentos estrangeiros no mercado local.',
    source: 'BNA',
    date: '2024-01-10',
    category: 'regulation'
  }
]

export function MarketNews() {
  const router = useRouter()

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'market': return 'bg-blue-100 text-blue-800'
      case 'company': return 'bg-green-100 text-green-800'
      case 'economy': return 'bg-purple-100 text-purple-800'
      case 'regulation': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'market': return 'Mercado'
      case 'company': return 'Empresa'
      case 'economy': return 'Economia'
      case 'regulation': return 'Regulação'
      default: return category
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-AO', {
      day: '2-digit',
      month: 'short'
    }).format(date)
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Notícias do Mercado
        </h2>
        <Button 
          size="sm"
          variant="secondary"
          onClick={() => router.push('/insights')}
        >
          Ver Todas
        </Button>
      </div>
      
      <div className="space-y-4">
        {mockNews.map((news) => (
          <div 
            key={news.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
            onClick={() => router.push('/insights')}
          >
            <div className="flex items-start justify-between mb-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(news.category)}`}>
                {getCategoryLabel(news.category)}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(news.date)}
              </span>
            </div>
            
            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
              {news.title}
            </h3>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {news.summary}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Fonte: {news.source}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Coming Soon Features */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Funcionalidades em Desenvolvimento
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Alertas de notícias personalizados</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Análise de sentimento das notícias</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Impacto das notícias nos seus ativos</span>
          </div>
        </div>
      </div>
    </Card>
  )
} 
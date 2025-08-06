'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

interface InsightItem {
  id: string
  title: string
  summary: string
  type: 'tip' | 'analysis' | 'strategy' | 'education'
  readTime: string
  tags: string[]
}

const mockInsights: InsightItem[] = [
  {
    id: '1',
    title: 'Como diversificar sua carteira na BODIVA',
    summary: 'Dicas práticas para construir uma carteira diversificada no mercado angolano.',
    type: 'strategy',
    readTime: '5 min',
    tags: ['Diversificação', 'Estratégia', 'BODIVA']
  },
  {
    id: '2',
    title: 'Entendendo os dividendos das ações angolanas',
    summary: 'Guia completo sobre como funcionam os dividendos no mercado local.',
    type: 'education',
    readTime: '8 min',
    tags: ['Dividendos', 'Educação', 'Renda Passiva']
  },
  {
    id: '3',
    title: 'Análise técnica: Padrões de reversão',
    summary: 'Identificando padrões de reversão para melhorar suas entradas e saídas.',
    type: 'analysis',
    readTime: '6 min',
    tags: ['Análise Técnica', 'Padrões', 'Trading']
  }
]

export function InsightsPreview() {
  const router = useRouter()

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tip': return 'bg-green-100 text-green-800'
      case 'analysis': return 'bg-blue-100 text-blue-800'
      case 'strategy': return 'bg-purple-100 text-purple-800'
      case 'education': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tip': return 'Dica'
      case 'analysis': return 'Análise'
      case 'strategy': return 'Estratégia'
      case 'education': return 'Educação'
      default: return type
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Insights e Educação
        </h2>
        <Button 
          size="sm"
          variant="secondary"
          onClick={() => router.push('/insights')}
        >
          Ver Todos
        </Button>
      </div>
      
      <div className="space-y-4">
        {mockInsights.map((insight) => (
          <div 
            key={insight.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
            onClick={() => router.push('/insights')}
          >
            <div className="flex items-start justify-between mb-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(insight.type)}`}>
                {getTypeLabel(insight.type)}
              </span>
              <span className="text-xs text-gray-500">
                {insight.readTime}
              </span>
            </div>
            
            <h3 className="font-medium text-gray-900 mb-2">
              {insight.title}
            </h3>
            
            <p className="text-sm text-gray-600 mb-3">
              {insight.summary}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {insight.tags.slice(0, 2).map((tag) => (
                  <span 
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
                {insight.tags.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{insight.tags.length - 2}
                  </span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          💡 Dica Rápida
        </h3>
        <p className="text-sm text-gray-700 mb-3">
          Mantenha um registro detalhado de suas transações para análises mais precisas de performance.
        </p>
        <Button 
          size="sm"
          onClick={() => router.push('/portfolio')}
          className="w-full"
        >
          Registrar Transação
        </Button>
      </div>
      
      {/* Coming Soon Features */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Em Breve
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Webinars semanais sobre investimentos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Cursos online certificados</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Comunidade de investidores</span>
          </div>
        </div>
      </div>
    </Card>
  )
} 
'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Calendar, Download, BarChart, Info } from 'lucide-react'

interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

interface QuickActionsProps {
  actions: QuickAction[]
  title?: string
}

export function QuickActions({ actions, title = 'Ações Rápidas' }: QuickActionsProps) {
  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {title}
      </h2>
      <div className="space-y-3">
        {actions.map((action) => (
          <Button
            key={action.id}
            onClick={action.onClick}
            variant={action.variant || 'primary'}
            disabled={action.disabled}
            className="w-full justify-start"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {action.icon}
              </div>
              <div className="text-left">
                <div className="font-medium">{action.label}</div>
                <div className="text-sm opacity-80">{action.description}</div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  )
}

// Componente específico para ações da carteira
export function PortfolioQuickActions({ 
  onAddTransaction, 
  onViewHistory, 
  onExportReport,
  hasCustodyAccounts = true 
}: {
  onAddTransaction: () => void
  onViewHistory: () => void
  onExportReport: () => void
  hasCustodyAccounts?: boolean
}) {
  const router = useRouter()

  const actions: QuickAction[] = [
    {
      id: 'add-transaction',
      label: 'Registrar Transação',
      description: 'Adicionar compra, venda ou proventos',
      icon: <Plus className="w-5 h-5" />,
      onClick: onAddTransaction,
      disabled: !hasCustodyAccounts
    },
    {
      id: 'view-history',
      label: 'Ver Histórico',
      description: 'Visualizar todas as transações',
      icon: <Calendar className="w-5 h-5" />,
      onClick: onViewHistory,
      variant: 'secondary'
    },
    {
      id: 'export-report',
      label: 'Exportar Relatório',
      description: 'Baixar relatório da carteira',
      icon: <Download className="w-5 h-5" />,
      onClick: onExportReport,
      variant: 'secondary'
    }
  ]

  return <QuickActions actions={actions} title="Ações Rápidas" />
}

// Componente específico para ações da página inicial
export function HomeQuickActions() {
  const router = useRouter()

  const actions: QuickAction[] = [
    {
      id: 'portfolio',
      label: 'Ver Carteira',
      description: 'Visualizar seus investimentos',
      icon: <BarChart className="w-5 h-5" />,
      onClick: () => router.push('/portfolio')
    },
    {
      id: 'transactions',
      label: 'Histórico',
      description: 'Ver todas as transações',
      icon: <Calendar className="w-5 h-5" />,
      onClick: () => router.push('/transactions'),
      variant: 'secondary'
    },
    {
      id: 'indicators',
      label: 'Indicadores',
      description: 'Análise de performance',
      icon: <BarChart className="w-5 h-5" />,
      onClick: () => router.push('/indicators'),
      variant: 'secondary'
    },
    {
      id: 'insights',
      label: 'Insights',
      description: 'Dicas e análises',
      icon: <Info className="w-5 h-5" />,
      onClick: () => router.push('/insights'),
      variant: 'secondary'
    }
  ]

  return <QuickActions actions={actions} title="Navegação Rápida" />
} 
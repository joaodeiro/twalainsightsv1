'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Building2, ChevronRight } from 'lucide-react'
import type { CustodyAccount } from '@/types'

interface CustodyAccountsSummaryProps {
  accounts: CustodyAccount[]
  maxDisplay?: number
}

export function CustodyAccountsSummary({ accounts, maxDisplay = 3 }: CustodyAccountsSummaryProps) {
  const router = useRouter()
  const displayedAccounts = accounts.slice(0, maxDisplay)
  const hasMore = accounts.length > maxDisplay

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
    }).format(value)
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Contas de Custódia
          </h2>
          <Button 
            size="sm"
            onClick={() => router.push('/custody-accounts')}
          >
            Cadastrar
          </Button>
        </div>
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-2">
            Nenhuma conta cadastrada
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Cadastre sua primeira conta para começar
          </p>
          <Button 
            onClick={() => router.push('/custody-accounts')}
            className="btn-primary"
          >
            Cadastrar Conta
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Contas de Custódia ({accounts.length})
        </h2>
        <Button 
          size="sm"
          variant="secondary"
          onClick={() => router.push('/custody-accounts')}
        >
          Ver Todas
        </Button>
      </div>
      
      <div className="space-y-3">
        {displayedAccounts.map((account) => (
          <div 
            key={account.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => router.push('/custody-accounts')}
          >
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {account.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {account.institution}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Conta: {account.accountNumber}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                Ativa
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
        
        {hasMore && (
          <div className="text-center pt-2">
            <Button 
              variant="secondary"
              size="sm"
              onClick={() => router.push('/custody-accounts')}
            >
              Ver mais {accounts.length - maxDisplay} conta{accounts.length - maxDisplay > 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
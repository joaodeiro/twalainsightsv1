'use client'

import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { usePrerequisites } from '@/hooks/usePrerequisites'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function PrerequisiteDebug() {
  const { custodyAccounts, transactions, hasCustodyAccounts, hasTransactions, loading } = useApp()
  const { prerequisites, resetPrerequisites, clearPrerequisiteStorage } = usePrerequisites()
  const [showDebug, setShowDebug] = useState(false)

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => setShowDebug(true)}
        >
          🔧 Debug Prerequisites
        </Button>
      </div>
    )
  }

  const custodyModal = prerequisites.find(p => p.type === 'custody')
  const transactionModal = prerequisites.find(p => p.type === 'transactions')

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="p-4 bg-white border-2 border-blue-500 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-blue-700">🔧 Debug de Pré-requisitos</h3>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => setShowDebug(false)}
          >
            ✕
          </Button>
        </div>

        <div className="space-y-3 text-sm">
          {/* Status de Carregamento */}
          <div className="p-2 bg-gray-50 rounded">
            <strong>📡 Carregamento:</strong>
            <div className="ml-2">
              <div>A carregar: {loading ? '⏳ Sim' : '✅ Não'}</div>
            </div>
          </div>

          {/* Status das Contas */}
          <div className="p-2 bg-blue-50 rounded">
            <strong>🏦 Contas de Custódia:</strong>
            <div className="ml-2">
              <div>Quantidade: {custodyAccounts.length}</div>
              <div>hasCustodyAccounts: {hasCustodyAccounts ? '✅ Sim' : '❌ Não'}</div>
              <div>Modal hasBeenShown: {custodyModal?.hasBeenShown ? '✅ Sim' : '❌ Não'}</div>
              <div>Modal isOpen: {custodyModal?.isOpen ? '🚨 Sim' : '✅ Não'}</div>
              <div>localStorage: {localStorage.getItem('twala-prerequisite-custody') || 'null'}</div>
            </div>
          </div>

          {/* Status das Transações */}
          <div className="p-2 bg-green-50 rounded">
            <strong>💰 Transações:</strong>
            <div className="ml-2">
              <div>Quantidade: {transactions.length}</div>
              <div>hasTransactions: {hasTransactions ? '✅ Sim' : '❌ Não'}</div>
              <div>Modal hasBeenShown: {transactionModal?.hasBeenShown ? '✅ Sim' : '❌ Não'}</div>
              <div>Modal isOpen: {transactionModal?.isOpen ? '🚨 Sim' : '✅ Não'}</div>
              <div>localStorage: {localStorage.getItem('twala-prerequisite-transactions') || 'null'}</div>
            </div>
          </div>

          {/* Detalhes das Contas */}
          {custodyAccounts.length > 0 && (
            <div className="p-2 bg-yellow-50 rounded">
              <strong>📋 Lista de Contas:</strong>
              <div className="ml-2 max-h-20 overflow-y-auto">
                {custodyAccounts.map(acc => (
                  <div key={acc.id} className="text-xs">
                    • {acc.name} ({acc.institution}) - {acc.isActive ? 'Ativa' : 'Inativa'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ações de Debug */}
          <div className="space-y-2 pt-2 border-t">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={clearPrerequisiteStorage}
              className="w-full"
            >
              🧹 Limpar localStorage
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={resetPrerequisites}
              className="w-full"
            >
              🔄 Reset Completo
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              ♻️ Recarregar Página
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
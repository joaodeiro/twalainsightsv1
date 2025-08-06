'use client'

import { Button } from '@/components/ui/Button'
import { usePrerequisites } from '@/hooks/usePrerequisites'

export function TestModal() {
  const { resetPrerequisites, hasCustodyAccounts, hasTransactions } = usePrerequisites()

  const handleReset = () => {
    resetPrerequisites()
    // Forçar reload para testar
    window.location.reload()
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
      <h3 className="font-semibold mb-2">Teste de Modais</h3>
      <div className="text-sm mb-3">
        <div>Contas: {hasCustodyAccounts ? '✅' : '❌'}</div>
        <div>Transações: {hasTransactions ? '✅' : '❌'}</div>
      </div>
      <Button onClick={handleReset} size="sm">
        Resetar Modais
      </Button>
    </div>
  )
} 
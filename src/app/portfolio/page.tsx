'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar, Building, Download, X, Building2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TransactionTypeSelector, type TransactionType } from '@/components/ui/TransactionTypeSelector'
import { ExportSelector, type ExportType } from '@/components/ui/ExportSelector'
import { CustodyAccountsSummary } from '@/components/ui/CustodyAccountsSummary'
import { PortfolioStats } from '@/components/ui/PortfolioStats'
import { PortfolioAssetsTable } from '@/components/ui/PortfolioAssetsTable'
import { useToast } from '@/components/ui/Toast'
import { 
  exportPortfolioToCSV, 
  exportPortfolioToPDF 
} from '@/lib/export'

import { useApp } from '@/contexts/AppContext'

export default function PortfolioPage() {
  const { custodyAccounts, transactions } = useApp()
  const { showToast } = useToast()
  const router = useRouter()
  const [showCustodyModal, setShowCustodyModal] = useState(false)
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [showExportSelector, setShowExportSelector] = useState(false)

  const handleAddTransaction = () => {
    if (custodyAccounts.length === 0) {
      setShowCustodyModal(true)
    } else {
      setShowTypeSelector(true)
    }
  }

  const handleTransactionTypeSelect = (type: TransactionType) => {
    setShowTypeSelector(false)
    
    // Navegar para a página específica baseada no tipo
    switch (type) {
      case 'BUY':
        router.push('/transactions/buy')
        break
      case 'SELL':
        router.push('/transactions/sell')
        break
      case 'DIVIDEND':
        router.push('/transactions/dividend')
        break
      case 'INTEREST':
        router.push('/transactions/interest')
        break
    }
  }

  const handleViewHistory = () => {
    router.push('/transactions')
  }

  const handleExportReport = () => {
    setShowExportSelector(true)
  }

  const handleExportSelect = async (type: ExportType) => {
    try {
      if (type === 'CSV') {
        await exportPortfolioToCSV(transactions, custodyAccounts)
        showToast('success', 'Carteira exportada em CSV com sucesso, meu!')
      } else {
        await exportPortfolioToPDF(transactions, custodyAccounts)
        showToast('success', 'Carteira exportada em PDF com sucesso, meu!')
      }
    } catch (error) {
      console.error('Erro ao exportar:', error)
      showToast('error', 'Eish, deu erro ao exportar a carteira. Tenta outra vez, né.')
    }
  }

  const handleViewCustodyAccounts = () => {
    router.push('/custody-accounts')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
             <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 px-2 sm:px-0">
            A Minha Carteira
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-2 sm:px-0">
            Aqui podes ver e gerir os teus investimentos, meu.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="mb-6 sm:mb-8 px-2 sm:px-0">
          {/* Layout Mobile - Stacked */}
          <div className="flex flex-col space-y-3 sm:hidden">
            <Button 
              onClick={handleAddTransaction}
              className="flex items-center justify-center space-x-2 w-full"
            >
              <Plus className="w-5 h-5" />
              <span>Nova Operação</span>
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="secondary"
                onClick={handleViewHistory}
                className="flex items-center justify-center space-x-1 text-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Histórico</span>
              </Button>
              
              <Button 
                variant="secondary"
                onClick={handleViewCustodyAccounts}
                className="flex items-center justify-center space-x-1 text-sm"
              >
                <Building className="w-4 h-4" />
                <span>Contas</span>
              </Button>
            </div>
          </div>
          
          {/* Layout Desktop - Horizontal */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex space-x-4">
              <Button 
                onClick={handleAddTransaction}
                className="flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nova Operação</span>
              </Button>
              
              <Button 
                variant="secondary"
                onClick={handleViewHistory}
                className="flex items-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Histórico de Operações</span>
              </Button>
            </div>
            
            <div className="flex space-x-4">
              <Button 
                variant="secondary"
                onClick={handleViewCustodyAccounts}
                className="flex items-center space-x-2"
              >
                <Building className="w-5 h-5" />
                <span>Contas de Custódia</span>
              </Button>
              
              <Button 
                variant="secondary"
                onClick={handleExportReport}
                className="flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Exportar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas da Carteira */}
        <div className="mb-6 sm:mb-8 px-2 sm:px-0">
          <PortfolioStats 
            transactions={transactions}
            totalValue={0} // TODO: Calcular valor total
            totalReturn={0} // TODO: Calcular retorno total
            totalReturnPercent={0} // TODO: Calcular retorno percentual
          />
        </div>

        {/* Tabela de Ativos da Carteira */}
        <div className="mb-6 sm:mb-8 px-2 sm:px-0">
          <PortfolioAssetsTable transactions={transactions} />
        </div>

        {/* Seção de Contas de Custódia (Mobile) */}
        <div className="lg:hidden px-2 sm:px-0">
          <CustodyAccountsSummary 
            accounts={custodyAccounts}
            maxDisplay={3}
          />
        </div>
      </div>

      {/* Modal para conta de custódia necessária */}
      {showCustodyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowCustodyModal(false)} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Precisas de uma Conta de Custódia</h3>
                <button onClick={() => setShowCustodyModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Primeiro Passo: Conta de Custódia
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Para começares a registar operações, precisas cadastrar pelo menos uma conta de custódia, meu.
                    Isso ajuda-nos a organizar os teus investimentos por instituição.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setShowCustodyModal(false)
                        router.push('/custody-accounts')
                      }}
                      className="w-full btn-primary"
                    >
                      Cadastrar Conta de Custódia
                    </button>
                    <button
                      onClick={() => setShowCustodyModal(false)}
                      className="w-full btn-secondary"
                    >
                      Mais tarde
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Tipo */}
      {showTypeSelector && (
        <TransactionTypeSelector
          onSelect={handleTransactionTypeSelect}
          onClose={() => setShowTypeSelector(false)}
        />
      )}

      {/* Modal de Exportação */}
      <ExportSelector
        isOpen={showExportSelector}
        onClose={() => setShowExportSelector(false)}
        onSelect={handleExportSelect}
        title="Exportar Carteira"
        description="Escolhe o formato para exportar a tua carteira de investimentos:"
      />
    </div>
  )
}
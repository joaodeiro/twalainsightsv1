'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar, Building, Download } from 'lucide-react'
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
        showToast('success', 'Carteira exportada em CSV com sucesso!')
      } else {
        await exportPortfolioToPDF(transactions, custodyAccounts)
        showToast('success', 'Carteira exportada em PDF com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao exportar:', error)
      showToast('error', 'Erro ao exportar carteira. Tente novamente.')
    }
  }

  const handleViewCustodyAccounts = () => {
    router.push('/custody-accounts')
  }

  return (
    <div className="min-h-screen bg-gray-50">
             <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 px-2 sm:px-0">
            Carteira
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-2 sm:px-0">
            Visualize e gerencie seus investimentos.
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
              <span>Nova Transação</span>
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
                <span>Nova Transação</span>
              </Button>
              
              <Button 
                variant="secondary"
                onClick={handleViewHistory}
                className="flex items-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Histórico de Transações</span>
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
            <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl transform transition-all">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Conta de Custódia Necessária</h3>
                <button onClick={() => setShowCustodyModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Primeiro Passo: Conta de Custódia
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Para começar a registrar transações, você precisa cadastrar pelo menos uma conta de custódia.
                    Isso nos ajuda a organizar seus investimentos por instituição.
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
                      Depois
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
        description="Escolha o formato para exportar sua carteira de investimentos:"
      />
    </div>
  )
} 
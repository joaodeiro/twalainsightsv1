import { useState, useEffect, useCallback, useRef } from 'react'
import { useApp } from '@/contexts/AppContext'

export type PrerequisiteType = 'custody' | 'transactions'

export interface PrerequisiteState {
  type: PrerequisiteType
  isOpen: boolean
  hasBeenShown: boolean
}

export interface PrerequisiteConfig {
  type: PrerequisiteType
  title: string
  description: string
  actionUrl: string
  actionText: string
  icon: React.ReactNode
  bgColor: string
  iconColor: string
}

export function usePrerequisites() {
  const { hasCustodyAccounts, hasTransactions, loading } = useApp()
  const [prerequisites, setPrerequisites] = useState<PrerequisiteState[]>([
    { type: 'custody', isOpen: false, hasBeenShown: false },
    { type: 'transactions', isOpen: false, hasBeenShown: false }
  ])
  const [mounted, setMounted] = useState(false)
  const [isAuthPage, setIsAuthPage] = useState(false)
  const hasCheckedRef = useRef(false)

  // Carregar estado inicial
  useEffect(() => {
    setMounted(true)
    
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      setIsAuthPage(pathname === '/login' || pathname === '/register')
      
      // Carregar estado salvo do localStorage
      const savedCustody = localStorage.getItem('twala-prerequisite-custody') === 'true'
      const savedTransactions = localStorage.getItem('twala-prerequisite-transactions') === 'true'
      
      setPrerequisites([
        { type: 'custody', isOpen: false, hasBeenShown: savedCustody },
        { type: 'transactions', isOpen: false, hasBeenShown: savedTransactions }
      ])
    }
  }, [])

  // Função para verificar e mostrar pré-requisitos
  const checkPrerequisites = useCallback(() => {
    // Aguardar carregamento completo antes de verificar
    if (!mounted || isAuthPage || loading || hasCheckedRef.current) {
      console.log('🔍 Prerequisites check skipped:', { mounted, isAuthPage, loading, hasChecked: hasCheckedRef.current })
      return
    }

    console.log('🔍 Prerequisites check executing:', { 
      hasCustodyAccounts, 
      hasTransactions,
      localStorage: {
        custody: localStorage.getItem('twala-prerequisite-custody'),
        transactions: localStorage.getItem('twala-prerequisite-transactions')
      }
    })

    hasCheckedRef.current = true

    setPrerequisites(prev => {
      const updated = [...prev]
      
      // Verificar conta de custódia
      const custodyIndex = updated.findIndex(p => p.type === 'custody')
      if (custodyIndex !== -1) {
        const custody = updated[custodyIndex]
        
        console.log('🏦 Custody check:', { 
          hasCustodyAccounts, 
          hasBeenShown: custody.hasBeenShown 
        })
        
        // Se não tem contas mas não mostrou ainda, E não tem transações também
        if (!hasCustodyAccounts && !custody.hasBeenShown && !hasTransactions) {
          console.log('🏦 Showing custody modal')
          custody.isOpen = true
          custody.hasBeenShown = true
          localStorage.setItem('twala-prerequisite-custody', 'true')
        }
        // Se tem contas mas já mostrou, resetar
        else if (hasCustodyAccounts && custody.hasBeenShown) {
          console.log('🏦 Resetting custody modal state (user now has accounts)')
          custody.hasBeenShown = false
          localStorage.removeItem('twala-prerequisite-custody')
        }
      }

      // Verificar transações (só se já tem contas de custódia)
      const transactionIndex = updated.findIndex(p => p.type === 'transactions')
      if (transactionIndex !== -1) {
        const transaction = updated[transactionIndex]
        
        console.log('💰 Transaction check:', { 
          hasCustodyAccounts,
          hasTransactions, 
          hasBeenShown: transaction.hasBeenShown 
        })
        
        // Se tem contas mas não tem transações e não mostrou ainda
        if (hasCustodyAccounts && !hasTransactions && !transaction.hasBeenShown) {
          console.log('💰 Showing transaction modal')
          transaction.isOpen = true
          transaction.hasBeenShown = true
          localStorage.setItem('twala-prerequisite-transactions', 'true')
        }
        // Se tem transações mas já mostrou, resetar
        else if (hasTransactions && transaction.hasBeenShown) {
          console.log('💰 Resetting transaction modal state (user now has transactions)')
          transaction.hasBeenShown = false
          localStorage.removeItem('twala-prerequisite-transactions')
        }
      }

      return updated
    })
  }, [mounted, isAuthPage, loading, hasCustodyAccounts, hasTransactions])

  // Executar verificação quando dados mudarem
  useEffect(() => {
    if (mounted && !isAuthPage && !loading) {
      // Delay menor já que agora verificamos loading
      const timer = setTimeout(checkPrerequisites, 50)
      return () => clearTimeout(timer)
    }
  }, [mounted, isAuthPage, loading, hasCustodyAccounts, hasTransactions, checkPrerequisites])

  // Reset hasCheckedRef quando dados mudam para permitir nova verificação
  useEffect(() => {
    if (!loading) {
      hasCheckedRef.current = false
    }
  }, [loading, hasCustodyAccounts, hasTransactions])

  // Função para fechar modal
  const closeModal = useCallback((type: PrerequisiteType) => {
    setPrerequisites(prev => 
      prev.map(p => p.type === type ? { ...p, isOpen: false } : p)
    )
  }, [])

  // Função para resetar estado (útil para testes)
  const resetPrerequisites = useCallback(() => {
    console.log('🔄 Resetting prerequisites state')
    setPrerequisites([
      { type: 'custody', isOpen: false, hasBeenShown: false },
      { type: 'transactions', isOpen: false, hasBeenShown: false }
    ])
    localStorage.removeItem('twala-prerequisite-custody')
    localStorage.removeItem('twala-prerequisite-transactions')
    hasCheckedRef.current = false
  }, [])

  // Função para limpar localStorage persistente (troubleshooting)
  const clearPrerequisiteStorage = useCallback(() => {
    console.log('🧹 Clearing prerequisite localStorage')
    localStorage.removeItem('twala-prerequisite-custody')
    localStorage.removeItem('twala-prerequisite-transactions')
    hasCheckedRef.current = false
    // Forçar nova verificação
    setTimeout(() => {
      if (!loading) checkPrerequisites()
    }, 100)
  }, [loading, checkPrerequisites])

  return {
    prerequisites,
    mounted,
    isAuthPage,
    closeModal,
    resetPrerequisites,
    clearPrerequisiteStorage,
    hasCustodyAccounts,
    hasTransactions
  }
} 
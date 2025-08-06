'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { CustodyAccount, Transaction, User } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface AppContextType {
  // Usuário
  user: User | null
  setUser: (user: User | null) => void
  
  // Contas de Custódia
  custodyAccounts: CustodyAccount[]
  addCustodyAccount: (account: Omit<CustodyAccount, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  removeCustodyAccount: (accountId: string) => Promise<void>
  updateCustodyAccount: (accountId: string, updates: Partial<CustodyAccount>) => Promise<void>
  
  // Transações
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  removeTransaction: (transactionId: string) => Promise<void>
  updateTransaction: (transactionId: string, updates: Partial<Transaction>) => Promise<void>
  
  // Estado de verificação
  hasCustodyAccounts: boolean
  hasTransactions: boolean
  
  // Estados de loading
  loading: boolean
  isLoading: (key: string) => boolean
  setLoading: (key: string, loading: boolean) => void
  
  // Persistência
  isOnline: boolean
  lastSyncTime: Date | null
  syncWithSupabase: () => Promise<void>
  clearLocalData: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [custodyAccounts, setCustodyAccounts] = useState<CustodyAccount[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  // Computed properties
  const hasCustodyAccounts = custodyAccounts.length > 0
  const hasTransactions = transactions.length > 0

  // Estados de loading
  const isLoadingState = (key: string) => loadingStates[key] || false
  const setLoadingState = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }))
  }

  // ===============================
  // SISTEMA DE PERSISTÊNCIA HÍBRIDA
  // ===============================

  // Detectar status online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Auto-sincronizar quando voltar online
      if (user) {
        syncWithSupabase().catch(console.error)
      }
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [user])

  // Funções de localStorage
  const saveToLocalStorage = () => {
    try {
      const data = {
        custodyAccounts,
        transactions,
        lastSyncTime: new Date().toISOString(),
        userId: user?.id
      }
      localStorage.setItem('twala-app-data', JSON.stringify(data))
      console.log('📱 Dados salvos no localStorage')
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error)
    }
  }

  const loadFromLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('twala-app-data')
      if (!stored || !user) return false

      const data = JSON.parse(stored)
      
      // Verificar se os dados são do usuário atual
      if (data.userId !== user.id) {
        console.log('📱 Dados do localStorage são de outro usuário, ignorando')
        return false
      }

      setCustodyAccounts(data.custodyAccounts || [])
      setTransactions(data.transactions || [])
      setLastSyncTime(data.lastSyncTime ? new Date(data.lastSyncTime) : null)
      
      console.log('📱 Dados carregados do localStorage')
      return true
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error)
      return false
    }
  }, [user])

  const clearLocalData = () => {
    localStorage.removeItem('twala-app-data')
    setCustodyAccounts([])
    setTransactions([])
    setLastSyncTime(null)
    console.log('📱 Dados locais limpos')
  }

  // Sincronização com Supabase
  const syncWithSupabase = useCallback(async () => {
    if (!user || !isOnline) {
      console.log('🔄 Sync cancelado: usuário não autenticado ou offline')
      return
    }

    try {
      console.log('🔄 Iniciando sincronização com Supabase...')
      
      // Carregar em paralelo para melhor performance
      await Promise.all([
        loadCustodyAccounts(),
        loadTransactions()
      ])
      
      // Salvar no localStorage após sync bem-sucedido
      saveToLocalStorage()
      setLastSyncTime(new Date())
      
      console.log('✅ Sincronização concluída')
    } catch (error) {
      console.error('❌ Erro na sincronização:', error)
      
      // Em caso de erro, tentar carregar do localStorage
      const loadedFromLocal = loadFromLocalStorage()
      if (loadedFromLocal) {
        console.log('📱 Fallback: dados carregados do localStorage')
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isOnline])



  // ===============================
  // FUNÇÕES CRUD COM SISTEMA HÍBRIDO
  // ===============================

  // Funções para contas de custódia
  const addCustodyAccount = async (account: Omit<CustodyAccount, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    try {
      // Se online, tentar Supabase primeiro
      if (isOnline) {
        const { data, error } = await supabase
          .from('custody_accounts')
          .insert([{
            user_id: user.id,
            name: account.name,
            institution: account.institution,
            account_number: account.accountNumber,
            is_active: account.isActive,
          }])
          .select()

        if (error) throw error

        if (data && data.length > 0) {
          const newAccount: CustodyAccount = {
            id: data[0].id,
            userId: data[0].user_id,
            brokerName: data[0].broker_name || data[0].institution,
            accountNickname: data[0].account_nickname || data[0].name,
            accountNumber: data[0].account_number,
            isActive: data[0].is_active,
            createdAt: new Date(data[0].created_at),
            updatedAt: new Date(data[0].updated_at),
            // Para compatibilidade
            name: data[0].name,
            institution: data[0].institution,
          }

          // Atualizar estado local
          setCustodyAccounts(prev => [newAccount, ...prev])
          
          // Salvar no localStorage
          saveToLocalStorage()
          
          console.log('✅ Conta de custódia criada online:', newAccount)
          return
        }
      }

      // Fallback offline ou erro no Supabase
      const tempId = `temp-${Date.now()}-${Math.random()}`
      const newAccount: CustodyAccount = {
        id: tempId,
        userId: user.id,
        brokerName: account.brokerName || '',
        accountNickname: account.accountNickname || '',
        accountNumber: account.accountNumber,
        isActive: account.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Para compatibilidade
        name: account.name,
        institution: account.institution,
      }

      setCustodyAccounts(prev => [newAccount, ...prev])
      saveToLocalStorage()

      console.log('📱 Conta de custódia criada offline (será sincronizada):', newAccount)
      
    } catch (error) {
      console.error('❌ Erro ao criar conta de custódia:', error)
      throw error
    }
  }

  const removeCustodyAccount = async (accountId: string) => {
    const { error } = await supabase
      .from('custody_accounts')
      .delete()
      .eq('id', accountId)

    if (error) {
      console.error('Erro ao deletar conta de custódia:', error)
      return
    }

    setCustodyAccounts(prev => prev.filter(account => account.id !== accountId))
  }

  const updateCustodyAccount = async (accountId: string, updates: Partial<CustodyAccount>) => {
    const { error } = await supabase
      .from('custody_accounts')
      .update({
        name: updates.name,
        institution: updates.institution,
        account_number: updates.accountNumber,
        is_active: updates.isActive,
      })
      .eq('id', accountId)

    if (error) {
      console.error('Erro ao atualizar conta de custódia:', error)
      return
    }

    setCustodyAccounts(prev => 
      prev.map(account => 
        account.id === accountId 
          ? { ...account, ...updates, updatedAt: new Date() }
          : account
      )
    )
  }

  // Funções para transações
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return

    console.log('AppContext: Iniciando addTransaction')
    console.log('AppContext: Dados da transação:', transaction)
    console.log('AppContext: Tipo da transação:', transaction.type)

    // Garantir que a data seja uma string no formato YYYY-MM-DD
    let dateString: string
    try {
      if (transaction.date instanceof Date) {
        dateString = transaction.date.toISOString().split('T')[0]
      } else if (typeof transaction.date === 'string') {
        // Se já é uma string, verificar se está no formato correto
        const dateStr = transaction.date as string
        if (dateStr.includes('T')) {
          dateString = dateStr.split('T')[0]
        } else {
          dateString = dateStr
        }
      } else {
        // Se for um timestamp ou outro formato, tentar converter
        const date = new Date(transaction.date as any)
        if (isNaN(date.getTime())) {
          throw new Error('Data inválida')
        }
        dateString = date.toISOString().split('T')[0]
      }
    } catch (error) {
      console.error('Erro ao processar data:', error, 'Data recebida:', transaction.date)
      throw new Error('Data inválida fornecida')
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: user.id,
        custody_account_id: transaction.custodyAccountId,
        asset_id: transaction.assetId,
        type: transaction.type,
        quantity: transaction.quantity,
        price: transaction.price,
        date: dateString,
        total: transaction.total,
        broker: transaction.broker,
        fees: transaction.fees || 0,
        notes: transaction.notes,
      }])
      .select()

    if (error) {
      console.error('AppContext: Erro ao criar transação:', error)
      throw error
    }

    console.log('AppContext: Transação criada no Supabase:', data)

    if (data) {
      // Recarregar todas as transações para garantir consistência
      console.log('AppContext: Recarregando transações...')
      await loadTransactions()
      console.log('AppContext: Transações recarregadas')
    }
  }

  const removeTransaction = async (transactionId: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)

    if (error) {
      console.error('Erro ao deletar transação:', error)
      return
    }

    setTransactions(prev => prev.filter(transaction => transaction.id !== transactionId))
  }

  const updateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
    const { error } = await supabase
      .from('transactions')
      .update({
        custody_account_id: updates.custodyAccountId,
        asset_id: updates.assetId,
        type: updates.type,
        quantity: updates.quantity,
        price: updates.price,
        date: updates.date ? (updates.date instanceof Date ? updates.date.toISOString().split('T')[0] : updates.date as string) : undefined,
        total: updates.total,
        broker: updates.broker,
        fees: updates.fees,
        notes: updates.notes,
      })
      .eq('id', transactionId)

    if (error) {
      console.error('Erro ao atualizar transação:', error)
      return
    }

    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, ...updates, updatedAt: new Date() }
          : transaction
      )
    )
  }

  // Carregar dados do Supabase
  const loadCustodyAccounts = async () => {
    if (!user) return

    console.log('🏦 AppContext: Carregando contas de custódia para usuário:', user.id)

    const { data, error } = await supabase
      .from('custody_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ AppContext: Erro ao carregar contas de custódia:', error)
      return
    }

    console.log('🏦 AppContext: Contas de custódia carregadas do Supabase:', data)

    const accounts: CustodyAccount[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      brokerName: item.broker_name || item.institution,
      accountNickname: item.account_nickname || item.name,
      accountNumber: item.account_number,
      isActive: item.is_active,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      // Para compatibilidade
      name: item.name,
      institution: item.institution,
    }))

    console.log('🏦 AppContext: Contas processadas:', accounts)
    console.log('🏦 AppContext: Contagem de contas ativas:', accounts.filter(a => a.isActive).length)

    setCustodyAccounts(accounts)
  }

  const loadTransactions = async () => {
    if (!user) return

    console.log('AppContext: Carregando transações para usuário:', user.id)

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('AppContext: Erro ao carregar transações:', error)
      return
    }

    console.log('AppContext: Transações carregadas do Supabase:', data)

    const transactions: Transaction[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      custodyAccountId: item.custody_account_id,
      assetId: item.asset_id,
      type: item.type,
      quantity: item.quantity,
      unitPrice: item.unit_price || item.price,
      operationDate: new Date(item.operation_date || item.date),
      totalOperationValue: item.total_operation_value || item.total,
      fees: item.fees,
      broker: item.broker,
      notes: item.notes,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      // Para compatibilidade
      price: item.price,
      date: new Date(item.date),
      total: item.total,
    }))

    console.log('AppContext: Transações processadas:', transactions)
    console.log('AppContext: Contagem de transações por tipo:', {
      BUY: transactions.filter(t => t.type === 'BUY').length,
      SELL: transactions.filter(t => t.type === 'SELL').length,
      DIVIDEND: transactions.filter(t => t.type === 'DIVIDEND').length,
      INTEREST: transactions.filter(t => t.type === 'INTEREST').length,
    })

    setTransactions(transactions)
  }

  // Carregar dados quando usuário mudar (Sistema Híbrido)
  useEffect(() => {
    if (user) {
      setLoading(true)
      
      // Tentar carregar do localStorage primeiro (mais rápido)
      const loadedFromLocal = loadFromLocalStorage()
      
      if (loadedFromLocal && !isOnline) {
        // Se offline e dados locais existem, usar apenas local
        setLoading(false)
        console.log('📱 Carregado do localStorage (modo offline)')
      } else {
        // Se online ou sem dados locais, sincronizar com Supabase
        syncWithSupabase().finally(() => {
          setLoading(false)
        })
      }
    } else {
      // Limpar dados quando o usuário sair
      clearLocalData()
      setLoading(false)
    }
  }, [user, isOnline, loadFromLocalStorage, syncWithSupabase])

  const value: AppContextType = {
    user: user ? {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || '',
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at || user.created_at),
    } : null,
    setUser: () => {}, // Não usado mais, user vem do AuthContext
    custodyAccounts,
    addCustodyAccount,
    removeCustodyAccount,
    updateCustodyAccount,
    transactions,
    addTransaction,
    removeTransaction,
    updateTransaction,
    hasCustodyAccounts,
    hasTransactions,
    // Estados de loading
    loading,
    isLoading: isLoadingState,
    setLoading: setLoadingState,
    // Sistema de persistência híbrida
    isOnline,
    lastSyncTime,
    syncWithSupabase,
    clearLocalData,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp deve ser usado dentro de um AppProvider')
  }
  return context
} 
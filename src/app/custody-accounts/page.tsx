'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { custodyAccountSchema, type CustodyAccountFormData } from '@/lib/schemas'
import { useApp } from '@/contexts/AppContext'
import { Header } from '@/components/ui/Header'

export default function CustodyAccountsPage() {
  const { custodyAccounts, addCustodyAccount, removeCustodyAccount } = useApp()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<CustodyAccountFormData>({
    resolver: zodResolver(custodyAccountSchema),
    mode: 'onSubmit',
  })

  // Debug: mostrar valores dos campos
  const watchedValues = watch()
  console.log('=== CUSTODY ACCOUNT WATCH DEBUG ===')
  console.log('Valores dos campos:', watchedValues)
  console.log('Tipo dos valores:', typeof watchedValues)
  console.log('Keys dos valores:', Object.keys(watchedValues))
  console.log('Erros do formulário:', errors)
  console.log('Tipo dos erros:', typeof errors)
  console.log('Keys dos erros:', Object.keys(errors))

  const onSubmit = async (data: CustodyAccountFormData) => {
    console.log('=== SUBMIT CUSTODY ACCOUNT ===')
    console.log('Dados do formulário:', data)
    console.log('Tipo dos dados:', typeof data)
    console.log('Keys dos dados:', Object.keys(data))
    console.log('Valores individuais:')
    console.log('- name:', data.name, 'tipo:', typeof data.name)
    console.log('- institution:', data.institution, 'tipo:', typeof data.institution)
    console.log('- accountNumber:', data.accountNumber, 'tipo:', typeof data.accountNumber)
    
    setIsLoading(true)
    try {
      await addCustodyAccount({
        name: data.name,
        institution: data.institution,
        accountNumber: data.accountNumber,
        isActive: true,
      })
      console.log('Conta criada com sucesso!')
      reset()
      // TODO: Mostrar toast de sucesso
    } catch (error) {
      console.error('Erro ao criar conta:', error)
      // TODO: Mostrar toast de erro
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (accountId: string) => {
    removeCustodyAccount(accountId)
    // TODO: Chamar API para deletar
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <Header />
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Contas de Custódia
          </h1>
          <p className="text-gray-600">
            Gerencie suas contas de custódia para organizar seus investimentos por instituição.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Formulário */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Nova Conta de Custódia
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Conta
                </label>
                <input
                  type="text"
                  placeholder="Ex: Conta Principal"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  style={{ color: 'black', backgroundColor: 'white' }}
                  {...register('name')}
                />
                {errors.name?.message && (
                  <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
                )}
              </div>
              
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instituição
                </label>
                <input
                  type="text"
                  placeholder="Ex: Banco de Investimento"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  style={{ color: 'black', backgroundColor: 'white' }}
                  {...register('institution')}
                />
                {errors.institution?.message && (
                  <p className="mt-1 text-sm text-error-600">{errors.institution.message}</p>
                )}
              </div>
              
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número da Conta
                </label>
                <input
                  type="text"
                  placeholder="Ex: 12345678-9"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  style={{ color: 'black', backgroundColor: 'white' }}
                  {...register('accountNumber')}
                />
                {errors.accountNumber?.message && (
                  <p className="mt-1 text-sm text-error-600">{errors.accountNumber.message}</p>
                )}
              </div>
              
              <Button
                type="submit"
                loading={isLoading}
                className="w-full"
              >
                Cadastrar Conta
              </Button>
            </form>
          </Card>

          {/* Lista de Contas */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Contas Cadastradas ({custodyAccounts.length})
            </h2>
            
            {custodyAccounts.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-gray-500">
                    Nenhuma conta cadastrada ainda.
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Cadastre sua primeira conta de custódia para começar.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {custodyAccounts.map((account) => (
                  <Card key={account.id} padding="sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {account.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {account.institution}
                        </p>
                        <p className="text-xs text-gray-500">
                          Conta: {account.accountNumber}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                          Ativa
                        </span>
                        <Button
                          variant="error"
                          size="sm"
                          onClick={() => handleDelete(account.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
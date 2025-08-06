'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { SearchSelect } from '@/components/ui/SearchSelect'
import { useToast } from '@/components/ui/Toast'
import { transactionSchema, type TransactionFormData } from '@/lib/schemas'
import { getAssets } from '@/lib/assets'
import { useApp } from '@/contexts/AppContext'
import { Header } from '@/components/ui/Header'
import type { Asset } from '@/types'

export default function InterestTransactionPage() {
  const { custodyAccounts, addTransaction } = useApp()
  const { showToast, ToastContainer } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [assets, setAssets] = useState<Asset[]>([])

  // Carregar ativos na inicialização
  useEffect(() => {
    const loadAssets = async () => {
      const assetsData = await getAssets()
      setAssets(assetsData)
    }
    loadAssets()
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'INTEREST',
      date: new Date(),
      quantity: 0,
      price: 0,
    },
  })

  const watchedQuantity = watch('quantity', 0)
  const watchedPrice = watch('price', 0)

  // Para juros, o total é quantity * price (valor por ação * número de ações)
  const total = watchedQuantity * watchedPrice

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true)
    try {
      console.log('Dados do formulário de juros:', data)
      console.log('Total calculado:', total)
      
      const selectedAsset = assets.find(asset => asset.id === data.assetId)
      if (!selectedAsset) {
        throw new Error('Ativo não encontrado')
      }

      const transactionData = {
        custodyAccountId: data.custodyAccountId,
        assetId: data.assetId,
        type: 'INTEREST' as const,
        quantity: data.quantity,
        price: data.price,
        date: data.date,
        total: total,
        fees: 0, // Juros não têm taxas
        notes: data.notes,
      }
      
      console.log('Dados da transação a serem enviados:', transactionData)

      await addTransaction(transactionData)
      
      console.log('Juros registrados com sucesso!')
      showToast('success', 'Juros registrados com sucesso!')
      reset()
      
      // Redirecionar após um breve delay
      setTimeout(() => {
        router.push('/portfolio')
      }, 1500)
    } catch (error) {
      console.error('Erro ao registrar juros:', error)
      showToast('error', 'Erro ao registrar juros. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Registrar Juros
              </h1>
              <p className="text-gray-600">
                Registre o recebimento de juros sobre capital próprio (JCP) de um ativo.
              </p>
            </div>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Select
              label="Conta de Custódia"
              placeholder="Selecione uma conta"
              options={custodyAccounts.map(account => ({
                value: account.id,
                label: `${account.name} - ${account.institution}`,
              }))}
              error={errors.custodyAccountId?.message}
              {...register('custodyAccountId')}
            />

            <SearchSelect
              label="Ativo"
              placeholder="Digite o ticker ou nome do ativo"
              options={assets.map(asset => ({
                value: asset.id,
                label: `${asset.ticker} - ${asset.name}`,
              }))}
              value={watch('assetId')}
              onChange={(value) => setValue('assetId', value)}
              error={errors.assetId?.message}
            />

            <Input
              label="Data dos Juros"
              type="date"
              error={errors.date?.message}
              {...register('date')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantidade de Ações"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.quantity?.message}
                {...register('quantity', { valueAsNumber: true })}
              />

              <Input
                label="Juros por Ação"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.price?.message}
                {...register('price', { valueAsNumber: true })}
              />
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-900">Total dos Juros:</span>
                <span className="text-lg font-bold text-green-900">
                  {formatCurrency(total)}
                </span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Calculado automaticamente: {watchedQuantity} ações × {formatCurrency(watchedPrice)} por ação
              </p>
            </div>

            <Input
              label="Notas (opcional)"
              placeholder="Observações sobre os juros"
              error={errors.notes?.message}
              {...register('notes')}
            />

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Registrando...' : 'Registrar Juros'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
      <ToastContainer />
    </div>
  )
} 
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
import { getAssets, searchAssets } from '@/lib/assets'
import { useApp } from '@/contexts/AppContext'
import { Header } from '@/components/ui/Header'
import type { Asset } from '@/types'

export default function SellTransactionPage() {
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
      type: 'SELL',
      date: new Date(),
    },
  })

  const watchedQuantity = watch('quantity', 0)
  const watchedPrice = watch('price', 0)
  const watchedFees = watch('fees', 0)

  // Calcular total seguindo a constraint do banco: total = (quantity * price) + fees
  const total = (watchedQuantity * watchedPrice) + (watchedFees || 0)

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true)
    try {
      console.log('Dados do formulário de venda:', data)
      console.log('Total calculado:', total)
      
      const selectedAsset = assets.find(asset => asset.id === data.assetId)
      if (!selectedAsset) {
        throw new Error('Ativo não encontrado')
      }

      const transactionData = {
        custodyAccountId: data.custodyAccountId,
        assetId: data.assetId,
        type: 'SELL' as const,
        quantity: data.quantity,
        price: data.price,
        date: data.date,
        total: total, // Valor total incluindo taxas (seguindo constraint do banco)
        fees: data.fees || 0,
        notes: data.notes,
      }
      
      console.log('Dados da transação a serem enviados:', transactionData)

      await addTransaction(transactionData)
      
      console.log('Transação de venda registrada com sucesso!')
      showToast('success', 'Venda registrada com sucesso!')
      reset()
      
      // Redirecionar após um breve delay
      setTimeout(() => {
        router.push('/portfolio')
      }, 1500)
    } catch (error) {
      console.error('Erro ao registrar venda:', error)
      showToast('error', 'Erro ao registrar venda. Tente novamente.')
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
                Registrar Venda
              </h1>
              <p className="text-gray-600">
                Registre a venda de um ativo de sua carteira.
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
              label="Data da Venda"
              type="date"
              error={errors.date?.message}
              {...register('date')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantidade"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.quantity?.message}
                {...register('quantity', { valueAsNumber: true })}
              />

              <Input
                label="Preço por Ação"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.price?.message}
                {...register('price', { valueAsNumber: true })}
              />
            </div>

            <Input
              label="Taxas (opcional)"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.fees?.message}
              {...register('fees', { valueAsNumber: true })}
            />

            <Input
              label="Notas (opcional)"
              placeholder="Observações sobre a venda"
              error={errors.notes?.message}
              {...register('notes')}
            />

            {/* Resumo da Transação */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Resumo da Venda
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantidade × Preço:</span>
                  <span className="font-medium">
                    {watchedQuantity} × {formatCurrency(watchedPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(watchedQuantity * watchedPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxas:</span>
                  <span className="font-medium">
                    -{formatCurrency(watchedFees || 0)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between text-base font-semibold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-error-600">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

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
                loading={isLoading}
                className="flex-1"
              >
                Registrar Venda
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { sellTransactionSchema, type SellTransactionFormData } from '@/lib/schemas'
import { getAvailableAssetsForSale, validateSellQuantity } from '@/lib/portfolio'
import { useApp } from '@/contexts/AppContext'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/ui/Header'
import type { Asset } from '@/types'

export default function SellPage() {
  const { custodyAccounts, addTransaction } = useApp()
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [availableQuantity, setAvailableQuantity] = useState(0)
  const [quantityError, setQuantityError] = useState<string | null>(null)

  // Carregar ativos disponíveis para venda
  useEffect(() => {
    const loadAssets = async () => {
      if (user) {
        const assets = await getAvailableAssetsForSale(user.id)
        setAvailableAssets(assets)
      }
    }
    loadAssets()
  }, [user])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<SellTransactionFormData>({
    resolver: zodResolver(sellTransactionSchema),
    defaultValues: {
      date: new Date(),
    },
  })

  const watchedQuantity = watch('quantity')
  const watchedPrice = watch('price')

  const handleAssetSelect = async (assetId: string) => {
    if (!user) return

    const asset = availableAssets.find(a => a.id === assetId)
    setSelectedAsset(asset || null)
    setValue('assetId', assetId)

    // Validar quantidade disponível
    if (watchedQuantity) {
      const validation = await validateSellQuantity(user.id, assetId, watchedQuantity)
      setAvailableQuantity(validation.availableQuantity)
      if (!validation.valid) {
        setQuantityError(validation.message || 'Quantidade inválida')
      } else {
        setQuantityError(null)
      }
    }
  }

  const handleQuantityChange = async (quantity: number) => {
    if (!user || !selectedAsset) return

    const validation = await validateSellQuantity(user.id, selectedAsset.id, quantity)
    setAvailableQuantity(validation.availableQuantity)
    
    if (!validation.valid) {
      setQuantityError(validation.message || 'Quantidade inválida')
      setError('quantity', { message: validation.message })
    } else {
      setQuantityError(null)
    }
  }

  const onSubmit = async (data: SellTransactionFormData) => {
    if (!user) return

    setIsLoading(true)
    try {
      // Validar quantidade antes de salvar
      const validation = await validateSellQuantity(user.id, data.assetId, data.quantity)
      if (!validation.valid) {
        setError('quantity', { message: validation.message })
        return
      }

      await addTransaction({
        custodyAccountId: data.custodyAccountId,
        assetId: data.assetId,
        type: 'SELL',
        quantity: data.quantity,
        price: data.price,
        date: data.date,
        total: data.quantity * data.price,
        broker: data.broker,
        fees: data.fees || 0,
        notes: data.notes,
      })

      reset()
      setSelectedAsset(null)
      setAvailableQuantity(0)
      setQuantityError(null)
      
      // Redirecionar para a página de transações
      router.push('/transactions')
    } catch (error) {
      console.error('Erro ao registrar venda:', error)
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registrar Venda
          </h1>
          <p className="text-gray-600">
            Registre uma nova venda de ativo da sua carteira.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Dados da Venda
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              <Select
                label="Ativo para Venda"
                placeholder="Selecione um ativo da sua carteira"
                options={availableAssets.map(asset => ({
                  value: asset.id,
                  label: `${asset.ticker} - ${asset.name}`,
                }))}
                error={errors.assetId?.message}
                onChange={(e) => handleAssetSelect(e.target.value)}
              />

              <Input
                label="Data da Operação"
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
                  error={errors.quantity?.message || quantityError || undefined}
                  {...register('quantity', { 
                    valueAsNumber: true,
                    onChange: (e) => handleQuantityChange(Number(e.target.value))
                  })}
                />

                <Input
                  label="Preço Unitário"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  error={errors.price?.message}
                  {...register('price', { valueAsNumber: true })}
                />
              </div>

              <Input
                label="Corretora (opcional)"
                placeholder="Nome da corretora"
                error={errors.broker?.message}
                {...register('broker')}
              />

              <Input
                label="Taxas (opcional)"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.fees?.message}
                {...register('fees', { valueAsNumber: true })}
              />

              <Input
                label="Observações (opcional)"
                placeholder="Observações sobre a operação"
                error={errors.notes?.message}
                {...register('notes')}
              />

              <Button
                type="submit"
                loading={isLoading}
                className="w-full"
                disabled={!!quantityError}
              >
                Registrar Venda
              </Button>
            </form>
          </Card>

          {/* Resumo da Operação */}
          <div>
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Resumo da Operação
              </h2>
              
              {selectedAsset && (
                <div className="mb-6 p-4 bg-error-50 rounded-lg">
                  <h3 className="font-semibold text-error-900 mb-2">
                    {selectedAsset.ticker} - {selectedAsset.name}
                  </h3>
                  <p className="text-sm text-error-700">
                    Setor: {selectedAsset.sector}
                  </p>
                  <p className="text-sm text-error-700">
                    Preço Atual: {formatCurrency(selectedAsset.currentPrice)}
                  </p>
                  <p className="text-sm text-error-700 font-medium">
                    Quantidade Disponível: {availableQuantity}
                  </p>
                </div>
              )}

              {watchedQuantity && watchedPrice && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantidade:</span>
                    <span className="font-medium">{watchedQuantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preço Unitário:</span>
                    <span className="font-medium">{formatCurrency(watchedPrice)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-900 font-semibold">Total da Operação:</span>
                    <span className="text-gray-900 font-semibold">
                      {formatCurrency(watchedQuantity * watchedPrice)}
                    </span>
                  </div>
                </div>
              )}

              {!selectedAsset && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">
                    Selecione um ativo da sua carteira para ver o resumo
                  </p>
                </div>
              )}

              {availableAssets.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-2">
                    Nenhum ativo disponível para venda
                  </p>
                  <p className="text-sm text-gray-400">
                    Registre algumas compras primeiro
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { buyTransactionSchema, type BuyTransactionFormData } from '@/lib/schemas'
import { getAssets, searchAssets } from '@/lib/assets'
import { useApp } from '@/contexts/AppContext'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/ui/Header'
import type { Asset } from '@/types'

export default function BuyPage() {
  const { custodyAccounts, addTransaction } = useApp()
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  // Carregar ativos na inicialização
  useEffect(() => {
    const loadAssets = async () => {
      const assetsData = await getAssets()
      setAssets(assetsData)
      setFilteredAssets(assetsData)
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
  } = useForm<BuyTransactionFormData>({
    resolver: zodResolver(buyTransactionSchema),
    defaultValues: {
      date: new Date(),
    },
  })

  const watchedQuantity = watch('quantity')
  const watchedPrice = watch('price')

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = await searchAssets(query)
      setFilteredAssets(results)
    } else {
      setFilteredAssets(assets)
    }
  }

  const handleAssetSelect = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId)
    setSelectedAsset(asset || null)
    setValue('assetId', assetId)
  }

  const onSubmit = async (data: BuyTransactionFormData) => {
    if (!user) return

    setIsLoading(true)
    try {
      const selectedAsset = assets.find(asset => asset.id === data.assetId)
      if (!selectedAsset) {
        throw new Error('Ativo não encontrado')
      }

      await addTransaction({
        custodyAccountId: data.custodyAccountId,
        assetId: data.assetId,
        type: 'BUY',
        quantity: data.quantity,
        unitPrice: data.price,
        operationDate: data.date,
        totalOperationValue: data.quantity * data.price,
        fees: data.fees || 0,
        broker: data.broker,
        notes: data.notes,
      })

      reset()
      setSearchQuery('')
      setFilteredAssets(assets)
      setSelectedAsset(null)
      
      // Redirecionar para a página de transações
      router.push('/transactions')
    } catch (error) {
      console.error('Erro ao registrar compra:', error)
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
            Registrar Compra
          </h1>
          <p className="text-gray-600">
            Registre uma nova compra de ativo na sua carteira.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Dados da Compra
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar Ativo
                </label>
                <Input
                  placeholder="Digite o ticker ou nome do ativo"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <Select
                label="Ativo"
                placeholder="Selecione um ativo"
                options={filteredAssets.map(asset => ({
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
                  error={errors.quantity?.message}
                  {...register('quantity', { valueAsNumber: true })}
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
              >
                Registrar Compra
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
                <div className="mb-6 p-4 bg-primary-50 rounded-lg">
                  <h3 className="font-semibold text-primary-900 mb-2">
                    {selectedAsset.ticker} - {selectedAsset.name}
                  </h3>
                  <p className="text-sm text-primary-700">
                    Setor: {selectedAsset.sector}
                  </p>
                  <p className="text-sm text-primary-700">
                    Preço Atual: {formatCurrency(selectedAsset.currentPrice)}
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

              {!selectedAsset && !watchedQuantity && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">
                    Preencha os dados da operação para ver o resumo
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
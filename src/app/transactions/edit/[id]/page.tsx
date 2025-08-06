'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2, ArrowLeft } from 'lucide-react'
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
import type { Asset, Transaction } from '@/types'

export default function EditTransactionPage() {
  const { custodyAccounts, transactions, updateTransaction, removeTransaction } = useApp()
  const { showToast, ToastContainer } = useToast()
  const router = useRouter()
  const params = useParams()
  const transactionId = params.id as string
  
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [assets, setAssets] = useState<Asset[]>([])
  const [transaction, setTransaction] = useState<Transaction | null>(null)

  // Carregar ativos e transação na inicialização
  useEffect(() => {
    const loadData = async () => {
      const assetsData = await getAssets()
      setAssets(assetsData)
      
      const foundTransaction = transactions.find(t => t.id === transactionId)
      if (foundTransaction) {
        setTransaction(foundTransaction)
      } else {
        showToast('error', 'Transação não encontrada')
        router.push('/transactions')
      }
    }
    loadData()
  }, [transactionId, transactions, router, showToast])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  })

  // Preencher formulário quando transação carregada
  useEffect(() => {
    if (transaction) {
      reset({
        custodyAccountId: transaction.custodyAccountId,
        assetId: transaction.assetId,
        type: transaction.type as 'BUY' | 'SELL' | 'DIVIDEND' | 'INTEREST',
        quantity: transaction.quantity,
        price: transaction.price,
        date: transaction.operationDate instanceof Date 
          ? transaction.operationDate.toISOString().split('T')[0] as any
          : transaction.date instanceof Date 
          ? transaction.date.toISOString().split('T')[0] as any
          : new Date(transaction.operationDate || transaction.date || Date.now()).toISOString().split('T')[0] as any,
        fees: transaction.fees || 0,
        notes: transaction.notes || ''
      })
    }
  }, [transaction, reset])

  const watchedQuantity = watch('quantity', 0)
  const watchedPrice = watch('price', 0)
  const watchedFees = watch('fees', 0)

  // Calcular total automaticamente
  const total = (watchedQuantity * watchedPrice) + (watchedFees || 0)

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'BUY': return 'Compra'
      case 'SELL': return 'Venda'
      case 'DIVIDEND': return 'Dividendo'
      case 'INTEREST': return 'Juros'
      default: return type
    }
  }

  const onSubmit = async (data: TransactionFormData) => {
    if (!transaction) return

    setIsLoading(true)
    try {
      await updateTransaction(transaction.id, {
        custodyAccountId: data.custodyAccountId,
        assetId: data.assetId,
        type: data.type,
        quantity: data.quantity,
        price: data.price,
        date: new Date(data.date),
        total,
        fees: data.fees || 0,
        notes: data.notes,
      })
      
      showToast('success', 'Transação atualizada com sucesso!')
      router.push('/transactions')
    } catch (error) {
      console.error('Erro ao atualizar transação:', error)
      showToast('error', 'Erro ao atualizar transação. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!transaction) return
    
    if (!confirm('Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.')) {
      return
    }

    setIsDeleting(true)
    try {
      await removeTransaction(transaction.id)
      showToast('success', 'Transação excluída com sucesso!')
      router.push('/transactions')
    } catch (error) {
      console.error('Erro ao excluir transação:', error)
      showToast('error', 'Erro ao excluir transação. Tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando transação...</p>
        </div>
      </div>
    )
  }

  const selectedAsset = assets.find(a => a.id === transaction.assetId)

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <Header />
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <ToastContainer />
        
        {/* Header com navegação */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="secondary"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </div>
          
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Editar {getTransactionTypeLabel(transaction.type)}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {selectedAsset?.ticker} - {selectedAsset?.name}
            </p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <Select
              label="Conta de Custódia"
              placeholder="Selecione uma conta"
              options={custodyAccounts.map(account => ({
                value: account.id,
                label: `${account.name || account.accountNickname} - ${account.institution || account.brokerName}`,
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

            <Select
              label="Tipo de Transação"
              placeholder="Selecione o tipo"
              options={[
                { value: 'BUY', label: 'Compra' },
                { value: 'SELL', label: 'Venda' },
                { value: 'DIVIDEND', label: 'Dividendo' },
                { value: 'INTEREST', label: 'Juros' },
              ]}
              error={errors.type?.message}
              {...register('type')}
            />

            <Input
              label="Data da Transação"
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
                label={transaction.type === 'DIVIDEND' ? 'Valor por Ação' : 'Preço por Ação'}
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
              placeholder="Informações adicionais sobre a transação"
              error={errors.notes?.message}
              {...register('notes')}
            />

            {/* Resumo do total */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total da Transação:</span>
                <span className="text-lg font-bold text-gray-900">
                  {new Intl.NumberFormat('pt-AO', {
                    style: 'currency',
                    currency: 'AOA',
                  }).format(total)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                loading={isLoading}
                className="flex-1 order-2 sm:order-1"
              >
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={handleDelete}
                loading={isDeleting}
                className="flex items-center justify-center gap-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 order-1 sm:order-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
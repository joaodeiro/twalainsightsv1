'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { getAssets } from '@/lib/assets'
import type { Transaction, Asset } from '@/types'

interface AssetOverviewProps {
  transactions: Transaction[]
}

interface AssetPosition {
  assetId: string
  assetName: string
  assetTicker: string
  totalQuantity: number
  totalInvested: number
  lastPrice: number
  currentValue: number
  returnValue: number
  returnPercent: number
  transactions: Transaction[]
}

export function AssetOverview({ transactions }: AssetOverviewProps) {
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>([])
  const [assetPositions, setAssetPositions] = useState<AssetPosition[]>([])

  // Carregar ativos
  useEffect(() => {
    const loadAssets = async () => {
      const assetsData = await getAssets()
      setAssets(assetsData)
    }
    loadAssets()
  }, [])

  // Calcular ativos únicos e suas posições
  useEffect(() => {
    if (assets.length === 0) return

    const positions = transactions.reduce((acc, transaction) => {
      const asset = assets.find(a => a.id === transaction.assetId)
      if (!asset) return acc

      const assetId = transaction.assetId
      if (!acc[assetId]) {
        acc[assetId] = {
          assetId,
          assetName: asset.name,
          assetTicker: asset.ticker,
          totalQuantity: 0,
          totalInvested: 0,
          lastPrice: asset.currentPrice,
          currentValue: 0,
          returnValue: 0,
          returnPercent: 0,
          transactions: []
        }
      }
      
      if (transaction.type === 'BUY') {
        acc[assetId].totalQuantity += transaction.quantity
        acc[assetId].totalInvested += transaction.total
      } else if (transaction.type === 'SELL') {
        // Para vendas, calcular o valor investido proporcional
        const currentAveragePrice = acc[assetId].totalQuantity > 0 
          ? acc[assetId].totalInvested / acc[assetId].totalQuantity 
          : 0
        
        const soldInvestedValue = currentAveragePrice * transaction.quantity
        const soldRevenue = transaction.total // Receita da venda (após taxas)
        
        acc[assetId].totalQuantity -= transaction.quantity
        acc[assetId].totalInvested -= soldInvestedValue
        
        // Adicionar lucro/prejuízo da venda ao retorno
        const saleProfit = soldRevenue - soldInvestedValue
        acc[assetId].returnValue += saleProfit
      }
      
      acc[assetId].transactions.push(transaction)
      
      return acc
    }, {} as Record<string, AssetPosition>)

    // Calcular valores atuais e retornos
    Object.values(positions).forEach(position => {
      if (position.totalQuantity > 0) {
        position.currentValue = position.totalQuantity * position.lastPrice
        position.returnValue += position.currentValue - position.totalInvested
        position.returnPercent = position.totalInvested > 0 ? (position.returnValue / position.totalInvested) * 100 : 0
      }
    })

    const activeAssets = Object.values(positions).filter((asset: any) => asset.totalQuantity > 0)
    setAssetPositions(activeAssets)
  }, [transactions, assets])

  const topAssets = assetPositions.slice(0, 3) // Top 3 ativos

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  if (assetPositions.length === 0) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Principais Ativos
          </h2>
          <Button 
            size="sm"
            onClick={() => router.push('/portfolio')}
          >
            Ver Carteira
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-2">
            Nenhum ativo na carteira
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Comece registrando suas primeiras transações
          </p>
          <Button 
            onClick={() => router.push('/portfolio')}
            className="btn-primary"
          >
            Ir para Carteira
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Principais Ativos ({assetPositions.length})
        </h2>
        <Button 
          size="sm"
          variant="secondary"
          onClick={() => router.push('/portfolio')}
        >
          Ver Todos
        </Button>
      </div>
      
      <div className="space-y-4">
        {topAssets.map((asset: any, index) => {
          return (
            <div 
              key={asset.assetId}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => router.push('/portfolio')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-600">
                    {asset.assetTicker}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {asset.assetTicker}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {asset.assetName}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {formatCurrency(asset.currentValue)}
                </p>
                <p className="text-sm text-gray-600">
                  {asset.totalQuantity.toFixed(2)} ações
                </p>
                <p className={`text-sm ${asset.returnPercent >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                  {formatPercent(asset.returnPercent)}
                </p>
              </div>
            </div>
          )
        })}
        
        {assetPositions.length > 3 && (
          <div className="text-center pt-2">
            <Button 
              variant="secondary"
              size="sm"
              onClick={() => router.push('/portfolio')}
            >
              Ver mais {assetPositions.length - 3} ativo{assetPositions.length - 3 > 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
} 
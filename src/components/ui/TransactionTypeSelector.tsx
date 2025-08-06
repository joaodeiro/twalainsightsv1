'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { Plus, Minus, DollarSign, TrendingUp, X } from 'lucide-react'

export type TransactionType = 'BUY' | 'SELL' | 'DIVIDEND' | 'INTEREST'

interface TransactionTypeOption {
  type: TransactionType
  label: string
  description: string
  icon: React.ReactNode
  color: string
}

interface TransactionTypeSelectorProps {
  onSelect: (type: TransactionType) => void
  onClose: () => void
}

const transactionTypes: TransactionTypeOption[] = [
  {
    type: 'BUY',
    label: 'Compra de Ativo',
    description: 'Registrar compra de ações ou outros ativos',
    icon: <Plus className="w-8 h-8" />,
    color: 'bg-success-50 border-success-200 text-success-700 hover:bg-success-100'
  },
  {
    type: 'SELL',
    label: 'Venda de Ativo',
    description: 'Registrar venda de ações ou outros ativos',
    icon: <Minus className="w-8 h-8" />,
    color: 'bg-error-50 border-error-200 text-error-700 hover:bg-error-100'
  },
  {
    type: 'DIVIDEND',
    label: 'Dividendos',
    description: 'Registrar recebimento de dividendos',
    icon: <DollarSign className="w-8 h-8" />,
    color: 'bg-warning-50 border-warning-200 text-warning-700 hover:bg-warning-100'
  },
  {
    type: 'INTEREST',
    label: 'Juros',
    description: 'Registrar recebimento de juros',
    icon: <TrendingUp className="w-8 h-8" />,
    color: 'bg-info-50 border-info-200 text-info-700 hover:bg-info-100'
  }
]

export function TransactionTypeSelector({ onSelect, onClose }: TransactionTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<TransactionType | null>(null)

  const handleSelect = (type: TransactionType) => {
    setSelectedType(type)
    // Pequeno delay para feedback visual
    setTimeout(() => {
      onSelect(type)
    }, 150)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Tipo de Transação
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Selecione o tipo de operação que deseja registrar
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {transactionTypes.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleSelect(option.type)}
                  className={clsx(
                    'relative group p-6 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-200',
                    option.color,
                    selectedType === option.type && 'ring-4 ring-primary-300 scale-105'
                  )}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={clsx(
                      'p-3 rounded-full transition-colors',
                      selectedType === option.type ? 'bg-white bg-opacity-90' : 'bg-white bg-opacity-50'
                    )}>
                      {option.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">
                        {option.label}
                      </h4>
                      <p className="text-sm opacity-80 mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
            
            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
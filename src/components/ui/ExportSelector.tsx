'use client'

import { useState } from 'react'
import { Download, FileText, Table, X } from 'lucide-react'
import { Modal } from './Modal'
import { Drawer } from './Drawer'
import { Button } from './Button'
import { useIsMobile } from '@/hooks/useIsMobile'

export type ExportType = 'CSV' | 'PDF'

interface ExportSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: ExportType) => void
  title?: string
  description?: string
}

export function ExportSelector({ 
  isOpen, 
  onClose, 
  onSelect,
  title = "Selecione o formato",
  description = "Escolha como deseja exportar os dados:"
}: ExportSelectorProps) {
  const isMobile = useIsMobile()
  const [isExporting, setIsExporting] = useState(false)

  const handleSelect = async (type: ExportType) => {
    setIsExporting(true)
    try {
      await onSelect(type)
      onClose()
    } catch (error) {
      console.error('Erro ao exportar:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportOptions = [
    {
      type: 'CSV' as const,
      icon: Table,
      title: 'Exportar CSV',
      description: 'Arquivo de planilha para Excel/Google Sheets',
      color: 'bg-success-50 hover:bg-success-100 border-success-200 text-success-800'
    },
    {
      type: 'PDF' as const,
      icon: FileText,
      title: 'Exportar PDF',
      description: 'Documento formatado para visualização e impressão',
      color: 'bg-error-50 hover:bg-error-100 border-error-200 text-error-800'
    }
  ]

  const content = (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
          <Download className="w-6 h-6 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-600">
          {description}
        </p>
      </div>

      <div className="grid gap-3">
        {exportOptions.map((option) => {
          const Icon = option.icon
          return (
            <button
              key={option.type}
              onClick={() => handleSelect(option.type)}
              disabled={isExporting}
              className={`
                w-full p-4 rounded-lg border-2 transition-all duration-200
                flex items-center space-x-4 text-left
                disabled:opacity-50 disabled:cursor-not-allowed
                ${option.color}
              `}
            >
              <div className="flex-shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 mb-1">
                  {option.title}
                </p>
                <p className="text-sm text-gray-600">
                  {option.description}
                </p>
              </div>
              {isExporting && (
                <div className="flex-shrink-0">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={onClose}
          className="w-full"
          disabled={isExporting}
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer isOpen={isOpen} onClose={onClose} title="Exportar dados">
        {content}
      </Drawer>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title="Exportar Dados">
      {content}
    </Modal>
  )
}
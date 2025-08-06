'use client'

import { useState, useEffect, useRef } from 'react'
import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'

interface SearchSelectOption {
  value: string
  label: string
}

interface SearchSelectProps {
  label?: string
  placeholder?: string
  options: SearchSelectOption[]
  value?: string
  onChange?: (value: string) => void
  error?: string
  disabled?: boolean
  className?: string
}

export function SearchSelect({
  label,
  placeholder = 'Digite para buscar...',
  options,
  value,
  onChange,
  error,
  disabled = false,
  className
}: SearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOption, setSelectedOption] = useState<SearchSelectOption | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filtrar opções baseado na busca
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Encontrar opção selecionada
  useEffect(() => {
    if (value) {
      const option = options.find(opt => opt.value === value)
      setSelectedOption(option || null)
    } else {
      setSelectedOption(null)
    }
  }, [value, options])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option: SearchSelectOption) => {
    setSelectedOption(option)
    setSearchQuery('')
    setIsOpen(false)
    onChange?.(option.value)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    setIsOpen(true)
    
    // Se o usuário limpar o campo, limpar seleção
    if (!query) {
      setSelectedOption(null)
      onChange?.('')
    }
  }

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true)
      setSearchQuery('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <div className={clsx('relative', className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          type="text"
          placeholder={selectedOption ? '' : placeholder}
          value={isOpen ? searchQuery : (selectedOption?.label || '')}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={clsx(
            'w-full px-3 py-2 border rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors',
            error ? 'border-error-300 focus:ring-error-500 focus:border-error-500' : 'border-gray-300',
            disabled ? 'bg-gray-50 cursor-not-allowed' : 'cursor-text'
          )}
        />
        
        {/* Ícone de dropdown */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown 
            className={clsx(
              'w-5 h-5 transition-transform',
              isOpen ? 'rotate-180' : '',
              error ? 'text-error-400' : 'text-gray-400'
            )} 
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={clsx(
                  'w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors',
                  selectedOption?.value === option.value ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                )}
              >
                {option.label}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">
              Nenhuma opção encontrada
            </div>
          )}
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <p className="mt-1 text-sm text-error-600">
          {error}
        </p>
      )}
    </div>
  )
} 
'use client'

import React, { ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { Card } from '@/components/ui/Card'
import { AlertTriangle } from 'lucide-react'

interface AsyncErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  errorMessage?: string
}

/**
 * Error Boundary especializado para erros assíncronos
 * Útil para componentes que fazem chamadas de API
 */
export function AsyncErrorBoundary({ 
  children, 
  fallback,
  errorMessage = 'Erro ao carregar dados'
}: AsyncErrorBoundaryProps) {
  const handleError = (error: Error) => {
    // Log específico para erros assíncronos
    console.error('AsyncErrorBoundary - Erro assíncrono:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
  }

  const defaultFallback = (
    <Card className="p-6">
      <div className="flex items-center space-x-3 text-error-600">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h3 className="font-medium">
            {errorMessage}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Tente recarregar a página ou entre em contato conosco se o problema persistir.
          </p>
        </div>
      </div>
    </Card>
  )

  return (
    <ErrorBoundary
      fallback={fallback || defaultFallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'
import { Check, X, AlertTriangle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  type: ToastType
  message: string
  duration?: number
  onClose: () => void
}

const toastConfig = {
  success: {
    icon: <Check className="w-5 h-5" />,
    classes: 'bg-success-50 border-success-200 text-success-800'
  },
  error: {
    icon: <X className="w-5 h-5" />,
    classes: 'bg-error-50 border-error-200 text-error-800'
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    classes: 'bg-warning-50 border-warning-200 text-warning-800'
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    classes: 'bg-info-50 border-info-200 text-info-800'
  }
}

export function Toast({ type, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Aguarda a animação terminar
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const config = toastConfig[type]

  const toastContent = (
    <div className={clsx(
      'fixed top-4 right-4 z-50 transform transition-all duration-300',
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    )}>
      <div className={clsx(
        'flex items-center p-4 rounded-lg border shadow-lg max-w-sm',
        config.classes
      )}>
        <div className="flex-shrink-0 mr-3">
          {config.icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {message}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="flex-shrink-0 ml-3 text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  return createPortal(toastContent, document.body)
}

// Hook para gerenciar toasts
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; type: ToastType; message: string }>>([])

  const showToast = (type: ToastType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, type, message }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  )

  return {
    showToast,
    ToastContainer
  }
} 
'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'
import { X } from 'lucide-react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  position?: 'left' | 'right' | 'bottom'
}

export function Drawer({ isOpen, onClose, title, children, position = 'bottom' }: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])



  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const positionClasses = {
    left: 'left-0 top-0 h-full w-80',
    right: 'right-0 top-0 h-full w-80',
    bottom: 'bottom-0 left-0 right-0 h-96',
  }

  const transformClasses = {
    left: isOpen ? 'translate-x-0' : '-translate-x-full',
    right: isOpen ? 'translate-x-0' : 'translate-x-full',
    bottom: isOpen ? 'translate-y-0' : 'translate-y-full',
  }

  const drawerContent = (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={clsx(
          'fixed bg-white shadow-xl z-50',
          position === 'bottom' && 'bottom-0 left-0 right-0 h-96',
          position === 'left' && 'left-0 top-0 h-full w-80',
          position === 'right' && 'right-0 top-0 h-full w-80',
          isOpen ? 'transform translate-y-0' : 'transform translate-y-full'
        )}
        style={{
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-80">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(drawerContent, document.body)
} 
import React from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  shadow?: 'soft' | 'medium' | 'strong'
}

export function Card({
  children,
  className,
  padding = 'md',
  shadow = 'soft'
}: CardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',        // Menor padding em mobile
    md: 'p-4 sm:p-6',        // Responsivo
    lg: 'p-6 sm:p-8',        // Responsivo
  }
  
  const shadowClasses = {
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    strong: 'shadow-strong',
  }
  
  return (
    <div
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
        paddingClasses[padding],
        shadowClasses[shadow],
        className
      )}
    >
      {children}
    </div>
  )
} 
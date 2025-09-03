'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import { Home, BarChart, TrendingUp, BarChart3 } from 'lucide-react'

const tabs = [
  {
    name: 'Início',
    href: '/',
    icon: <Home className="w-6 h-6" />,
  },
  {
    name: 'Carteira',
    href: '/portfolio',
    icon: <BarChart className="w-6 h-6" />,
  },
  {
    name: 'Indicadores',
    href: '/indicators',
    icon: <TrendingUp className="w-6 h-6" />,
  },
      {
      name: 'Desempenho',
      href: '/performance',
      icon: <BarChart3 className="w-6 h-6" />,
    },
]

export function TabBar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Não mostrar TabBar se não estiver montado ou se estiver em páginas de auth
  if (!mounted || pathname === '/login' || pathname === '/register') {
    return null
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={clsx(
                'flex flex-col items-center py-2 px-3 min-w-0 flex-1',
                'transition-colors duration-200',
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <div className={clsx(
                'mb-1',
                isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
              )}>
                {tab.icon}
              </div>
              <span className="text-xs font-medium truncate text-gray-900 dark:text-gray-100">
                {tab.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
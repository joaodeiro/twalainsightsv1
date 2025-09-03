'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useEffect, useState } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'
import Image from 'next/image'

// Wrapper para ThemeToggle que só renderiza quando montado
function SafeThemeToggle() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-14 h-8" /> // Placeholder com mesmo tamanho
  }

  return <ThemeToggle />
}

export function Header() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Renderizar versão básica durante SSR
  if (!mounted) {
    return (
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/assets/orginal preto.svg"
                  alt="Twala Insights" 
                  width={120} 
                  height={120}
                  className="w-30 h-30"
                />
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-4">
                <SafeThemeToggle />
                <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Entrar
                </Link>
                <Link href="/register" className="btn-primary">
                  Criar Conta
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>
    )
  }

  // Componente interno que usa useAuth e useTheme
  function AuthenticatedHeader() {
    const { user, signOut } = useAuth()
    const { theme } = useTheme()

    const handleSignOut = async () => {
      await signOut()
    }

    return (
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image 
                  src={theme === 'dark' ? "/assets/orginal branco.svg" : "/assets/orginal preto.svg"}
                  alt="Twala Insights" 
                  width={120} 
                  height={120}
                  className="w-30 h-30"
                />
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              {user ? (
                <>
                  <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    Início
                  </Link>
                  <Link href="/portfolio" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    Carteira
                  </Link>
                  <Link href="/performance" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    Performance
                  </Link>
                  <Link href="/insights" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    Insights
                  </Link>
                  <div className="flex items-center space-x-4">
                    <SafeThemeToggle />
                    <UserMenu />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-4">
                    <SafeThemeToggle />
                    <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      Entrar
                    </Link>
                    <Link href="/register" className="btn-primary">
                      Criar Conta
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
    )
  }

  return <AuthenticatedHeader />
}
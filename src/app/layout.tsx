import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/ui/Header'
import { TabBar } from '@/components/ui/TabBar'
import { AppProvider } from '@/contexts/AppContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { PrerequisitesCheck } from '@/components/PrerequisitesCheck'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Twala Insights - Mercado Financeiro Angolano',
  description: 'Plataforma para simplificar o mundo dos investimentos no mercado angolano',
  keywords: 'investimentos, BODIVA, Angola, mercado financeiro, carteira',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <AppProvider>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 md:pb-0 pt-16">
                  <Header />
                  <main className="flex-1">
                    <PrerequisitesCheck>
                      {children}
                    </PrerequisitesCheck>
                  </main>
                  <TabBar />
                </div>
              </AppProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
} 
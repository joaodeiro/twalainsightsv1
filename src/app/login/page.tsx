'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { loginSchema, type LoginFormData } from '@/lib/schemas'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { signIn } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  })

  // Debug: mostrar valores dos campos
  const watchedValues = watch()
  console.log('=== LOGIN WATCH DEBUG ===')
  console.log('Valores dos campos:', watchedValues)
  console.log('Tipo dos valores:', typeof watchedValues)
  console.log('Keys dos valores:', Object.keys(watchedValues))
  console.log('Erros do formulário:', errors)
  console.log('Tipo dos erros:', typeof errors)
  console.log('Keys dos erros:', Object.keys(errors))

  const onSubmit = async (data: LoginFormData) => {
    console.log('=== LOGIN SUBMIT TRIGGERED ===')
    console.log('Dados do formulário:', data)
    console.log('Tipo dos dados:', typeof data)
    console.log('Keys dos dados:', Object.keys(data))
    console.log('Valores individuais:')
    console.log('- email:', data.email, 'tipo:', typeof data.email)
    console.log('- password:', data.password, 'tipo:', typeof data.password)
    
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await signIn(data.email, data.password)
      
      if (error) {
        console.error('Erro no login:', error)
        setError(error.message)
      } else {
        console.log('Login bem-sucedido')
        router.push('/')
      }
    } catch (err) {
      console.error('Erro inesperado:', err)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-3 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Entrar na sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{' '}
            <Link href="/register" className="text-primary-600 hover:text-primary-500">
              crie uma nova conta
            </Link>
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                style={{ color: 'black', backgroundColor: 'white' }}
                {...register('email')}
              />
              {errors.email?.message && (
                <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
              )}
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                style={{ color: 'black', backgroundColor: 'white' }}
                {...register('password')}
              />
              {errors.password?.message && (
                <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Esqueceu sua senha?
              </Link>
            </div>

            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
            >
              Entrar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
} 
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { registerSchema, type RegisterFormData } from '@/lib/schemas'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { signUp } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
  })

  // Debug: mostrar valores dos campos
  const watchedValues = watch()
  console.log('=== WATCH DEBUG ===')
  console.log('Valores dos campos:', watchedValues)
  console.log('Tipo dos valores:', typeof watchedValues)
  console.log('Keys dos valores:', Object.keys(watchedValues))
  console.log('Erros do formulário:', errors)
  console.log('Tipo dos erros:', typeof errors)
  console.log('Keys dos erros:', Object.keys(errors))

  const onSubmit = async (data: RegisterFormData) => {
    console.log('=== SUBMIT TRIGGERED ===')
    console.log('Dados do formulário:', data)
    console.log('Tipo dos dados:', typeof data)
    console.log('Keys dos dados:', Object.keys(data))
    console.log('Valores individuais:')
    console.log('- name:', data.name, 'tipo:', typeof data.name)
    console.log('- email:', data.email, 'tipo:', typeof data.email)
    console.log('- password:', data.password, 'tipo:', typeof data.password)
    console.log('- confirmPassword:', data.confirmPassword, 'tipo:', typeof data.confirmPassword)
    
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await signUp(data.email, data.password, data.name)
      
      if (error) {
        console.error('Erro no registro:', error)
        setError(error.message)
      } else {
        console.log('Registro bem-sucedido')
        setSuccess(true)
        // Redirecionar após 2 segundos
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err) {
      console.error('Erro inesperado:', err)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card>
          <div className="text-center">
            <div className="w-16 h-16 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Conta criada com sucesso!
            </h2>
            <p className="text-gray-600 mb-4">
              Verifique seu email para confirmar a conta.
            </p>
            <p className="text-sm text-gray-500">
              Redirecionando para o login...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-3 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Criar nova conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-500">
              entre na sua conta existente
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
                Nome completo
              </label>
              <input
                type="text"
                placeholder="Seu nome completo"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                style={{ color: 'black', backgroundColor: 'white' }}
                {...register('name')}
              />
              {errors.name?.message && (
                <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
              )}
            </div>

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

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                style={{ color: 'black', backgroundColor: 'white' }}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword?.message && (
                <p className="mt-1 text-sm text-error-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
            >
              Criar conta
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
} 
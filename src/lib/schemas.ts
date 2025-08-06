import { z } from 'zod'

// Schema para conta de custódia
export const custodyAccountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  institution: z.string().min(1, 'Instituição é obrigatória').max(100, 'Instituição muito longa'),
  accountNumber: z.string().min(1, 'Número da conta é obrigatório').max(50, 'Número da conta muito longo'),
})

export type CustodyAccountFormData = z.infer<typeof custodyAccountSchema>

// Schema para transação de compra
export const buyTransactionSchema = z.object({
  custodyAccountId: z.string().min(1, 'Conta de custódia é obrigatória'),
  assetId: z.string().min(1, 'Ativo é obrigatório'),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  price: z.number().positive('Preço deve ser positivo'),
  date: z.union([
    z.string().transform((str) => new Date(str)),
    z.date()
  ]).refine((date) => date <= new Date(), {
    message: 'Data não pode ser futura',
  }),
  broker: z.string().optional(),
  fees: z.number().min(0, 'Taxas não podem ser negativas').optional(),
  notes: z.string().max(500, 'Notas muito longas').optional(),
})

export type BuyTransactionFormData = z.infer<typeof buyTransactionSchema>

// Schema para transação de venda
export const sellTransactionSchema = z.object({
  custodyAccountId: z.string().min(1, 'Conta de custódia é obrigatória'),
  assetId: z.string().min(1, 'Ativo é obrigatório'),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  price: z.number().positive('Preço deve ser positivo'),
  date: z.union([
    z.string().transform((str) => new Date(str)),
    z.date()
  ]).refine((date) => date <= new Date(), {
    message: 'Data não pode ser futura',
  }),
  broker: z.string().optional(),
  fees: z.number().min(0, 'Taxas não podem ser negativas').optional(),
  notes: z.string().max(500, 'Notas muito longas').optional(),
})

export type SellTransactionFormData = z.infer<typeof sellTransactionSchema>

// Schema genérico para compatibilidade
export const transactionSchema = z.object({
  custodyAccountId: z.string().min(1, 'Conta de custódia é obrigatória'),
  assetId: z.string().min(1, 'Ativo é obrigatório'),
  type: z.enum(['BUY', 'SELL', 'DIVIDEND', 'INTEREST'], {
    required_error: 'Tipo de transação é obrigatório',
  }),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  price: z.number().positive('Preço deve ser positivo'),
  date: z.union([
    z.string().transform((str) => new Date(str)),
    z.date()
  ]),
  broker: z.string().optional(),
  fees: z.number().min(0, 'Taxas não podem ser negativas').optional(),
  notes: z.string().max(500, 'Notas muito longas').optional(),
})

export type TransactionFormData = z.infer<typeof transactionSchema>

// Schema para proventos (juros e dividendos)
export const incomeSchema = z.object({
  assetId: z.string().min(1, 'Ativo é obrigatório'),
  type: z.enum(['DIVIDEND', 'INTEREST'], {
    required_error: 'Tipo de provento é obrigatório',
  }),
  amount: z.number().positive('Valor deve ser maior que zero'),
  date: z.union([
    z.string().transform((str) => new Date(str)),
    z.date()
  ]),
  description: z.string().min(1, 'Descrição é obrigatória').max(200, 'Descrição muito longa'),
})

export type IncomeFormData = z.infer<typeof incomeSchema>

// Schema para filtro de screener
export const screenerFilterSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  criteria: z.array(z.object({
    field: z.string().min(1, 'Campo é obrigatório'),
    operator: z.enum(['eq', 'gt', 'lt', 'gte', 'lte', 'contains']),
    value: z.union([z.string(), z.number()]),
  })).min(1, 'Pelo menos um critério é obrigatório'),
})

export type ScreenerFilterFormData = z.infer<typeof screenerFilterSchema>

// Schema para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Schema para registro
export const registerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema> 
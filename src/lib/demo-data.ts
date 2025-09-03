// Dados de demonstração para testar gráficos

import { Transaction, CustodyAccount, Asset } from '@/types'

export const demoTransactions: Transaction[] = [
  {
    id: 'demo-1',
    userId: 'demo-user',
    operationDate: new Date('2024-01-15T10:00:00Z'),
    type: 'BUY',
    assetId: 'BIA',
    quantity: 100,
    unitPrice: 2500,
    totalOperationValue: 250000,
    fees: 2500,
    custodyAccountId: 'demo-account-1',
    notes: 'Compra inicial BIA',
    createdAt: new Date(),
    updatedAt: new Date(),
    // Para compatibilidade
    date: new Date('2024-01-15T10:00:00Z'),
    price: 2500,
    total: 250000,
  },
  {
    id: 'demo-2',
    userId: 'demo-user', 
    operationDate: new Date('2024-02-01T14:30:00Z'),
    type: 'BUY',
    assetId: 'BPC',
    quantity: 50,
    unitPrice: 4000,
    totalOperationValue: 200000,
    fees: 2000,
    custodyAccountId: 'demo-account-1',
    notes: 'Diversificação com BPC',
    createdAt: new Date(),
    updatedAt: new Date(),
    // Para compatibilidade
    date: new Date('2024-02-01T14:30:00Z'),
    price: 4000,
    total: 200000
  },
  {
    id: 'demo-3',
    userId: 'demo-user',
    operationDate: new Date('2024-02-15T09:15:00Z'),
    type: 'DIVIDEND',
    assetId: 'BIA',
    quantity: 100,
    unitPrice: 50,
    totalOperationValue: 5000,
    fees: 0,
    custodyAccountId: 'demo-account-1',
    notes: 'Dividendos BIA',
    createdAt: new Date(),
    updatedAt: new Date(),
    // Para compatibilidade
    date: new Date('2024-02-15T09:15:00Z'),
    price: 50,
    total: 5000
  },
  {
    id: 'demo-4',
    userId: 'demo-user',
    operationDate: new Date('2024-03-10T11:20:00Z'),
    type: 'BUY',
    assetId: 'BAI',
    quantity: 75,
    unitPrice: 3200,
    totalOperationValue: 240000,
    fees: 2400,
    custodyAccountId: 'demo-account-2',
    notes: 'Posição em BAI',
    createdAt: new Date(),
    updatedAt: new Date(),
    // Para compatibilidade
    date: new Date('2024-03-10T11:20:00Z'),
    price: 3200,
    total: 240000
  },
  {
    id: 'demo-5',
    userId: 'demo-user',
    operationDate: new Date('2024-03-25T16:45:00Z'),
    type: 'SELL',
    assetId: 'BIA',
    quantity: 30,
    unitPrice: 2750,
    totalOperationValue: 82500,
    fees: 825,
    custodyAccountId: 'demo-account-1',
    notes: 'Realização parcial BIA',
    createdAt: new Date(),
    updatedAt: new Date(),
    // Para compatibilidade
    date: new Date('2024-03-25T16:45:00Z'),
    price: 2750,
    total: 82500
  },
  {
    id: 'demo-6',
    userId: 'demo-user',
    operationDate: new Date('2024-04-05T13:10:00Z'),
    type: 'DIVIDEND',
    assetId: 'BPC',
    quantity: 50,
    unitPrice: 80,
    totalOperationValue: 4000,
    fees: 0,
    custodyAccountId: 'demo-account-1',
    notes: 'Dividendos BPC',
    createdAt: new Date(),
    updatedAt: new Date(),
    // Para compatibilidade
    date: new Date('2024-04-05T13:10:00Z'),
    price: 80,
    total: 4000
  },
  {
    id: 'demo-7',
    userId: 'demo-user',
    operationDate: new Date('2024-04-20T10:30:00Z'),
    type: 'BUY',
    assetId: 'NOS',
    quantity: 200,
    unitPrice: 1500,
    totalOperationValue: 300000,
    fees: 3000,
    custodyAccountId: 'demo-account-2',
    notes: 'Entrada em NOS',
    createdAt: new Date(),
    updatedAt: new Date(),
    // Para compatibilidade
    date: new Date('2024-04-20T10:30:00Z'),
    price: 1500,
    total: 300000
  },
  // Dividendos recentes para os alertas
  {
    id: 'demo-8',
    userId: 'demo-user',
    operationDate: new Date(),
    type: 'DIVIDEND',
    assetId: 'BFA',
    quantity: 100,
    unitPrice: 125,
    totalOperationValue: 12500,
    fees: 0,
    custodyAccountId: 'demo-account-1',
    notes: 'Dividendos BFA recentes',
    createdAt: new Date(),
    updatedAt: new Date(),
    date: new Date(),
    price: 125,
    total: 12500,
  }
]

export const demoCustodyAccounts: CustodyAccount[] = [
  {
    id: 'demo-account-1',
    userId: 'demo-user',
    brokerName: 'Banco de Investimento Africano',
    accountNickname: 'BIA Principal',
    accountNumber: '001234567890',
    accountType: 'CUSTODY',
    baseCurrency: 'AOA',
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    // Para compatibilidade
    name: 'Banco de Investimento Africano',
    institution: 'BIA'
  },
  {
    id: 'demo-account-2',
    userId: 'demo-user',
    brokerName: 'Banco Económico',
    accountNickname: 'BE Principal',
    accountNumber: '987654321000',
    accountType: 'CUSTODY',
    baseCurrency: 'AOA',
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    // Para compatibilidade
    name: 'Banco Económico',
    institution: 'BE'
  }
]

export const demoAssets: Asset[] = [
  {
    id: 'BIA',
    name: 'Banco de Investimento Africano',
    ticker: 'BIA',
    sector: 'Financeiro',
    currentPrice: 2500,
    change: 50,
    changePercent: 2.04,
    volume: 1000000,
    marketCap: 25000000000,
    peRatio: 12.5,
    dividendYield: 4.2,
    beta: 0.85
  },
  {
    id: 'BPC',
    name: 'Banco de Poupança e Crédito',
    ticker: 'BPC',
    sector: 'Financeiro',
    currentPrice: 4000,
    change: -20,
    changePercent: -0.5,
    volume: 750000,
    marketCap: 20000000000,
    peRatio: 10.8,
    dividendYield: 5.1,
    beta: 0.92
  },
  {
    id: 'BAI',
    name: 'Banco Angolano de Investimentos',
    ticker: 'BAI',
    sector: 'Financeiro',
    currentPrice: 3200,
    change: 15,
    changePercent: 0.47,
    volume: 850000,
    marketCap: 22000000000,
    peRatio: 11.2,
    dividendYield: 4.8,
    beta: 0.88
  },
  {
    id: 'NOS',
    name: 'Nos Comunicações',
    ticker: 'NOS',
    sector: 'Telecomunicações',
    currentPrice: 1500,
    change: 30,
    changePercent: 2.04,
    volume: 1200000,
    marketCap: 15000000000,
    peRatio: 15.3,
    dividendYield: 3.5,
    beta: 1.12
  },
  {
    id: '38e26516-65c8-4d0e-b512-476e25d47495',
    name: 'Banco de Fomento Angola',
    ticker: 'BFA',
    sector: 'Financeiro',
    currentPrice: 3800,
    change: 25,
    changePercent: 0.66,
    volume: 900000,
    marketCap: 24000000000,
    peRatio: 12.1,
    dividendYield: 4.5,
    beta: 0.90
  },
  {
    id: '343634b0-43b7-43d5-9ccf-de7fff6d11a',
    name: 'Banco de Investimento Comercial',
    ticker: 'BIC',
    sector: 'Financeiro',
    currentPrice: 3500,
    change: -10,
    changePercent: -0.29,
    volume: 800000,
    marketCap: 21000000000,
    peRatio: 11.8,
    dividendYield: 4.7,
    beta: 0.87
  }
]
// Dados de demonstração para testar gráficos

import { Transaction, CustodyAccount, Asset } from '@/types'

export const demoTransactions: Transaction[] = [
  // Comentado temporariamente para deploy
  /*
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
    price: 4000,
    total: 200000,
    fees: 2000,
    custodyAccountId: 'demo-account-1',
    notes: 'Diversificação com BPC'
  },
  {
    id: 'demo-3',
    date: '2024-02-15T09:15:00Z',
    type: 'DIVIDEND',
    assetId: 'BIA',
    quantity: 100,
    price: 50,
    total: 5000,
    fees: 0,
    custodyAccountId: 'demo-account-1',
    notes: 'Dividendos BIA'
  },
  {
    id: 'demo-4',
    date: '2024-03-10T11:20:00Z',
    type: 'BUY',
    assetId: 'BAI',
    quantity: 75,
    price: 3200,
    total: 240000,
    fees: 2400,
    custodyAccountId: 'demo-account-2',
    notes: 'Posição em BAI'
  },
  {
    id: 'demo-5',
    date: '2024-03-25T16:45:00Z',
    type: 'SELL',
    assetId: 'BIA',
    quantity: 30,
    price: 2750,
    total: 82500,
    fees: 825,
    custodyAccountId: 'demo-account-1',
    notes: 'Realização parcial BIA'
  },
  {
    id: 'demo-6',
    date: '2024-04-05T13:10:00Z',
    type: 'DIVIDEND',
    assetId: 'BPC',
    quantity: 50,
    price: 80,
    total: 4000,
    fees: 0,
    custodyAccountId: 'demo-account-1',
    notes: 'Dividendos BPC'
  },
  {
    id: 'demo-7',
    date: '2024-04-20T10:30:00Z',
    type: 'BUY',
    assetId: 'NOS',
    quantity: 200,
    price: 1500,
    total: 300000,
    fees: 3000,
    custodyAccountId: 'demo-account-2',
    notes: 'Entrada em NOS'
  }
  */
]

export const demoCustodyAccounts: CustodyAccount[] = [
  // Comentado temporariamente para deploy
  /*
  {
    id: 'demo-account-1',
    name: 'Banco de Investimento Africano',
    institution: 'BIA',
    accountNumber: '001234567890',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'demo-account-2', 
    name: 'Banco Económico',
    institution: 'BE',
    accountNumber: '987654321000',
    createdAt: '2024-01-01T00:00:00Z'
  }
  */
]

export const demoAssets: Asset[] = [
  // Comentado temporariamente para deploy
  /*
  {
    id: 'BIA',
    name: 'Banco de Investimento Africano',
    ticker: 'BIA',
    type: 'STOCK',
    sector: 'Financeiro',
    description: 'Banco angolano focado em investimentos'
  },
  {
    id: 'BPC',
    name: 'Banco de Poupança e Crédito',
    ticker: 'BPC', 
    type: 'STOCK',
    sector: 'Financeiro',
    description: 'Banco comercial angolano'
  },
  {
    id: 'BAI',
    name: 'Banco Angolano de Investimentos',
    ticker: 'BAI',
    type: 'STOCK', 
    sector: 'Financeiro',
    description: 'Banco de investimentos em Angola'
  },
  {
    id: 'NOS',
    name: 'Nos Comunicações',
    ticker: 'NOS',
    type: 'STOCK',
    sector: 'Telecomunicações',
    description: 'Operadora de telecomunicações'
  },
  {
    id: '38e26516-65c8-4d0e-b512-476e25d47495',
    name: 'Banco de Fomento Angola',
    ticker: 'BFA',
    type: 'STOCK',
    sector: 'Financeiro',
    description: 'Banco de Fomento Angola'
  },
  {
    id: '343634b0-43b7-43d5-9ccf-de7fff6d11a',
    name: 'Banco de Investimento Comercial',
    ticker: 'BIC',
    type: 'STOCK',
    sector: 'Financeiro',
    description: 'Banco de Investimento Comercial'
  }
  */
]
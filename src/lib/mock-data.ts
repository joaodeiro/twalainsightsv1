import type { Asset } from '@/types'

// Dados mockados de ativos da BODIVA
export const mockAssets: Asset[] = [
  {
    id: '1',
    ticker: 'BFA',
    name: 'Banco de Fomento Angola',
    sector: 'Bancos',
    currentPrice: 1250.50,
    change: 25.30,
    changePercent: 2.06,
    volume: 1500000,
    marketCap: 12505000000,
    peRatio: 12.5,
    dividendYield: 3.2,
    beta: 0.85,
  },
  {
    id: '2',
    ticker: 'BCGA',
    name: 'Banco Caixa Geral Angola',
    sector: 'Bancos',
    currentPrice: 890.75,
    change: -15.20,
    changePercent: -1.68,
    volume: 2200000,
    marketCap: 8907500000,
    peRatio: 10.2,
    dividendYield: 4.1,
    beta: 0.92,
  },
  {
    id: '3',
    ticker: 'ENDE',
    name: 'Empresa Nacional de Distribuição de Electricidade',
    sector: 'Energia',
    currentPrice: 450.00,
    change: 8.50,
    changePercent: 1.92,
    volume: 800000,
    marketCap: 4500000000,
    peRatio: 15.8,
    dividendYield: 2.8,
    beta: 0.75,
  },
  {
    id: '4',
    ticker: 'SONANGOL',
    name: 'Sociedade Nacional de Combustíveis de Angola',
    sector: 'Petróleo e Gás',
    currentPrice: 3200.00,
    change: 150.00,
    changePercent: 4.92,
    volume: 500000,
    marketCap: 32000000000,
    peRatio: 8.5,
    dividendYield: 5.2,
    beta: 1.15,
  },
  {
    id: '5',
    ticker: 'UNITEL',
    name: 'Unitel',
    sector: 'Telecomunicações',
    currentPrice: 1800.25,
    change: -45.75,
    changePercent: -2.48,
    volume: 1200000,
    marketCap: 18002500000,
    peRatio: 18.2,
    dividendYield: 2.1,
    beta: 0.88,
  },
  {
    id: '6',
    ticker: 'CIMANGOLA',
    name: 'Cimentos de Angola',
    sector: 'Materiais de Construção',
    currentPrice: 750.50,
    change: 12.30,
    changePercent: 1.67,
    volume: 600000,
    marketCap: 7505000000,
    peRatio: 14.5,
    dividendYield: 3.5,
    beta: 0.95,
  },
  {
    id: '7',
    ticker: 'BIC',
    name: 'Banco BIC',
    sector: 'Bancos',
    currentPrice: 1100.00,
    change: 35.00,
    changePercent: 3.28,
    volume: 900000,
    marketCap: 11000000000,
    peRatio: 11.8,
    dividendYield: 3.8,
    beta: 0.89,
  },
  {
    id: '8',
    ticker: 'ANGOP',
    name: 'Agência Angola Press',
    sector: 'Mídia',
    currentPrice: 280.75,
    change: -8.25,
    changePercent: -2.85,
    volume: 400000,
    marketCap: 2807500000,
    peRatio: 16.5,
    dividendYield: 1.9,
    beta: 1.02,
  },
]

// Função para buscar ativos
export function searchAssets(query: string): Asset[] {
  const lowerQuery = query.toLowerCase()
  return mockAssets.filter(asset => 
    asset.ticker.toLowerCase().includes(lowerQuery) ||
    asset.name.toLowerCase().includes(lowerQuery) ||
    asset.sector.toLowerCase().includes(lowerQuery)
  )
}

// Função para obter ativo por ID
export function getAssetById(id: string): Asset | undefined {
  return mockAssets.find(asset => asset.id === id)
}

// Função para obter ativos por setor
export function getAssetsBySector(sector: string): Asset[] {
  return mockAssets.filter(asset => asset.sector === sector)
}

// Função para obter setores únicos
export function getUniqueSectors(): string[] {
  const sectors = mockAssets.map(asset => asset.sector)
  return Array.from(new Set(sectors))
} 
import { supabase } from './supabase'
import type { Asset } from '@/types'

export async function getAssets(): Promise<Asset[]> {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('ticker')

  if (error) {
    console.error('Erro ao buscar ativos:', error)
    return []
  }

  return data.map(item => ({
    id: item.id,
    ticker: item.ticker,
    name: item.name,
    sector: item.sector,
    currentPrice: item.current_price,
    change: item.change,
    changePercent: item.change_percent,
    volume: item.volume,
    marketCap: item.market_cap,
    peRatio: item.pe_ratio,
    dividendYield: item.dividend_yield,
    beta: item.beta,
  }))
}

export async function searchAssets(query: string): Promise<Asset[]> {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .or(`ticker.ilike.%${query}%,name.ilike.%${query}%`)
    .order('ticker')

  if (error) {
    console.error('Erro ao buscar ativos:', error)
    return []
  }

  return data.map(item => ({
    id: item.id,
    ticker: item.ticker,
    name: item.name,
    sector: item.sector,
    currentPrice: item.current_price,
    change: item.change,
    changePercent: item.change_percent,
    volume: item.volume,
    marketCap: item.market_cap,
    peRatio: item.pe_ratio,
    dividendYield: item.dividend_yield,
    beta: item.beta,
  }))
}

export async function getAssetById(id: string): Promise<Asset | null> {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar ativo:', error)
    return null
  }

  return {
    id: data.id,
    ticker: data.ticker,
    name: data.name,
    sector: data.sector,
    currentPrice: data.current_price,
    change: data.change,
    changePercent: data.change_percent,
    volume: data.volume,
    marketCap: data.market_cap,
    peRatio: data.pe_ratio,
    dividendYield: data.dividend_yield,
    beta: data.beta,
  }
}

export async function getAssetsBySector(sector: string): Promise<Asset[]> {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('sector', sector)
    .order('ticker')

  if (error) {
    console.error('Erro ao buscar ativos por setor:', error)
    return []
  }

  return data.map(item => ({
    id: item.id,
    ticker: item.ticker,
    name: item.name,
    sector: item.sector,
    currentPrice: item.current_price,
    change: item.change,
    changePercent: item.change_percent,
    volume: item.volume,
    marketCap: item.market_cap,
    peRatio: item.pe_ratio,
    dividendYield: item.dividend_yield,
    beta: item.beta,
  }))
}

export async function getUniqueSectors(): Promise<string[]> {
  const { data, error } = await supabase
    .from('assets')
    .select('sector')
    .order('sector')

  if (error) {
    console.error('Erro ao buscar setores:', error)
    return []
  }

  return Array.from(new Set(data.map(item => item.sector)))
} 
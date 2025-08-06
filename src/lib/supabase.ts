import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      custody_accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          institution: string
          account_number: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          institution: string
          account_number: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          institution?: string
          account_number?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          custody_account_id: string
          asset_id: string
          type: 'BUY' | 'SELL'
          quantity: number
          price: number
          date: string
          total: number
          fees?: number
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          custody_account_id: string
          asset_id: string
          type: 'BUY' | 'SELL'
          quantity: number
          price: number
          date: string
          total: number
          fees?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          custody_account_id?: string
          asset_id?: string
          type?: 'BUY' | 'SELL'
          quantity?: number
          price?: number
          date?: string
          total?: number
          fees?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          ticker: string
          name: string
          sector: string
          current_price: number
          change: number
          change_percent: number
          volume: number
          market_cap: number
          pe_ratio?: number
          dividend_yield?: number
          beta?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticker: string
          name: string
          sector: string
          current_price: number
          change: number
          change_percent: number
          volume: number
          market_cap: number
          pe_ratio?: number
          dividend_yield?: number
          beta?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticker?: string
          name?: string
          sector?: string
          current_price?: number
          change?: number
          change_percent?: number
          volume?: number
          market_cap?: number
          pe_ratio?: number
          dividend_yield?: number
          beta?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 
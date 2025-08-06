-- Script SQL para criar as tabelas no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de contas de custódia
CREATE TABLE IF NOT EXISTS custody_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  account_number TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  custody_account_id UUID REFERENCES custody_accounts(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL,
  type TEXT CHECK (type IN ('BUY', 'SELL')) NOT NULL,
  quantity DECIMAL NOT NULL,
  price DECIMAL NOT NULL,
  date DATE NOT NULL,
  total DECIMAL NOT NULL,
  broker TEXT,
  fees DECIMAL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de ativos
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticker TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  current_price DECIMAL NOT NULL,
  change DECIMAL DEFAULT 0,
  change_percent DECIMAL DEFAULT 0,
  volume BIGINT DEFAULT 0,
  market_cap BIGINT DEFAULT 0,
  pe_ratio DECIMAL,
  dividend_yield DECIMAL,
  beta DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir alguns ativos de exemplo
INSERT INTO assets (ticker, name, sector, current_price, change, change_percent, volume, market_cap) VALUES
('BFA', 'Banco de Fomento Angola', 'Bancos', 150.00, 2.50, 1.69, 1000000, 1500000000),
('BIC', 'Banco de Investimento Comercial', 'Bancos', 85.50, -1.20, -1.38, 800000, 850000000),
('BPC', 'Banco de Poupança e Crédito', 'Bancos', 120.00, 3.00, 2.56, 1200000, 1200000000),
('ENH', 'Empresa Nacional de Hidrocarbonetos', 'Energia', 200.00, 5.00, 2.56, 500000, 2000000000),
('ENANA', 'Empresa Nacional de Diamantes', 'Mineração', 180.00, -2.00, -1.10, 300000, 1800000000),
('ENDE', 'Empresa Nacional de Distribuição de Electricidade', 'Energia', 95.00, 1.50, 1.60, 600000, 950000000),
('ENCA', 'Empresa Nacional de Comercialização de Combustíveis', 'Energia', 110.00, 2.00, 1.85, 400000, 1100000000),
('ENDE', 'Empresa Nacional de Distribuição de Electricidade', 'Energia', 95.00, 1.50, 1.60, 600000, 950000000),
('ENCA', 'Empresa Nacional de Comercialização de Combustíveis', 'Energia', 110.00, 2.00, 1.85, 400000, 1100000000),
('ENDE', 'Empresa Nacional de Distribuição de Electricidade', 'Energia', 95.00, 1.50, 1.60, 600000, 950000000)
ON CONFLICT (ticker) DO NOTHING;

-- Criar políticas de segurança (RLS)
ALTER TABLE custody_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Políticas para custody_accounts
CREATE POLICY "Users can view their own custody accounts" ON custody_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custody accounts" ON custody_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custody accounts" ON custody_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custody accounts" ON custody_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para transactions
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para assets (leitura pública)
CREATE POLICY "Anyone can view assets" ON assets
  FOR SELECT USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_custody_accounts_updated_at BEFORE UPDATE ON custody_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
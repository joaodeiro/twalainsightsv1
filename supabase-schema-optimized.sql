-- =====================================================
-- TWALA INSIGHTS - SCHEMA SQL OTIMIZADO
-- =====================================================
-- Este script cria a estrutura completa do banco de dados
-- para a plataforma Twala Insights
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de contas de custódia
CREATE TABLE IF NOT EXISTS custody_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  institution VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints adicionais
  CONSTRAINT custody_accounts_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT custody_accounts_institution_not_empty CHECK (length(trim(institution)) > 0),
  CONSTRAINT custody_accounts_account_number_not_empty CHECK (length(trim(account_number)) > 0)
);

-- Tabela de ativos (cotações e informações de mercado)
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticker VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  change DECIMAL(10,2) DEFAULT 0.00,
  change_percent DECIMAL(5,2) DEFAULT 0.00,
  volume BIGINT DEFAULT 0,
  market_cap BIGINT DEFAULT 0,
  pe_ratio DECIMAL(8,2),
  dividend_yield DECIMAL(5,2),
  beta DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT assets_ticker_not_empty CHECK (length(trim(ticker)) > 0),
  CONSTRAINT assets_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT assets_current_price_positive CHECK (current_price > 0),
  CONSTRAINT assets_volume_positive CHECK (volume >= 0),
  CONSTRAINT assets_market_cap_positive CHECK (market_cap >= 0),
  CONSTRAINT assets_pe_ratio_positive CHECK (pe_ratio IS NULL OR pe_ratio > 0),
  CONSTRAINT assets_dividend_yield_positive CHECK (dividend_yield IS NULL OR dividend_yield >= 0)
);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  custody_account_id UUID REFERENCES custody_accounts(id) ON DELETE CASCADE NOT NULL,
  asset_id TEXT NOT NULL, -- Referência ao ticker do ativo
  type VARCHAR(8) CHECK (type IN ('BUY', 'SELL', 'DIVIDEND', 'INTEREST')) NOT NULL,
  quantity DECIMAL(15,4) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  total DECIMAL(15,2) NOT NULL,
  broker VARCHAR(100),
  fees DECIMAL(10,2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT transactions_quantity_positive CHECK (quantity > 0),
  CONSTRAINT transactions_price_positive CHECK (price > 0),
  CONSTRAINT transactions_total_positive CHECK (total > 0),
  CONSTRAINT transactions_fees_positive CHECK (fees >= 0),
  CONSTRAINT transactions_date_not_future CHECK (date <= CURRENT_DATE),
  CONSTRAINT transactions_total_calculation CHECK (total = (quantity * price) + COALESCE(fees, 0))
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para custody_accounts
CREATE INDEX IF NOT EXISTS idx_custody_accounts_user_id ON custody_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_custody_accounts_is_active ON custody_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_custody_accounts_created_at ON custody_accounts(created_at DESC);

-- Índices para assets
CREATE INDEX IF NOT EXISTS idx_assets_ticker ON assets(ticker);
CREATE INDEX IF NOT EXISTS idx_assets_sector ON assets(sector);
CREATE INDEX IF NOT EXISTS idx_assets_is_active ON assets(is_active);
CREATE INDEX IF NOT EXISTS idx_assets_current_price ON assets(current_price);

-- Índices para transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_custody_account_id ON transactions(custody_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_asset_id ON transactions(asset_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_asset_date ON transactions(user_id, asset_id, date DESC);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir ativos da BODIVA (Bolsa de Valores de Angola)
INSERT INTO assets (ticker, name, sector, current_price, change, change_percent, volume, market_cap) VALUES
-- Bancos
('BFA', 'Banco de Fomento Angola', 'Bancos', 150.00, 2.50, 1.69, 1000000, 1500000000),
('BIC', 'Banco de Investimento Comercial', 'Bancos', 85.50, -1.20, -1.38, 800000, 850000000),
('BPC', 'Banco de Poupança e Crédito', 'Bancos', 120.00, 3.00, 2.56, 1200000, 1200000000),
('BCGA', 'Banco Caixa Geral Angola', 'Bancos', 95.00, 1.50, 1.60, 900000, 950000000),

-- Energia
('ENH', 'Empresa Nacional de Hidrocarbonetos', 'Energia', 200.00, 5.00, 2.56, 500000, 2000000000),
('ENDE', 'Empresa Nacional de Distribuição de Electricidade', 'Energia', 95.00, 1.50, 1.60, 600000, 950000000),
('ENCA', 'Empresa Nacional de Comercialização de Combustíveis', 'Energia', 110.00, 2.00, 1.85, 400000, 1100000000),

-- Mineração
('ENANA', 'Empresa Nacional de Diamantes', 'Mineração', 180.00, -2.00, -1.10, 300000, 1800000000),

-- Telecomunicações
('UNITEL', 'Unitel', 'Telecomunicações', 250.00, 3.50, 1.42, 1500000, 2500000000),

-- Outros
('SONANGOL', 'Sociedade Nacional de Combustíveis', 'Energia', 160.00, 2.00, 1.27, 700000, 1600000000)
ON CONFLICT (ticker) DO UPDATE SET
  name = EXCLUDED.name,
  sector = EXCLUDED.sector,
  current_price = EXCLUDED.current_price,
  change = EXCLUDED.change,
  change_percent = EXCLUDED.change_percent,
  volume = EXCLUDED.volume,
  market_cap = EXCLUDED.market_cap,
  updated_at = NOW();

-- =====================================================
-- SEGURANÇA (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE custody_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Políticas para custody_accounts
DO $$
BEGIN
    -- Política de leitura
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custody_accounts' AND policyname = 'Users can view their own custody accounts') THEN
        CREATE POLICY "Users can view their own custody accounts" ON custody_accounts
          FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Política de inserção
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custody_accounts' AND policyname = 'Users can insert their own custody accounts') THEN
        CREATE POLICY "Users can insert their own custody accounts" ON custody_accounts
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Política de atualização
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custody_accounts' AND policyname = 'Users can update their own custody accounts') THEN
        CREATE POLICY "Users can update their own custody accounts" ON custody_accounts
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Política de exclusão
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custody_accounts' AND policyname = 'Users can delete their own custody accounts') THEN
        CREATE POLICY "Users can delete their own custody accounts" ON custody_accounts
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Políticas para transactions
DO $$
BEGIN
    -- Política de leitura
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can view their own transactions') THEN
        CREATE POLICY "Users can view their own transactions" ON transactions
          FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Política de inserção
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can insert their own transactions') THEN
        CREATE POLICY "Users can insert their own transactions" ON transactions
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Política de atualização
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can update their own transactions') THEN
        CREATE POLICY "Users can update their own transactions" ON transactions
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Política de exclusão
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can delete their own transactions') THEN
        CREATE POLICY "Users can delete their own transactions" ON transactions
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Políticas para assets (leitura pública)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'Anyone can view assets') THEN
        CREATE POLICY "Anyone can view assets" ON assets
          FOR SELECT USING (is_active = true);
    END IF;
END $$;

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_custody_accounts_updated_at') THEN
        CREATE TRIGGER update_custody_accounts_updated_at 
            BEFORE UPDATE ON custody_accounts
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_transactions_updated_at') THEN
        CREATE TRIGGER update_transactions_updated_at 
            BEFORE UPDATE ON transactions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_assets_updated_at') THEN
        CREATE TRIGGER update_assets_updated_at 
            BEFORE UPDATE ON assets
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =====================================================
-- FUNÇÕES ÚTEIS PARA A APLICAÇÃO
-- =====================================================

-- Função para calcular o valor total da carteira de um usuário
CREATE OR REPLACE FUNCTION get_portfolio_value(user_uuid UUID)
RETURNS TABLE (
    total_value DECIMAL(15,2),
    total_cost DECIMAL(15,2),
    total_gain_loss DECIMAL(15,2),
    total_gain_loss_percent DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH portfolio_summary AS (
        SELECT 
            t.asset_id,
            SUM(CASE WHEN t.type = 'BUY' THEN t.quantity ELSE -t.quantity END) as net_quantity,
            SUM(CASE WHEN t.type = 'BUY' THEN t.total ELSE 0 END) as total_cost,
            a.current_price
        FROM transactions t
        LEFT JOIN assets a ON t.asset_id = a.ticker
        WHERE t.user_id = user_uuid
        GROUP BY t.asset_id, a.current_price
        HAVING SUM(CASE WHEN t.type = 'BUY' THEN t.quantity ELSE -t.quantity END) > 0
    )
    SELECT 
        COALESCE(SUM(net_quantity * current_price), 0) as total_value,
        COALESCE(SUM(total_cost), 0) as total_cost,
        COALESCE(SUM(net_quantity * current_price) - SUM(total_cost), 0) as total_gain_loss,
        CASE 
            WHEN SUM(total_cost) > 0 THEN 
                ((SUM(net_quantity * current_price) - SUM(total_cost)) / SUM(total_cost)) * 100
            ELSE 0 
        END as total_gain_loss_percent
    FROM portfolio_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter o histórico de transações de um usuário
CREATE OR REPLACE FUNCTION get_user_transactions(user_uuid UUID, limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
    id UUID,
    asset_id TEXT,
    asset_name TEXT,
    type VARCHAR(4),
    quantity DECIMAL(15,4),
    price DECIMAL(10,2),
    total DECIMAL(15,2),
    date DATE,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.asset_id,
        a.name as asset_name,
        t.type,
        t.quantity,
        t.price,
        t.total,
        t.date,
        t.created_at
    FROM transactions t
    LEFT JOIN assets a ON t.asset_id = a.ticker
    WHERE t.user_id = user_uuid
    ORDER BY t.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE custody_accounts IS 'Contas de custódia dos usuários para organizar investimentos por instituição';
COMMENT ON TABLE assets IS 'Ativos disponíveis na BODIVA com cotações e informações de mercado';
COMMENT ON TABLE transactions IS 'Transações de compra e venda de ativos pelos usuários';

COMMENT ON COLUMN custody_accounts.user_id IS 'Referência ao usuário autenticado';
COMMENT ON COLUMN custody_accounts.name IS 'Nome da conta de custódia (ex: Conta Principal)';
COMMENT ON COLUMN custody_accounts.institution IS 'Instituição financeira (ex: Banco de Investimento)';
COMMENT ON COLUMN custody_accounts.account_number IS 'Número da conta na instituição';

COMMENT ON COLUMN assets.ticker IS 'Código do ativo na BODIVA (ex: BFA, BIC)';
COMMENT ON COLUMN assets.current_price IS 'Preço atual do ativo em AOA';
COMMENT ON COLUMN assets.change IS 'Variação do preço no dia em AOA';
COMMENT ON COLUMN assets.change_percent IS 'Variação percentual do preço no dia';

COMMENT ON COLUMN transactions.asset_id IS 'Referência ao ticker do ativo';
COMMENT ON COLUMN transactions.type IS 'Tipo da transação: BUY (compra) ou SELL (venda)';
COMMENT ON COLUMN transactions.quantity IS 'Quantidade de ativos negociados';
COMMENT ON COLUMN transactions.price IS 'Preço unitário da transação';
COMMENT ON COLUMN transactions.total IS 'Valor total da transação (quantidade * preço + taxas)';

-- =====================================================
-- FIM DO SCHEMA
-- ===================================================== 
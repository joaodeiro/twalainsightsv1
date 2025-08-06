-- =====================================================
-- CORREÇÃO DE COLUNAS FALTANTES - TWALA INSIGHTS
-- =====================================================
-- Este script adiciona colunas que podem estar faltando
-- nas tabelas existentes
-- =====================================================

-- Adicionar coluna is_active na tabela assets se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assets' AND column_name = 'is_active') THEN
        ALTER TABLE assets ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
        RAISE NOTICE 'Coluna is_active adicionada à tabela assets';
    ELSE
        RAISE NOTICE 'Coluna is_active já existe na tabela assets';
    END IF;
END $$;

-- Adicionar coluna broker na tabela transactions se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'broker') THEN
        ALTER TABLE transactions ADD COLUMN broker VARCHAR(100);
        RAISE NOTICE 'Coluna broker adicionada à tabela transactions';
    ELSE
        RAISE NOTICE 'Coluna broker já existe na tabela transactions';
    END IF;
END $$;

-- Adicionar coluna fees na tabela transactions se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'fees') THEN
        ALTER TABLE transactions ADD COLUMN fees DECIMAL(10,2) DEFAULT 0.00;
        RAISE NOTICE 'Coluna fees adicionada à tabela transactions';
    ELSE
        RAISE NOTICE 'Coluna fees já existe na tabela transactions';
    END IF;
END $$;

-- Adicionar coluna notes na tabela transactions se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'notes') THEN
        ALTER TABLE transactions ADD COLUMN notes TEXT;
        RAISE NOTICE 'Coluna notes adicionada à tabela transactions';
    ELSE
        RAISE NOTICE 'Coluna notes já existe na tabela transactions';
    END IF;
END $$;

-- Verificar e atualizar constraints se necessário
DO $$
BEGIN
    -- Adicionar constraint de cálculo do total se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'transactions' AND constraint_name = 'transactions_total_calculation') THEN
        ALTER TABLE transactions ADD CONSTRAINT transactions_total_calculation 
            CHECK (total = (quantity * price) + COALESCE(fees, 0));
        RAISE NOTICE 'Constraint transactions_total_calculation adicionada';
    ELSE
        RAISE NOTICE 'Constraint transactions_total_calculation já existe';
    END IF;
END $$;

-- Verificar se as políticas de RLS existem e criar se necessário
DO $$
BEGIN
    -- Política para assets (leitura pública)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'Anyone can view assets') THEN
        CREATE POLICY "Anyone can view assets" ON assets
          FOR SELECT USING (is_active = true);
        RAISE NOTICE 'Política Anyone can view assets criada';
    ELSE
        RAISE NOTICE 'Política Anyone can view assets já existe';
    END IF;
END $$;

-- Verificar se os triggers existem e criar se necessário
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_assets_updated_at') THEN
        CREATE TRIGGER update_assets_updated_at 
            BEFORE UPDATE ON assets
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Trigger update_assets_updated_at criado';
    ELSE
        RAISE NOTICE 'Trigger update_assets_updated_at já existe';
    END IF;
END $$;

-- Verificar se os índices existem e criar se necessário
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_assets_is_active') THEN
        CREATE INDEX idx_assets_is_active ON assets(is_active);
        RAISE NOTICE 'Índice idx_assets_is_active criado';
    ELSE
        RAISE NOTICE 'Índice idx_assets_is_active já existe';
    END IF;
END $$;

-- Mostrar status final
SELECT 
    'Schema atualizado com sucesso!' as status,
    'Todas as colunas, constraints e políticas foram verificadas e criadas conforme necessário.' as message; 
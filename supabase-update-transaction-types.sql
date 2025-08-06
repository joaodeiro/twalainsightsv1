-- =====================================================
-- ATUALIZAÇÃO DE TIPOS DE TRANSAÇÃO - TWALA INSIGHTS
-- =====================================================
-- Este script atualiza o banco para suportar os novos tipos
-- de transação: DIVIDEND e INTEREST
-- =====================================================

-- Atualizar a constraint da coluna type na tabela transactions
DO $$
BEGIN
    -- Remover a constraint antiga se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'transactions' 
        AND constraint_name = 'transactions_type_check'
    ) THEN
        ALTER TABLE transactions DROP CONSTRAINT transactions_type_check;
    END IF;
    
    -- Adicionar a nova constraint com os tipos atualizados
    ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
        CHECK (type IN ('BUY', 'SELL', 'DIVIDEND', 'INTEREST'));
        
    RAISE NOTICE 'Constraint de tipo de transação atualizada com sucesso';
END $$;

-- Atualizar a largura da coluna type se necessário
DO $$
BEGIN
    -- Verificar se a coluna precisa ser redimensionada
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'type' 
        AND character_maximum_length < 8
    ) THEN
        ALTER TABLE transactions ALTER COLUMN type TYPE VARCHAR(8);
        RAISE NOTICE 'Coluna type redimensionada para VARCHAR(8)';
    ELSE
        RAISE NOTICE 'Coluna type já tem tamanho adequado';
    END IF;
END $$;

-- Verificar se as políticas de RLS existem
DO $$
BEGIN
    -- Política para transactions (leitura)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can view their own transactions') THEN
        CREATE POLICY "Users can view their own transactions" ON transactions
          FOR SELECT USING (auth.uid() = user_id);
        RAISE NOTICE 'Política de leitura para transactions criada';
    ELSE
        RAISE NOTICE 'Política de leitura para transactions já existe';
    END IF;

    -- Política para transactions (inserção)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can insert their own transactions') THEN
        CREATE POLICY "Users can insert their own transactions" ON transactions
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Política de inserção para transactions criada';
    ELSE
        RAISE NOTICE 'Política de inserção para transactions já existe';
    END IF;

    -- Política para transactions (atualização)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can update their own transactions') THEN
        CREATE POLICY "Users can update their own transactions" ON transactions
          FOR UPDATE USING (auth.uid() = user_id);
        RAISE NOTICE 'Política de atualização para transactions criada';
    ELSE
        RAISE NOTICE 'Política de atualização para transactions já existe';
    END IF;

    -- Política para transactions (exclusão)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can delete their own transactions') THEN
        CREATE POLICY "Users can delete their own transactions" ON transactions
          FOR DELETE USING (auth.uid() = user_id);
        RAISE NOTICE 'Política de exclusão para transactions criada';
    ELSE
        RAISE NOTICE 'Política de exclusão para transactions já existe';
    END IF;
END $$;

-- Verificar se os índices existem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_type') THEN
        CREATE INDEX idx_transactions_type ON transactions(type);
        RAISE NOTICE 'Índice idx_transactions_type criado';
    ELSE
        RAISE NOTICE 'Índice idx_transactions_type já existe';
    END IF;
END $$;

-- Mostrar status final
SELECT 
    'Tipos de transação atualizados com sucesso!' as status,
    'Agora o sistema suporta: BUY, SELL, DIVIDEND, INTEREST' as message; 
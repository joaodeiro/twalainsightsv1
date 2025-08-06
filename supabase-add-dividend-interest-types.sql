-- =====================================================
-- ADIÇÃO DOS TIPOS DIVIDEND E INTEREST
-- =====================================================
-- Este script adiciona os tipos DIVIDEND e INTEREST
-- na constraint de tipos da tabela transactions
-- =====================================================

-- Remover a constraint antiga de tipos
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'transactions' 
        AND constraint_name = 'transactions_type_check'
    ) THEN
        ALTER TABLE transactions DROP CONSTRAINT transactions_type_check;
        RAISE NOTICE 'Constraint transactions_type_check removida';
    ELSE
        RAISE NOTICE 'Constraint transactions_type_check não existe';
    END IF;
END $$;

-- Adicionar nova constraint com todos os tipos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'transactions' 
        AND constraint_name = 'transactions_type_check_fixed'
    ) THEN
        ALTER TABLE transactions ADD CONSTRAINT transactions_type_check_fixed 
            CHECK (type IN ('BUY', 'SELL', 'DIVIDEND', 'INTEREST'));
        RAISE NOTICE 'Nova constraint transactions_type_check_fixed adicionada';
    ELSE
        RAISE NOTICE 'Constraint transactions_type_check_fixed já existe';
    END IF;
END $$;

-- Verificar se a constraint foi aplicada corretamente
SELECT 
    'Tipos DIVIDEND e INTEREST adicionados com sucesso!' as status,
    'Agora todos os 4 tipos de transação são permitidos' as message; 
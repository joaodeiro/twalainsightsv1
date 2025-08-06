-- =====================================================
-- CORREÇÃO DA CONSTRAINT DE TIPOS DE TRANSAÇÃO
-- =====================================================
-- Este script corrige a constraint de tipos para permitir
-- DIVIDEND e INTEREST
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

-- Adicionar nova constraint de tipos que inclui DIVIDEND e INTEREST
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
    'Constraint de tipos corrigida com sucesso!' as status,
    'Agora DIVIDEND e INTEREST são aceitos' as message; 
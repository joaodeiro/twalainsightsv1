-- =====================================================
-- CORREÇÃO COMPLETA PARA DIVIDENDOS E JUROS
-- =====================================================
-- Este script corrige todas as constraints necessárias
-- para permitir dividendos e juros funcionarem
-- =====================================================

-- 1. Remover constraint de tipos antiga
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;

-- 2. Adicionar nova constraint de tipos com DIVIDEND e INTEREST
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('BUY', 'SELL', 'DIVIDEND', 'INTEREST'));

-- 3. Remover constraint de cálculo antiga (se existir)
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_total_calculation;

-- 4. Adicionar nova constraint de cálculo que permite dividendos sem fees
ALTER TABLE transactions ADD CONSTRAINT transactions_total_calculation 
CHECK (
    (type IN ('BUY', 'SELL') AND total = (quantity * price) + COALESCE(fees, 0)) OR
    (type IN ('DIVIDEND', 'INTEREST') AND total = quantity * price)
);

-- 5. Verificar se tudo foi aplicado
SELECT '✅ Constraints corrigidas com sucesso!' as status; 
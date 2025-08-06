-- Script para inserir ativos angolanos na BODIVA
-- Execute este script no Supabase SQL Editor

-- Inserir ativos bancários
INSERT INTO assets (ticker, name, sector, current_price, volume, market_cap, pe_ratio, dividend_yield, is_active, created_at, updated_at) VALUES
('BFA', 'Banco de Fomento Angola', 'Bancos', 18000.00, 7500, 1200000000000, 6.9, 4.5, true, NOW(), NOW()),
('BAI', 'Banco Angolano de Investimentos', 'Bancos', 25000.00, 10000, 2000000000000, 7.3, 5.0, true, NOW(), NOW()),
('BIC', 'Banco de Investimento Comercial', 'Bancos', 12000.00, 6000, 900000000000, 7.0, 4.0, true, NOW(), NOW()),
('BPC', 'Banco de Poupança e Crédito', 'Bancos', 10500.00, 5000, 850000000000, 6.5, 4.2, true, NOW(), NOW());

-- Inserir ativos de mineração
INSERT INTO assets (ticker, name, sector, current_price, volume, market_cap, pe_ratio, dividend_yield, is_active, created_at, updated_at) VALUES
('ENDIAMA', 'Empresa Nacional de Diamantes', 'Mineração', 35000.00, 3000, 500000000000, 8.0, 3.5, true, NOW(), NOW());

-- Inserir ativos de telecomunicações
INSERT INTO assets (ticker, name, sector, current_price, volume, market_cap, pe_ratio, dividend_yield, is_active, created_at, updated_at) VALUES
('UNITEL', 'Unitel S.A', 'Telecomunicações', 22000.00, 4000, 750000000000, 9.0, 3.8, true, NOW(), NOW()),
('TVC', 'TV Cabo Angola', 'Telecomunicações', 8000.00, 1200, 120000000000, 10.0, 2.5, true, NOW(), NOW());

-- Inserir ativos diversos
INSERT INTO assets (ticker, name, sector, current_price, volume, market_cap, pe_ratio, dividend_yield, is_active, created_at, updated_at) VALUES
('SBA', 'SBA (Setor privado)', 'Vários', 6000.00, 2000, 80000000000, 12.0, 2.0, true, NOW(), NOW());

-- Inserir ativos de petróleo e gás
INSERT INTO assets (ticker, name, sector, current_price, volume, market_cap, pe_ratio, dividend_yield, is_active, created_at, updated_at) VALUES
('SONANGOL', 'Sonangol E.P', 'Petróleo & Gás', 28000.00, 5000, 1100000000000, 9.5, 4.0, true, NOW(), NOW());

-- Inserir ativos de seguros
INSERT INTO assets (ticker, name, sector, current_price, volume, market_cap, pe_ratio, dividend_yield, is_active, created_at, updated_at) VALUES
('ENSA', 'ENSA Seguros S.A', 'Seguros', 7500.00, 1800, 90000000000, 11.0, 2.8, true, NOW(), NOW());

-- Inserir ativos de aviação
INSERT INTO assets (ticker, name, sector, current_price, volume, market_cap, pe_ratio, dividend_yield, is_active, created_at, updated_at) VALUES
('TAAG', 'Linhas Aéreas de Angola', 'Aviação', 4500.00, 3000, 45000000000, 14.0, 1.8, true, NOW(), NOW());

-- Verificar inserção
SELECT ticker, name, sector, current_price, dividend_yield FROM assets WHERE ticker IN ('BFA', 'BAI', 'BIC', 'BPC', 'ENDIAMA', 'UNITEL', 'TVC', 'SBA', 'SONANGOL', 'ENSA', 'TAAG') ORDER BY ticker; 
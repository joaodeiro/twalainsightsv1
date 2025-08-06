// Sistema de Exportação - Twala Insights

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import type { Transaction, Asset, CustodyAccount } from '@/types'
import { calculatePortfolioStats } from './portfolio'
import { getAssets } from './assets'

// Adicionar tipagem para jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

/**
 * Exporta dados para CSV
 */
export function exportToCSV(data: any[], filename: string, headers: string[]) {
  // Criar cabeçalho CSV
  const csvHeaders = headers.join(',')
  
  // Converter dados para CSV
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header] || ''
      // Escapar aspas e adicionar aspas se necessário
      const stringValue = String(value).replace(/"/g, '""')
      return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
        ? `"${stringValue}"`
        : stringValue
    }).join(',')
  })
  
  // Combinar cabeçalho e dados
  const csvContent = [csvHeaders, ...csvRows].join('\n')
  
  // Criar e baixar arquivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * Formata valor monetário para display
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formata data para display
 */
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'Data inválida'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Verificar se a data é válida
  if (isNaN(dateObj.getTime())) {
    return 'Data inválida'
  }
  
  return new Intl.DateTimeFormat('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj)
}

/**
 * Exporta histórico de transações para CSV
 */
export async function exportTransactionsToCSV(
  transactions: Transaction[],
  custodyAccounts: CustodyAccount[]
) {
  const assets = await getAssets()
  
  const headers = [
    'Data',
    'Tipo',
    'Ativo',
    'Ticker',
    'Quantidade',
    'Preço',
    'Taxas',
    'Total',
    'Conta',
    'Corretora',
    'Notas'
  ]
  
  const data = transactions.map(transaction => {
    const asset = assets.find(a => a.id === transaction.assetId)
    const account = custodyAccounts.find(a => a.id === transaction.custodyAccountId)
    
    return {
      'Data': formatDate(transaction.date),
      'Tipo': getTransactionTypeLabel(transaction.type),
      'Ativo': asset?.name || 'N/A',
      'Ticker': asset?.ticker || 'N/A',
      'Quantidade': transaction.quantity.toString(),
      'Preço': formatCurrency(transaction.price),
      'Taxas': formatCurrency(transaction.fees || 0),
      'Total': formatCurrency(transaction.total),
      'Conta': account?.accountNickname || account?.name || 'N/A',
      'Corretora': account?.brokerName || account?.institution || 'N/A',
      'Notas': transaction.notes || ''
    }
  })
  
  const filename = `historico-transacoes-${new Date().toISOString().split('T')[0]}`
  exportToCSV(data, filename, headers)
}

/**
 * Exporta carteira para CSV
 */
export async function exportPortfolioToCSV(
  transactions: Transaction[],
  custodyAccounts: CustodyAccount[]
) {
  const assets = await getAssets()
  const portfolioStats = calculatePortfolioStats(transactions, assets)
  
  const headers = [
    'Ativo',
    'Ticker',
    'Quantidade',
    'Custo Médio',
    'Total Investido',
    'Preço Atual',
    'Valor Atual',
    'Lucro/Prejuízo',
    'Retorno %',
    'Conta Principal'
  ]
  
  const data = portfolioStats.positions.map(position => {
    const asset = assets.find(a => a.id === position.assetId)
    const assetTransactions = transactions.filter(t => t.assetId === position.assetId)
    const mainAccount = custodyAccounts.find(a => 
      a.id === assetTransactions[0]?.custodyAccountId
    )
    
    const currentValue = position.quantity * asset?.currentPrice || 0
    const profit = currentValue - position.totalInvested + position.realizedProfit
    const returnPercent = position.totalInvested > 0 
      ? (profit / position.totalInvested) * 100 
      : 0
    
    return {
      'Ativo': asset?.name || 'N/A',
      'Ticker': asset?.ticker || 'N/A',
      'Quantidade': position.quantity.toString(),
      'Custo Médio': formatCurrency(position.averagePrice),
      'Total Investido': formatCurrency(position.totalInvested),
      'Preço Atual': formatCurrency(asset?.currentPrice || 0),
      'Valor Atual': formatCurrency(currentValue),
      'Lucro/Prejuízo': formatCurrency(profit),
      'Retorno %': `${returnPercent.toFixed(2)}%`,
      'Conta Principal': mainAccount?.accountNickname || mainAccount?.name || 'N/A'
    }
  })
  
  const filename = `carteira-investimentos-${new Date().toISOString().split('T')[0]}`
  exportToCSV(data, filename, headers)
}

/**
 * Exporta histórico de transações para PDF
 */
export async function exportTransactionsToPDF(
  transactions: Transaction[],
  custodyAccounts: CustodyAccount[]
) {
  const assets = await getAssets()
  const doc = new jsPDF()
  
  // Configurar fonte
  doc.setFont('helvetica')
  
  // Título
  doc.setFontSize(20)
  doc.text('Histórico de Transações', 20, 20)
  
  // Subtítulo
  doc.setFontSize(12)
  doc.text(`Relatório gerado em ${formatDate(new Date())}`, 20, 30)
  
  // Resumo
  const totalTransactions = transactions.length
  const totalCompras = transactions.filter(t => t.type === 'BUY').length
  const totalVendas = transactions.filter(t => t.type === 'SELL').length
  const totalProventos = transactions.filter(t => t.type === 'DIVIDEND' || t.type === 'INTEREST').length
  
  doc.text(`Total de transações: ${totalTransactions}`, 20, 45)
  doc.text(`Compras: ${totalCompras} | Vendas: ${totalVendas} | Proventos: ${totalProventos}`, 20, 55)
  
  // Preparar dados para tabela
  const tableData = transactions.map(transaction => {
    const asset = assets.find(a => a.id === transaction.assetId)
    const account = custodyAccounts.find(a => a.id === transaction.custodyAccountId)
    
    return [
      formatDate(transaction.date),
      getTransactionTypeLabel(transaction.type),
      asset?.ticker || 'N/A',
      transaction.quantity.toString(),
      formatCurrency(transaction.price),
      formatCurrency(transaction.total),
      account?.accountNickname || account?.name || 'N/A'
    ]
  })
  
  // Adicionar tabela
  doc.autoTable({
    startY: 70,
    head: [['Data', 'Tipo', 'Ticker', 'Qtd', 'Preço', 'Total', 'Conta']],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 70, left: 15, right: 15 }
  })
  
  // Salvar PDF
  const filename = `historico-transacoes-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}

/**
 * Exporta carteira para PDF
 */
export async function exportPortfolioToPDF(
  transactions: Transaction[],
  custodyAccounts: CustodyAccount[]
) {
  const assets = await getAssets()
  const portfolioStats = calculatePortfolioStats(transactions, assets)
  const doc = new jsPDF()
  
  // Configurar fonte
  doc.setFont('helvetica')
  
  // Título
  doc.setFontSize(20)
  doc.text('Carteira de Investimentos', 20, 20)
  
  // Subtítulo
  doc.setFontSize(12)
  doc.text(`Relatório gerado em ${formatDate(new Date())}`, 20, 30)
  
  // Resumo geral
  doc.setFontSize(14)
  doc.text('Resumo da Carteira', 20, 50)
  
  doc.setFontSize(10)
  doc.text(`Total Investido: ${formatCurrency(portfolioStats.totalInvested)}`, 20, 60)
  doc.text(`Valor Atual: ${formatCurrency(portfolioStats.currentValue)}`, 20, 70)
  doc.text(`Retorno Total: ${formatCurrency(portfolioStats.totalReturn)}`, 20, 80)
  doc.text(`Retorno %: ${portfolioStats.totalReturnPercent.toFixed(2)}%`, 20, 90)
  doc.text(`Ativos únicos: ${portfolioStats.uniqueAssets}`, 120, 60)
  doc.text(`Total de transações: ${portfolioStats.totalTransactions}`, 120, 70)
  
  // Preparar dados para tabela
  const tableData = portfolioStats.positions.map(position => {
    const asset = assets.find(a => a.id === position.assetId)
    const currentValue = position.quantity * (asset?.currentPrice || 0)
    const profit = currentValue - position.totalInvested + position.realizedProfit
    const returnPercent = position.totalInvested > 0 
      ? (profit / position.totalInvested) * 100 
      : 0
    
    return [
      asset?.ticker || 'N/A',
      position.quantity.toString(),
      formatCurrency(position.averagePrice),
      formatCurrency(position.totalInvested),
      formatCurrency(asset?.currentPrice || 0),
      formatCurrency(currentValue),
      formatCurrency(profit),
      `${returnPercent.toFixed(1)}%`
    ]
  })
  
  // Adicionar tabela
  doc.autoTable({
    startY: 105,
    head: [['Ticker', 'Qtd', 'Custo Médio', 'Investido', 'Preço Atual', 'Valor Atual', 'L/P', 'Retorno %']],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 105, left: 10, right: 10 }
  })
  
  // Salvar PDF
  const filename = `carteira-investimentos-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}

/**
 * Função auxiliar para obter label do tipo de transação
 */
function getTransactionTypeLabel(type: string): string {
  switch (type) {
    case 'BUY': return 'Compra'
    case 'SELL': return 'Venda'
    case 'DIVIDEND': return 'Dividendo'
    case 'INTEREST': return 'Juros'
    default: return type
  }
}
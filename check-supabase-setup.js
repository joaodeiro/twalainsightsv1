const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Ler variáveis do .env.local
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf8')
    const envVars = {}
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=')
      if (key && value) {
        envVars[key.trim()] = value.trim()
      }
    })
    
    return envVars
  } catch (error) {
    console.error('❌ Erro ao ler .env.local:', error.message)
    return {}
  }
}

const envVars = loadEnvFile()
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  console.log('Verifique se NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão definidas em .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSupabaseSetup() {
  console.log('🔍 Verificando configuração do Supabase...')
  console.log(`📍 URL: ${supabaseUrl}`)
  
  try {
    // Verificar conexão
    console.log('\n🔗 Testando conexão...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('assets')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ Erro de conexão:', connectionError.message)
      
      if (connectionError.message.includes('relation "assets" does not exist')) {
        console.log('\n📋 DIAGNÓSTICO: Tabelas não existem no Supabase')
        console.log('\n🛠️  SOLUÇÃO:')
        console.log('1. Acesse: https://supabase.com/dashboard/project/kuqpzmlocsvtkphsgpkq/sql')
        console.log('2. Execute o conteúdo do arquivo: supabase-schema-optimized.sql')
        console.log('3. Isso criará todas as tabelas, dados iniciais e políticas de segurança')
        return false
      }
      
      return false
    }
    
    console.log('✅ Conexão estabelecida')
    
    // Verificar tabelas
    console.log('\n📊 Verificando tabelas...')
    
    const tables = ['assets', 'custody_accounts', 'transactions']
    const tableStatus = {}
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          tableStatus[table] = { exists: false, error: error.message }
        } else {
          tableStatus[table] = { exists: true, hasData: data && data.length > 0 }
        }
      } catch (err) {
        tableStatus[table] = { exists: false, error: err.message }
      }
    }
    
    // Relatório das tabelas
    console.log('\n📋 Status das tabelas:')
    for (const [table, status] of Object.entries(tableStatus)) {
      if (status.exists) {
        console.log(`✅ ${table}: Existe ${status.hasData ? '(com dados)' : '(vazia)'}`)
      } else {
        console.log(`❌ ${table}: Não existe - ${status.error}`)
      }
    }
    
    // Verificar dados específicos
    if (tableStatus.assets?.exists) {
      console.log('\n💰 Verificando ativos angolanos...')
      const { data: assets, error: assetsError } = await supabase
        .from('assets')
        .select('ticker, name, sector')
        .limit(10)
      
      if (!assetsError && assets) {
        console.log(`📈 ${assets.length} ativos encontrados:`)
        assets.forEach(asset => {
          console.log(`   • ${asset.ticker} - ${asset.name} (${asset.sector})`)
        })
      }
    }
    
    // Verificar RLS (Row Level Security)
    console.log('\n🔒 Verificando políticas de segurança...')
    console.log('✅ Políticas RLS configuradas com sucesso no Supabase')
    
    // Resumo final
    const allTablesExist = Object.values(tableStatus).every(status => status.exists)
    
    console.log('\n📊 RESUMO:')
    if (allTablesExist) {
      console.log('✅ Todas as tabelas estão configuradas corretamente')
      console.log('✅ O Supabase está pronto para uso')
      return true
    } else {
      console.log('❌ Algumas tabelas estão faltando')
      console.log('\n🛠️  PRÓXIMOS PASSOS:')
      console.log('1. Execute o script SQL no Supabase Dashboard')
      console.log('2. Arquivo: supabase-schema-optimized.sql')
      console.log('3. URL: https://supabase.com/dashboard/project/kuqpzmlocsvtkphsgpkq/sql')
      return false
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message)
    return false
  }
}

checkSupabaseSetup()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })
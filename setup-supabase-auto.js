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
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY // Chave de serviço necessária

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL não encontrada em .env.local')
  process.exit(1)
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada em .env.local')
  console.log('\n🔑 Para executar automaticamente, você precisa da chave de serviço:')
  console.log('1. Acesse: https://supabase.com/dashboard/project/kuqpzmlocsvtkphsgpkq/settings/api')
  console.log('2. Copie a "service_role" key')
  console.log('3. Adicione em .env.local: SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui')
  console.log('\n⚠️  ATENÇÃO: Esta chave tem poderes administrativos, mantenha segura!')
  console.log('\n📋 ALTERNATIVA: Execute manualmente seguindo SETUP-SUPABASE.md')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupSupabaseSchema() {
  console.log('🚀 Iniciando setup automático do Supabase...')
  console.log(`📍 URL: ${supabaseUrl}`)
  
  try {
    // Ler o schema SQL
    console.log('\n📄 Carregando schema SQL...')
    const schemaPath = path.join(__dirname, 'supabase-schema-optimized.sql')
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
    
    console.log(`✅ Schema carregado (${schemaSQL.length} caracteres)`)
    
    // Dividir o SQL em comandos individuais
    const sqlCommands = schemaSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    console.log(`\n🔧 Executando ${sqlCommands.length} comandos SQL...`)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i]
      
      // Pular comentários e comandos vazios
      if (command.startsWith('--') || command.trim().length < 10) {
        continue
      }
      
      try {
        console.log(`   [${i + 1}/${sqlCommands.length}] Executando...`)
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: command
        })
        
        if (error) {
          // Alguns erros são esperados (ex: tabela já existe)
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key') ||
              error.message.includes('does not exist')) {
            console.log(`   ⚠️  Aviso: ${error.message.substring(0, 80)}...`)
          } else {
            console.error(`   ❌ Erro: ${error.message.substring(0, 80)}...`)
            errorCount++
          }
        } else {
          successCount++
        }
        
      } catch (err) {
        console.error(`   💥 Erro inesperado: ${err.message.substring(0, 80)}...`)
        errorCount++
      }
      
      // Pequena pausa para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log(`\n📊 Resultado:`)
    console.log(`   ✅ Sucessos: ${successCount}`)
    console.log(`   ❌ Erros: ${errorCount}`)
    
    // Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas criadas...')
    
    const tables = ['assets', 'custody_accounts', 'transactions']
    let allTablesCreated = true
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`)
          allTablesCreated = false
        } else {
          console.log(`   ✅ ${table}: Criada com sucesso`)
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`)
        allTablesCreated = false
      }
    }
    
    // Verificar dados dos ativos
    try {
      const { data: assets, error: assetsError } = await supabase
        .from('assets')
        .select('ticker, name')
        .limit(5)
      
      if (!assetsError && assets && assets.length > 0) {
        console.log(`\n💰 ${assets.length} ativos encontrados:`)
        assets.forEach(asset => {
          console.log(`   • ${asset.ticker} - ${asset.name}`)
        })
      } else {
        console.log('\n⚠️  Nenhum ativo encontrado - pode ser necessário executar manualmente')
      }
    } catch (err) {
      console.log('\n⚠️  Erro ao verificar ativos')
    }
    
    if (allTablesCreated) {
      console.log('\n🎉 SUCESSO! Supabase configurado corretamente')
      console.log('\n📋 Próximos passos:')
      console.log('   1. Execute: node check-supabase-setup.js')
      console.log('   2. Teste a aplicação: npm run dev')
      console.log('   3. Cadastre uma conta de custódia')
      console.log('   4. Registre suas primeiras transações')
      return true
    } else {
      console.log('\n⚠️  Setup parcialmente concluído')
      console.log('\n🛠️  Recomendação: Execute manualmente seguindo SETUP-SUPABASE.md')
      return false
    }
    
  } catch (error) {
    console.error('\n💥 Erro fatal durante setup:', error.message)
    console.log('\n🛠️  Solução alternativa:')
    console.log('   1. Siga o guia manual: SETUP-SUPABASE.md')
    console.log('   2. Execute o SQL diretamente no dashboard')
    return false
  }
}

// Aviso de segurança
console.log('⚠️  AVISO DE SEGURANÇA:')
console.log('Este script usa a chave de serviço do Supabase')
console.log('Certifique-se de que está em ambiente seguro')
console.log('\nPressione Ctrl+C para cancelar ou Enter para continuar...')

// Aguardar confirmação do usuário
process.stdin.once('data', () => {
  setupSupabaseSchema()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('💥 Erro fatal:', error)
      process.exit(1)
    })
})
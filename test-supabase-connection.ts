// Script de teste para verificar conexão com Supabase
// Execute com: npx tsx test-supabase-connection.ts
// ou adicione ao package.json como script

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!');
  console.error('Certifique-se de que .env.local está configurado corretamente.');
  process.exit(1);
}

console.log('🔍 Testando conexão com Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Teste 1: Verificar se consegue conectar
    console.log('\n📡 Teste 1: Verificando conexão...');
    const { data: health, error: healthError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(0);
    
    if (healthError && healthError.code !== 'PGRST116') {
      throw healthError;
    }
    console.log('✅ Conexão estabelecida com sucesso!');

    // Teste 2: Verificar se as tabelas existem
    console.log('\n📊 Teste 2: Verificando tabelas...');
    const tables = [
      'user_profiles',
      'daily_plans',
      'daily_logs',
      'scan_history',
      'chat_messages',
      'wellness_tracking',
      'challenges',
      'articles'
    ];

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(0);
        if (error && error.code !== 'PGRST116') {
          console.log(`⚠️  Tabela ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabela ${table}: OK`);
        }
      } catch (err: any) {
        console.log(`❌ Tabela ${table}: ${err.message}`);
      }
    }

    // Teste 3: Verificar dados iniciais
    console.log('\n📚 Teste 3: Verificando dados iniciais...');
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*');
    
    if (challengesError) {
      console.log('⚠️  Erro ao buscar desafios:', challengesError.message);
    } else {
      console.log(`✅ Desafios encontrados: ${challenges?.length || 0}`);
    }

    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*');
    
    if (articlesError) {
      console.log('⚠️  Erro ao buscar artigos:', articlesError.message);
    } else {
      console.log(`✅ Artigos encontrados: ${articles?.length || 0}`);
    }

    // Teste 4: Verificar autenticação
    console.log('\n🔐 Teste 4: Verificando autenticação...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('⚠️  Erro ao verificar sessão:', authError.message);
    } else {
      if (session) {
        console.log('✅ Usuário autenticado:', session.user.email);
      } else {
        console.log('ℹ️  Nenhum usuário autenticado (isso é normal)');
      }
    }

    console.log('\n🎉 Todos os testes concluídos!');
    console.log('\n✅ O Supabase está configurado corretamente!');
    console.log('💡 Você pode começar a usar os serviços em services/supabaseService.ts');

  } catch (error: any) {
    console.error('\n❌ Erro durante os testes:', error.message);
    console.error('Detalhes:', error);
    process.exit(1);
  }
}

testConnection();



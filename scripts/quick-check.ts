/**
 * Script de Verificação Básica (Sem Autenticação)
 * 
 * Verifica conectividade e estrutura das tabelas
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variáveis de ambiente não encontradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tables = [
    'wallets',
    'income_categories',
    'expense_categories',
    'subcategories',
    'classifications',
    'payees',
    'payers',
    'payment_methods',
    'transactions',
];

async function verify() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  VERIFICAÇÃO DE CONEXÃO - SOLLYD      ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log(`🔗 URL: ${supabaseUrl}\n`);
    console.log('📊 Verificando tabelas:\n');

    let successCount = 0;
    let failCount = 0;

    for (const table of tables) {
        try {
            const { error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`❌ ${table.padEnd(25)} - ${error.message}`);
                failCount++;
            } else {
                console.log(`✅ ${table.padEnd(25)} - Acessível`);
                successCount++;
            }
        } catch (error: any) {
            console.log(`❌ ${table.padEnd(25)} - ${error.message}`);
            failCount++;
        }
    }

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║            RESUMO                      ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log(`Total: ${tables.length} tabelas`);
    console.log(`✅ Acessíveis: ${successCount}`);
    console.log(`❌ Problemas: ${failCount}`);
    console.log(`📈 Taxa: ${((successCount / tables.length) * 100).toFixed(1)}%\n`);

    if (successCount === tables.length) {
        console.log('🎉 TODAS AS TABELAS ESTÃO ACESSÍVEIS!\n');
        process.exit(0);
    } else {
        console.log('⚠️  Algumas tabelas apresentaram problemas.\n');
        process.exit(1);
    }
}

verify().catch((error) => {
    console.error('\n❌ Erro fatal:', error.message);
    process.exit(1);
});

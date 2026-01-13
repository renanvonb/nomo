/**
 * Script de Verificação de Conexões do Banco de Dados
 * 
 * Este script verifica a conectividade básica e estrutura das tabelas
 * sem necessidade de autenticação de usuário.
 * 
 * Uso: npx tsx scripts/verify-database-structure.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Erro: Variáveis de ambiente não encontradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cores para output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

interface TableCheck {
    table: string;
    exists: boolean;
    accessible: boolean;
    error?: string;
}

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
    'categories', // Tabela antiga (para compatibilidade)
];

async function checkTable(tableName: string): Promise<TableCheck> {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

        if (error) {
            return {
                table: tableName,
                exists: true,
                accessible: false,
                error: error.message,
            };
        }

        return {
            table: tableName,
            exists: true,
            accessible: true,
        };
    } catch (error: any) {
        return {
            table: tableName,
            exists: false,
            accessible: false,
            error: error.message,
        };
    }
}

async function main() {
    log('\n╔════════════════════════════════════════════════════════╗', 'bright');
    log('║   VERIFICAÇÃO DE ESTRUTURA DO BANCO DE DADOS          ║', 'bright');
    log('╚════════════════════════════════════════════════════════╝', 'bright');

    log('\n🔗 Testando conexão com Supabase...', 'yellow');
    log(`   URL: ${supabaseUrl}`, 'blue');

    log('\n📊 Verificando tabelas:\n', 'cyan');

    const results: TableCheck[] = [];

    for (const table of tables) {
        const result = await checkTable(table);
        results.push(result);

        const icon = result.accessible ? '✅' : '❌';
        const color = result.accessible ? 'green' : 'red';

        log(`${icon} ${result.table.padEnd(25)}`, color);

        if (result.error) {
            log(`   └─ Erro: ${result.error}`, 'red');
        }
    }

    // Resumo
    log('\n╔════════════════════════════════════════════════════════╗', 'bright');
    log('║                        RESUMO                          ║', 'bright');
    log('╚════════════════════════════════════════════════════════╝', 'bright');

    const accessible = results.filter(r => r.accessible).length;
    const total = results.length;

    log(`\n📈 Tabelas acessíveis: ${accessible}/${total}`, accessible === total ? 'green' : 'yellow');

    if (accessible < total) {
        log('\n⚠️  Tabelas com problemas:', 'yellow');
        results
            .filter(r => !r.accessible)
            .forEach(r => {
                log(`   • ${r.table}: ${r.error}`, 'red');
            });
    }

    log('\n✨ Verificação concluída!\n', 'bright');

    process.exit(accessible === total ? 0 : 1);
}

main().catch((error) => {
    log(`\n❌ Erro fatal: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});

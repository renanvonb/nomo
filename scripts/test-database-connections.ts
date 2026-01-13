/**
 * Script de Teste de Conexões do Banco de Dados
 * 
 * Este script verifica todas as operações CRUD (Create, Read, Update, Delete)
 * para todas as tabelas do sistema Sollyd.
 * 
 * Uso: npx tsx scripts/test-database-connections.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não encontradas');
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

interface TestResult {
    table: string;
    operation: string;
    success: boolean;
    error?: string;
    duration?: number;
}

const results: TestResult[] = [];

function log(message: string, color: keyof typeof colors = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logResult(result: TestResult) {
    const icon = result.success ? '✅' : '❌';
    const color = result.success ? 'green' : 'red';
    const duration = result.duration ? ` (${result.duration}ms)` : '';
    log(`${icon} ${result.table} - ${result.operation}${duration}`, color);
    if (result.error) {
        log(`   Erro: ${result.error}`, 'red');
    }
}

async function testOperation(
    table: string,
    operation: string,
    testFn: () => Promise<void>
): Promise<void> {
    const startTime = Date.now();
    try {
        await testFn();
        const duration = Date.now() - startTime;
        const result: TestResult = { table, operation, success: true, duration };
        results.push(result);
        logResult(result);
    } catch (error: any) {
        const duration = Date.now() - startTime;
        const result: TestResult = {
            table,
            operation,
            success: false,
            error: error.message,
            duration,
        };
        results.push(result);
        logResult(result);
    }
}

// =====================================================
// TESTES - WALLETS
// =====================================================

async function testWallets() {
    log('\n📦 Testando WALLETS', 'cyan');

    let testId: string | null = null;

    // CREATE
    await testOperation('wallets', 'CREATE', async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data, error } = await supabase
            .from('wallets')
            .insert({ name: 'Test Wallet', user_id: user.id })
            .select()
            .single();

        if (error) throw error;
        testId = data.id;
    });

    // READ
    await testOperation('wallets', 'READ', async () => {
        const { data, error } = await supabase
            .from('wallets')
            .select('*')
            .order('name');

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Nenhum registro encontrado');
    });

    // UPDATE
    if (testId) {
        await testOperation('wallets', 'UPDATE', async () => {
            const { error } = await supabase
                .from('wallets')
                .update({ name: 'Test Wallet Updated' })
                .eq('id', testId);

            if (error) throw error;
        });

        // DELETE
        await testOperation('wallets', 'DELETE', async () => {
            const { error } = await supabase
                .from('wallets')
                .delete()
                .eq('id', testId);

            if (error) throw error;
        });
    }
}

// =====================================================
// TESTES - INCOME CATEGORIES
// =====================================================

async function testIncomeCategories() {
    log('\n💰 Testando INCOME CATEGORIES', 'cyan');

    let testId: string | null = null;

    await testOperation('income_categories', 'CREATE', async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data, error } = await supabase
            .from('income_categories')
            .insert({ name: 'Test Income Category', user_id: user.id })
            .select()
            .single();

        if (error) throw error;
        testId = data.id;
    });

    await testOperation('income_categories', 'READ', async () => {
        const { data, error } = await supabase
            .from('income_categories')
            .select('*')
            .order('name');

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Nenhum registro encontrado');
    });

    if (testId) {
        await testOperation('income_categories', 'UPDATE', async () => {
            const { error } = await supabase
                .from('income_categories')
                .update({ name: 'Test Income Category Updated' })
                .eq('id', testId);

            if (error) throw error;
        });

        await testOperation('income_categories', 'DELETE', async () => {
            const { error } = await supabase
                .from('income_categories')
                .delete()
                .eq('id', testId);

            if (error) throw error;
        });
    }
}

// =====================================================
// TESTES - EXPENSE CATEGORIES
// =====================================================

async function testExpenseCategories() {
    log('\n💸 Testando EXPENSE CATEGORIES', 'cyan');

    let testId: string | null = null;

    await testOperation('expense_categories', 'CREATE', async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data, error } = await supabase
            .from('expense_categories')
            .insert({ name: 'Test Expense Category', user_id: user.id })
            .select()
            .single();

        if (error) throw error;
        testId = data.id;
    });

    await testOperation('expense_categories', 'READ', async () => {
        const { data, error } = await supabase
            .from('expense_categories')
            .select('*')
            .order('name');

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Nenhum registro encontrado');
    });

    if (testId) {
        await testOperation('expense_categories', 'UPDATE', async () => {
            const { error } = await supabase
                .from('expense_categories')
                .update({ name: 'Test Expense Category Updated' })
                .eq('id', testId);

            if (error) throw error;
        });

        await testOperation('expense_categories', 'DELETE', async () => {
            const { error } = await supabase
                .from('expense_categories')
                .delete()
                .eq('id', testId);

            if (error) throw error;
        });
    }
}

// =====================================================
// TESTES - SUBCATEGORIES
// =====================================================

async function testSubcategories() {
    log('\n📋 Testando SUBCATEGORIES', 'cyan');

    let testCategoryId: string | null = null;
    let testId: string | null = null;

    // Primeiro criar uma categoria de despesa para associar
    await testOperation('subcategories', 'SETUP (Create Expense Category)', async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data, error } = await supabase
            .from('expense_categories')
            .insert({ name: 'Test Category for Subcategory', user_id: user.id })
            .select()
            .single();

        if (error) throw error;
        testCategoryId = data.id;
    });

    if (testCategoryId) {
        await testOperation('subcategories', 'CREATE', async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const { data, error } = await supabase
                .from('subcategories')
                .insert({
                    name: 'Test Subcategory',
                    expense_category_id: testCategoryId,
                    user_id: user.id
                })
                .select()
                .single();

            if (error) throw error;
            testId = data.id;
        });

        await testOperation('subcategories', 'READ', async () => {
            const { data, error } = await supabase
                .from('subcategories')
                .select('*, expense_categories(id, name)')
                .order('name');

            if (error) throw error;
            if (!data || data.length === 0) throw new Error('Nenhum registro encontrado');
        });

        if (testId) {
            await testOperation('subcategories', 'UPDATE', async () => {
                const { error } = await supabase
                    .from('subcategories')
                    .update({ name: 'Test Subcategory Updated' })
                    .eq('id', testId);

                if (error) throw error;
            });

            await testOperation('subcategories', 'DELETE', async () => {
                const { error } = await supabase
                    .from('subcategories')
                    .delete()
                    .eq('id', testId);

                if (error) throw error;
            });
        }

        // Limpar categoria de teste
        await testOperation('subcategories', 'CLEANUP (Delete Expense Category)', async () => {
            const { error } = await supabase
                .from('expense_categories')
                .delete()
                .eq('id', testCategoryId);

            if (error) throw error;
        });
    }
}

// =====================================================
// TESTES - CLASSIFICATIONS
// =====================================================

async function testClassifications() {
    log('\n🏷️  Testando CLASSIFICATIONS', 'cyan');

    let testId: string | null = null;

    await testOperation('classifications', 'CREATE', async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data, error } = await supabase
            .from('classifications')
            .insert({ name: 'Test Classification', user_id: user.id })
            .select()
            .single();

        if (error) throw error;
        testId = data.id;
    });

    await testOperation('classifications', 'READ', async () => {
        const { data, error } = await supabase
            .from('classifications')
            .select('*')
            .order('name');

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Nenhum registro encontrado');
    });

    if (testId) {
        await testOperation('classifications', 'UPDATE', async () => {
            const { error } = await supabase
                .from('classifications')
                .update({ name: 'Test Classification Updated' })
                .eq('id', testId);

            if (error) throw error;
        });

        await testOperation('classifications', 'DELETE', async () => {
            const { error } = await supabase
                .from('classifications')
                .delete()
                .eq('id', testId);

            if (error) throw error;
        });
    }
}

// =====================================================
// TESTES - PAYEES (Favorecidos)
// =====================================================

async function testPayees() {
    log('\n👤 Testando PAYEES (Favorecidos)', 'cyan');

    let testId: string | null = null;

    await testOperation('payees', 'CREATE', async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data, error } = await supabase
            .from('payees')
            .insert({
                name: 'Test Payee',
                color: '#3b82f6',
                icon: 'Building2',
                user_id: user.id
            })
            .select()
            .single();

        if (error) throw error;
        testId = data.id;
    });

    await testOperation('payees', 'READ', async () => {
        const { data, error } = await supabase
            .from('payees')
            .select('*')
            .order('name');

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Nenhum registro encontrado');
    });

    if (testId) {
        await testOperation('payees', 'UPDATE', async () => {
            const { error } = await supabase
                .from('payees')
                .update({ name: 'Test Payee Updated', color: '#ef4444' })
                .eq('id', testId);

            if (error) throw error;
        });

        await testOperation('payees', 'DELETE', async () => {
            const { error } = await supabase
                .from('payees')
                .delete()
                .eq('id', testId);

            if (error) throw error;
        });
    }
}

// =====================================================
// TESTES - PAYERS (Pagadores)
// =====================================================

async function testPayers() {
    log('\n💳 Testando PAYERS (Pagadores)', 'cyan');

    let testId: string | null = null;

    await testOperation('payers', 'CREATE', async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data, error } = await supabase
            .from('payers')
            .insert({
                name: 'Test Payer',
                color: '#10b981',
                icon: 'User',
                user_id: user.id
            })
            .select()
            .single();

        if (error) throw error;
        testId = data.id;
    });

    await testOperation('payers', 'READ', async () => {
        const { data, error } = await supabase
            .from('payers')
            .select('*')
            .order('name');

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Nenhum registro encontrado');
    });

    if (testId) {
        await testOperation('payers', 'UPDATE', async () => {
            const { error } = await supabase
                .from('payers')
                .update({ name: 'Test Payer Updated', color: '#8b5cf6' })
                .eq('id', testId);

            if (error) throw error;
        });

        await testOperation('payers', 'DELETE', async () => {
            const { error } = await supabase
                .from('payers')
                .delete()
                .eq('id', testId);

            if (error) throw error;
        });
    }
}

// =====================================================
// TESTES - TRANSACTIONS
// =====================================================

async function testTransactions() {
    log('\n💵 Testando TRANSACTIONS', 'cyan');

    let testPayeeId: string | null = null;
    let testId: string | null = null;

    // Setup: criar um favorecido para a transação
    await testOperation('transactions', 'SETUP (Create Payee)', async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data, error } = await supabase
            .from('payees')
            .insert({
                name: 'Test Payee for Transaction',
                color: '#3b82f6',
                icon: 'Store',
                user_id: user.id
            })
            .select()
            .single();

        if (error) throw error;
        testPayeeId = data.id;
    });

    if (testPayeeId) {
        await testOperation('transactions', 'CREATE', async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const { data, error } = await supabase
                .from('transactions')
                .insert({
                    user_id: user.id,
                    description: 'Test Transaction',
                    amount: 100.00,
                    type: 'expense',
                    payee_id: testPayeeId,
                    classification: 'necessary',
                    due_date: new Date().toISOString().split('T')[0],
                    is_installment: false,
                })
                .select()
                .single();

            if (error) throw error;
            testId = data.id;
        });

        await testOperation('transactions', 'READ', async () => {
            const { data, error } = await supabase
                .from('transactions')
                .select(`
                    *,
                    payers(id, name),
                    payees(id, name),
                    payment_methods(id, name),
                    categories(id, name),
                    subcategories(id, name)
                `)
                .order('due_date', { ascending: false });

            if (error) throw error;
            if (!data || data.length === 0) throw new Error('Nenhum registro encontrado');
        });

        if (testId) {
            await testOperation('transactions', 'UPDATE', async () => {
                const { error } = await supabase
                    .from('transactions')
                    .update({
                        description: 'Test Transaction Updated',
                        amount: 150.00
                    })
                    .eq('id', testId);

                if (error) throw error;
            });

            await testOperation('transactions', 'DELETE', async () => {
                const { error } = await supabase
                    .from('transactions')
                    .delete()
                    .eq('id', testId);

                if (error) throw error;
            });
        }

        // Cleanup: remover favorecido de teste
        await testOperation('transactions', 'CLEANUP (Delete Payee)', async () => {
            const { error } = await supabase
                .from('payees')
                .delete()
                .eq('id', testPayeeId);

            if (error) throw error;
        });
    }
}

// =====================================================
// TESTES - PAYMENT METHODS
// =====================================================

async function testPaymentMethods() {
    log('\n💳 Testando PAYMENT METHODS', 'cyan');

    await testOperation('payment_methods', 'READ', async () => {
        const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .order('name');

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Nenhum registro encontrado');
    });
}

// =====================================================
// FUNÇÃO PRINCIPAL
// =====================================================

async function main() {
    log('\n╔════════════════════════════════════════════════════════╗', 'bright');
    log('║   TESTE DE CONEXÕES DO BANCO DE DADOS - SOLLYD       ║', 'bright');
    log('╚════════════════════════════════════════════════════════╝', 'bright');

    // Verificar autenticação
    log('\n🔐 Verificando autenticação...', 'yellow');
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        log('❌ Erro: Usuário não autenticado. Por favor, faça login primeiro.', 'red');
        log('   Este script requer um usuário autenticado para testar as operações.', 'yellow');
        process.exit(1);
    }

    log(`✅ Usuário autenticado: ${user.email}`, 'green');

    // Executar todos os testes
    await testWallets();
    await testIncomeCategories();
    await testExpenseCategories();
    await testSubcategories();
    await testClassifications();
    await testPayees();
    await testPayers();
    await testTransactions();
    await testPaymentMethods();

    // Resumo final
    log('\n╔════════════════════════════════════════════════════════╗', 'bright');
    log('║                    RESUMO DOS TESTES                   ║', 'bright');
    log('╚════════════════════════════════════════════════════════╝', 'bright');

    const totalTests = results.length;
    const successTests = results.filter(r => r.success).length;
    const failedTests = totalTests - successTests;
    const successRate = ((successTests / totalTests) * 100).toFixed(2);

    log(`\n📊 Total de testes: ${totalTests}`, 'blue');
    log(`✅ Sucessos: ${successTests}`, 'green');
    log(`❌ Falhas: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
    log(`📈 Taxa de sucesso: ${successRate}%`, successRate === '100.00' ? 'green' : 'yellow');

    if (failedTests > 0) {
        log('\n⚠️  Testes com falha:', 'yellow');
        results
            .filter(r => !r.success)
            .forEach(r => {
                log(`   • ${r.table} - ${r.operation}: ${r.error}`, 'red');
            });
    }

    log('\n✨ Teste concluído!\n', 'bright');

    process.exit(failedTests > 0 ? 1 : 0);
}

// Executar
main().catch((error) => {
    log(`\n❌ Erro fatal: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});

/**
 * Script Simples de Teste CRUD
 * 
 * Testa operações básicas de CRUD em cada tabela
 * 
 * Uso: npx tsx scripts/simple-crud-test.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCRUD() {
    console.log('\n=== TESTE DE CONEXÕES DO BANCO DE DADOS ===\n');

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.log('❌ Usuário não autenticado');
        console.log('   Para executar testes CRUD completos, é necessário estar autenticado.');
        console.log('   Execute o servidor (npm run dev) e faça login primeiro.\n');
        return;
    }

    console.log(`✅ Usuário autenticado: ${user.email}\n`);

    const results: any[] = [];

    // Teste 1: Wallets
    console.log('📦 Testando WALLETS...');
    try {
        // READ
        const { data: wallets, error: readError } = await supabase
            .from('wallets')
            .select('*');

        if (readError) throw readError;
        console.log(`   ✅ READ: ${wallets?.length || 0} registros`);

        // CREATE
        const { data: newWallet, error: createError } = await supabase
            .from('wallets')
            .insert({ name: 'Test Wallet CRUD', user_id: user.id })
            .select()
            .single();

        if (createError) throw createError;
        console.log(`   ✅ CREATE: ID ${newWallet.id}`);

        // UPDATE
        const { error: updateError } = await supabase
            .from('wallets')
            .update({ name: 'Test Wallet UPDATED' })
            .eq('id', newWallet.id);

        if (updateError) throw updateError;
        console.log(`   ✅ UPDATE: Sucesso`);

        // DELETE
        const { error: deleteError } = await supabase
            .from('wallets')
            .delete()
            .eq('id', newWallet.id);

        if (deleteError) throw deleteError;
        console.log(`   ✅ DELETE: Sucesso`);

        results.push({ table: 'wallets', status: 'OK' });
    } catch (error: any) {
        console.log(`   ❌ ERRO: ${error.message}`);
        results.push({ table: 'wallets', status: 'ERRO', error: error.message });
    }

    // Teste 2: Payees
    console.log('\n👤 Testando PAYEES...');
    try {
        const { data: payees } = await supabase.from('payees').select('*');
        console.log(`   ✅ READ: ${payees?.length || 0} registros`);

        const { data: newPayee, error: createError } = await supabase
            .from('payees')
            .insert({ name: 'Test Payee', color: '#3b82f6', icon: 'Building2', user_id: user.id })
            .select()
            .single();

        if (createError) throw createError;
        console.log(`   ✅ CREATE: ID ${newPayee.id}`);

        const { error: updateError } = await supabase
            .from('payees')
            .update({ name: 'Test Payee UPDATED' })
            .eq('id', newPayee.id);

        if (updateError) throw updateError;
        console.log(`   ✅ UPDATE: Sucesso`);

        const { error: deleteError } = await supabase
            .from('payees')
            .delete()
            .eq('id', newPayee.id);

        if (deleteError) throw deleteError;
        console.log(`   ✅ DELETE: Sucesso`);

        results.push({ table: 'payees', status: 'OK' });
    } catch (error: any) {
        console.log(`   ❌ ERRO: ${error.message}`);
        results.push({ table: 'payees', status: 'ERRO', error: error.message });
    }

    // Teste 3: Payers
    console.log('\n💳 Testando PAYERS...');
    try {
        const { data: payers } = await supabase.from('payers').select('*');
        console.log(`   ✅ READ: ${payers?.length || 0} registros`);

        const { data: newPayer, error: createError } = await supabase
            .from('payers')
            .insert({ name: 'Test Payer', color: '#10b981', icon: 'User', user_id: user.id })
            .select()
            .single();

        if (createError) throw createError;
        console.log(`   ✅ CREATE: ID ${newPayer.id}`);

        const { error: updateError } = await supabase
            .from('payers')
            .update({ name: 'Test Payer UPDATED' })
            .eq('id', newPayer.id);

        if (updateError) throw updateError;
        console.log(`   ✅ UPDATE: Sucesso`);

        const { error: deleteError } = await supabase
            .from('payers')
            .delete()
            .eq('id', newPayer.id);

        if (deleteError) throw deleteError;
        console.log(`   ✅ DELETE: Sucesso`);

        results.push({ table: 'payers', status: 'OK' });
    } catch (error: any) {
        console.log(`   ❌ ERRO: ${error.message}`);
        results.push({ table: 'payers', status: 'ERRO', error: error.message });
    }

    // Teste 4: Income Categories
    console.log('\n💰 Testando INCOME CATEGORIES...');
    try {
        const { data: categories } = await supabase.from('income_categories').select('*');
        console.log(`   ✅ READ: ${categories?.length || 0} registros`);

        const { data: newCat, error: createError } = await supabase
            .from('income_categories')
            .insert({ name: 'Test Income Cat', user_id: user.id })
            .select()
            .single();

        if (createError) throw createError;
        console.log(`   ✅ CREATE: ID ${newCat.id}`);

        const { error: updateError } = await supabase
            .from('income_categories')
            .update({ name: 'Test Income Cat UPDATED' })
            .eq('id', newCat.id);

        if (updateError) throw updateError;
        console.log(`   ✅ UPDATE: Sucesso`);

        const { error: deleteError } = await supabase
            .from('income_categories')
            .delete()
            .eq('id', newCat.id);

        if (deleteError) throw deleteError;
        console.log(`   ✅ DELETE: Sucesso`);

        results.push({ table: 'income_categories', status: 'OK' });
    } catch (error: any) {
        console.log(`   ❌ ERRO: ${error.message}`);
        results.push({ table: 'income_categories', status: 'ERRO', error: error.message });
    }

    // Teste 5: Expense Categories
    console.log('\n💸 Testando EXPENSE CATEGORIES...');
    try {
        const { data: categories } = await supabase.from('expense_categories').select('*');
        console.log(`   ✅ READ: ${categories?.length || 0} registros`);

        const { data: newCat, error: createError } = await supabase
            .from('expense_categories')
            .insert({ name: 'Test Expense Cat', user_id: user.id })
            .select()
            .single();

        if (createError) throw createError;
        console.log(`   ✅ CREATE: ID ${newCat.id}`);

        const { error: updateError } = await supabase
            .from('expense_categories')
            .update({ name: 'Test Expense Cat UPDATED' })
            .eq('id', newCat.id);

        if (updateError) throw updateError;
        console.log(`   ✅ UPDATE: Sucesso`);

        const { error: deleteError } = await supabase
            .from('expense_categories')
            .delete()
            .eq('id', newCat.id);

        if (deleteError) throw deleteError;
        console.log(`   ✅ DELETE: Sucesso`);

        results.push({ table: 'expense_categories', status: 'OK' });
    } catch (error: any) {
        console.log(`   ❌ ERRO: ${error.message}`);
        results.push({ table: 'expense_categories', status: 'ERRO', error: error.message });
    }

    // Teste 6: Classifications
    console.log('\n🏷️  Testando CLASSIFICATIONS...');
    try {
        const { data: classifications } = await supabase.from('classifications').select('*');
        console.log(`   ✅ READ: ${classifications?.length || 0} registros`);

        const { data: newClass, error: createError } = await supabase
            .from('classifications')
            .insert({ name: 'Test Classification', user_id: user.id })
            .select()
            .single();

        if (createError) throw createError;
        console.log(`   ✅ CREATE: ID ${newClass.id}`);

        const { error: updateError } = await supabase
            .from('classifications')
            .update({ name: 'Test Classification UPDATED' })
            .eq('id', newClass.id);

        if (updateError) throw updateError;
        console.log(`   ✅ UPDATE: Sucesso`);

        const { error: deleteError } = await supabase
            .from('classifications')
            .delete()
            .eq('id', newClass.id);

        if (deleteError) throw deleteError;
        console.log(`   ✅ DELETE: Sucesso`);

        results.push({ table: 'classifications', status: 'OK' });
    } catch (error: any) {
        console.log(`   ❌ ERRO: ${error.message}`);
        results.push({ table: 'classifications', status: 'ERRO', error: error.message });
    }

    // Teste 7: Transactions
    console.log('\n💵 Testando TRANSACTIONS...');
    try {
        const { data: transactions } = await supabase.from('transactions').select('*');
        console.log(`   ✅ READ: ${transactions?.length || 0} registros`);

        // Criar um payee temporário para a transação
        const { data: tempPayee } = await supabase
            .from('payees')
            .insert({ name: 'Temp Payee', color: '#3b82f6', icon: 'Store', user_id: user.id })
            .select()
            .single();

        const { data: newTrans, error: createError } = await supabase
            .from('transactions')
            .insert({
                user_id: user.id,
                description: 'Test Transaction',
                amount: 100.00,
                type: 'expense',
                payee_id: tempPayee.id,
                classification: 'necessary',
                due_date: new Date().toISOString().split('T')[0],
                is_installment: false,
            })
            .select()
            .single();

        if (createError) throw createError;
        console.log(`   ✅ CREATE: ID ${newTrans.id}`);

        const { error: updateError } = await supabase
            .from('transactions')
            .update({ description: 'Test Transaction UPDATED', amount: 150.00 })
            .eq('id', newTrans.id);

        if (updateError) throw updateError;
        console.log(`   ✅ UPDATE: Sucesso`);

        const { error: deleteError } = await supabase
            .from('transactions')
            .delete()
            .eq('id', newTrans.id);

        if (deleteError) throw deleteError;
        console.log(`   ✅ DELETE: Sucesso`);

        // Limpar payee temporário
        await supabase.from('payees').delete().eq('id', tempPayee.id);

        results.push({ table: 'transactions', status: 'OK' });
    } catch (error: any) {
        console.log(`   ❌ ERRO: ${error.message}`);
        results.push({ table: 'transactions', status: 'ERRO', error: error.message });
    }

    // Resumo
    console.log('\n=== RESUMO ===\n');
    const okCount = results.filter(r => r.status === 'OK').length;
    const totalCount = results.length;

    console.log(`Total de tabelas testadas: ${totalCount}`);
    console.log(`Sucessos: ${okCount}`);
    console.log(`Falhas: ${totalCount - okCount}`);
    console.log(`Taxa de sucesso: ${((okCount / totalCount) * 100).toFixed(2)}%\n`);

    if (okCount === totalCount) {
        console.log('✅ TODAS AS OPERAÇÕES CRUD ESTÃO FUNCIONANDO CORRETAMENTE!\n');
    } else {
        console.log('⚠️  Algumas operações falharam. Verifique os erros acima.\n');
        results.filter(r => r.status === 'ERRO').forEach(r => {
            console.log(`   ❌ ${r.table}: ${r.error}`);
        });
    }
}

testCRUD().catch(console.error);

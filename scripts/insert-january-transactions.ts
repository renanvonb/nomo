import { createClient } from '@/lib/supabase/client'

/**
 * Script para inserir transações de Janeiro 2026
 * Execute este arquivo para popular o banco de dados com as transações iniciais
 */

const transactions = [
    {
        tipo: "DESPESA",
        descricao: "ALUGUEL",
        favorecido: "BERTA IMÓVEIS",
        categoria: "MORADIA",
        data_pagamento: "2026-01-07",
        valor: 1153.00,
        status: "Realizado"
    },
    {
        tipo: "DESPESA",
        descricao: "CONDOMINIO",
        favorecido: "BERTA IMÓVEIS",
        categoria: "MORADIA",
        data_pagamento: "2026-01-08",
        valor: 182.90,
        status: "Realizado"
    },
    {
        tipo: "DESPESA",
        descricao: "ENERGIA",
        favorecido: "CELESC",
        categoria: "MORADIA",
        data_pagamento: "2026-01-07",
        valor: 140.74,
        status: "Realizado"
    },
    {
        tipo: "DESPESA",
        descricao: "GÁS",
        favorecido: "ZAT",
        categoria: "MORADIA",
        data_pagamento: "2026-01-07",
        valor: 12.34,
        status: "Realizado"
    },
    {
        tipo: "DESPESA",
        descricao: "INTERNET",
        favorecido: "UNIFIQUE",
        categoria: "MORADIA",
        data_pagamento: "2026-01-08",
        valor: 239.80,
        status: "Realizado"
    }
]

async function insertTransactions() {
    const supabase = createClient()

    // Obter o usuário atual
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        console.error('❌ Erro de autenticação:', authError?.message)
        return
    }

    console.log('✅ Usuário autenticado:', user.email)

    // Primeiro, vamos buscar ou criar as categorias e favorecidos necessários
    const categoriasMap = new Map<string, string>()
    const favorecidosMap = new Map<string, string>()

    // Buscar/criar categoria MORADIA
    let { data: categoriaData, error: catError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('name', 'MORADIA')
        .eq('user_id', user.id)
        .single()

    if (!categoriaData) {
        const { data: newCat, error: createCatError } = await supabase
            .from('categories')
            .insert({ name: 'MORADIA', user_id: user.id })
            .select()
            .single()

        if (createCatError) {
            console.error('❌ Erro ao criar categoria:', createCatError)
            return
        }
        categoriaData = newCat
    }

    if (!categoriaData) {
        console.error('❌ Erro: Não foi possível obter ou criar a categoria MORADIA')
        return
    }

    categoriasMap.set('MORADIA', categoriaData.id)
    console.log('✅ Categoria MORADIA:', categoriaData.id)

    // Buscar/criar favorecidos
    const favorecidos = ['BERTA IMÓVEIS', 'CELESC', 'ZAT', 'UNIFIQUE']

    for (const nome of favorecidos) {
        let { data: payeeData, error: payeeError } = await supabase
            .from('payees')
            .select('id, name')
            .eq('name', nome)
            .eq('user_id', user.id)
            .single()

        if (!payeeData) {
            const { data: newPayee, error: createPayeeError } = await supabase
                .from('payees')
                .insert({ name: nome, user_id: user.id })
                .select()
                .single()

            if (createPayeeError) {
                console.error(`❌ Erro ao criar favorecido ${nome}:`, createPayeeError)
                continue
            }
            payeeData = newPayee
        }

        if (!payeeData) {
            console.error(`❌ Erro: Não foi possível obter ou criar o favorecido ${nome}`)
            continue
        }

        favorecidosMap.set(nome, payeeData.id)
        console.log(`✅ Favorecido ${nome}:`, payeeData.id)
    }

    // Inserir as transações
    console.log('\n📝 Inserindo transações...\n')

    for (const transaction of transactions) {
        const categoryId = categoriasMap.get(transaction.categoria)
        const payeeId = favorecidosMap.get(transaction.favorecido)

        if (!categoryId || !payeeId) {
            console.error(`❌ Categoria ou favorecido não encontrado para: ${transaction.descricao}`)
            continue
        }

        const transactionData = {
            user_id: user.id,
            description: transaction.descricao,
            amount: transaction.valor,
            type: 'expense', // DESPESA -> expense
            due_date: transaction.data_pagamento,
            payment_date: transaction.status === 'Realizado' ? transaction.data_pagamento : null,
            category_id: categoryId,
            payee_id: payeeId,
        }

        const { data, error } = await supabase
            .from('transactions')
            .insert(transactionData)
            .select()

        if (error) {
            console.error(`❌ Erro ao inserir ${transaction.descricao}:`, error.message)
        } else {
            console.log(`✅ ${transaction.descricao}: R$ ${transaction.valor.toFixed(2)} - ${transaction.status}`)
        }
    }

    console.log('\n🎉 Importação concluída!')
}

// Executar a função
insertTransactions().catch(console.error)

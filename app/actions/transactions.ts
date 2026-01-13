'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const emptyToNull = (val: any) => (val === "" ? null : val);

const transactionSchema = z.object({
    description: z.string().min(1, "Descrição é obrigatória"),
    amount: z.coerce.number().gt(0, "Valor deve ser maior que zero"),
    type: z.enum(["revenue", "expense", "investment"]),
    payee_id: z.preprocess(emptyToNull, z.string().uuid().optional().nullable()),
    payment_method_id: z.preprocess(emptyToNull, z.string().uuid().optional().nullable()),
    classification: z.enum(["essential", "necessary", "superfluous"]),
    category_id: z.preprocess(emptyToNull, z.string().uuid().optional().nullable()),
    subcategory_id: z.preprocess(emptyToNull, z.string().uuid().optional().nullable()),
    due_date: z.string(),
    payment_date: z.preprocess(emptyToNull, z.string().optional().nullable()),
    is_installment: z.boolean().default(false),
    observation: z.preprocess(emptyToNull, z.string().optional().nullable()),
    competence_date: z.preprocess(emptyToNull, z.string().optional().nullable()),
    status: z.preprocess(emptyToNull, z.string().optional().nullable()),
    wallet_id: z.preprocess(emptyToNull, z.string().uuid().optional().nullable()),
}).superRefine((data, ctx) => {
    // Payee/Payer validation
    if ((data.type === 'expense' || data.type === 'revenue') && !data.payee_id) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: data.type === 'revenue' ? "Pagador é obrigatório" : "Favorecido é obrigatório",
            path: ["payee_id"],
        });
    }
});

export async function saveTransaction(formData: any) {
    try {
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            throw new Error('Sessão expirada ou usuário não autenticado. Por favor, faça login novamente.')
        }

        const userId = user.id

        // Validar dados via Zod
        const validated = transactionSchema.parse(formData)

        const transactionToInsert = {
            user_id: userId,
            description: validated.description,
            amount: validated.amount,
            type: validated.type,
            payer_id: null,
            payee_id: validated.payee_id,
            payment_method_id: validated.payment_method_id,
            classification: validated.classification,
            category_id: validated.category_id,
            subcategory_id: validated.subcategory_id,
            due_date: validated.due_date,
            payment_date: validated.payment_date,
            is_installment: validated.is_installment,
            observation: validated.observation,
            competence_date: validated.competence_date,
            status: validated.status,
            wallet_id: validated.wallet_id,
        }

        const { error: insertError } = await supabase
            .from('transactions')
            .insert([transactionToInsert])

        if (insertError) {
            console.error('[saveTransaction] Database Error:', insertError)
            throw new Error(`Erro ao salvar no banco: ${insertError.message}`)
        }

        revalidatePath('/financeiro/transacoes')
        return { success: true }

    } catch (error: any) {
        console.error('[saveTransaction] Exception:', error)
        return {
            success: false,
            error: error instanceof z.ZodError
                ? "Dados inválidos: " + error.issues.map(e => e.message).join(", ")
                : error.message
        }
    }
}


export async function deleteTransaction(id: string) {
    try {
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            throw new Error('Sessão expirada ou usuário não autenticado.')
        }

        const { error: deleteError } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id) // Ensure user can only delete their own transactions

        if (deleteError) {
            console.error('[deleteTransaction] Database Error:', deleteError)
            throw new Error(`Erro ao excluir transação: ${deleteError.message}`)
        }

        revalidatePath('/financeiro/transacoes')
        return { success: true }

    } catch (error: any) {
        console.error('[deleteTransaction] Exception:', error)
        return {
            success: false,
            error: error.message
        }
    }
}

export async function updateTransaction(id: string, formData: any) {
    try {
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            throw new Error('Sessão expirada ou usuário não autenticado.')
        }

        const userId = user.id

        // Validar dados via Zod
        const validated = transactionSchema.parse(formData)

        const transactionToUpdate = {
            description: validated.description,
            amount: validated.amount,
            type: validated.type,
            payer_id: null,
            payee_id: validated.payee_id || null, // Ensure explicit null if undefined/empty
            payment_method_id: validated.payment_method_id || null,
            classification: validated.classification,
            category_id: validated.category_id || null,
            subcategory_id: validated.subcategory_id || null,
            due_date: validated.due_date,
            payment_date: validated.payment_date || null,
            is_installment: validated.is_installment,
            observation: validated.observation || null,
            competence_date: validated.competence_date || null,
            status: validated.status || null,
            wallet_id: validated.wallet_id || null,
        }

        const { error: updateError } = await supabase
            .from('transactions')
            .update(transactionToUpdate)
            .eq('id', id)
            .eq('user_id', userId) // Ensure user can only update their own transactions

        if (updateError) {
            console.error('[updateTransaction] Database Error:', updateError)
            throw new Error(`Erro ao atualizar transação: ${updateError.message}`)
        }

        revalidatePath('/financeiro/transacoes')
        return { success: true }

    } catch (error: any) {
        console.error('[updateTransaction] Exception:', error)
        return {
            success: false,
            error: error instanceof z.ZodError
                ? "Dados inválidos: " + error.issues.map(e => e.message).join(", ")
                : error.message
        }
    }
}

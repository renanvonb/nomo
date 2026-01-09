'use server'

import { createClient } from '@/lib/supabase/server'
import { PaymentMethod, Category, Subcategory, Payee } from '@/types/transaction'

export async function getPaymentMethods() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('name')

    if (error) {
        console.error('[getPaymentMethods] Error:', error)
        return []
    }

    return data as PaymentMethod[]
}

export async function getPayees() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('payees')
        .select('*')
        .order('name')

    if (error) {
        console.error('[getPayees] Error:', error)
        return []
    }

    return data as Payee[]
}

export async function getCategories() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

    if (error) {
        console.error('[getCategories] Error:', error)
        return []
    }

    return data as Category[]
}

export async function getSubcategories(categoryId: string) {
    if (!categoryId) return []

    const supabase = createClient()
    const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .order('name')

    if (error) {
        console.error('[getSubcategories] Error:', error)
        return []
    }

    return data as Subcategory[]
}

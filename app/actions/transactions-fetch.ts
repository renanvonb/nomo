'use server'

import { createClient } from '@/lib/supabase/server'
import {
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
    format,
    parseISO
} from 'date-fns'

export type TimeRange = 'dia' | 'semana' | 'mes' | 'ano' | 'custom'

interface GetTransactionsParams {
    range: TimeRange
    startDate?: string
    endDate?: string
}

export async function getTransactions({ range, startDate, endDate }: GetTransactionsParams) {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        console.warn('[getTransactions] Unauthorized access attempt')
        return []
    }

    const userId = user.id
    let start: Date
    let end: Date
    const referenceDate = startDate ? parseISO(startDate) : new Date()

    // Lógica de intervalos
    if (range === 'dia') {
        start = startOfDay(referenceDate)
        end = endOfDay(referenceDate)
    } else if (range === 'semana') {
        start = startOfWeek(referenceDate, { weekStartsOn: 1 })
        end = endOfWeek(referenceDate, { weekStartsOn: 1 })
    } else if (range === 'mes') {
        start = startOfMonth(referenceDate)
        end = endOfMonth(referenceDate)
    } else if (range === 'ano') {
        start = startOfYear(referenceDate)
        end = endOfYear(referenceDate)
    } else if (range === 'custom' && startDate && endDate) {
        start = startOfDay(parseISO(startDate))
        end = endOfDay(parseISO(endDate))
    } else {
        start = startOfMonth(referenceDate)
        end = endOfMonth(referenceDate)
    }

    const { data, error } = await supabase
        .from('transactions')
        .select(`
            *,
            payees(id, name),
            payment_methods(id, name),
            categories(id, name),
            subcategories(id, name)
        `)
        .eq('user_id', userId)
        .gte('due_date', format(start, 'yyyy-MM-dd'))
        .lte('due_date', format(end, 'yyyy-MM-dd'))
        .order('due_date', { ascending: false })
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[getTransactions] Query Error:', error.message)
        return []
    }

    return data as any[]
}

"use client"

import * as React from "react"
import { useTransition } from "react"
import { DateRange } from "react-day-picker"
import { useRouter, useSearchParams } from "next/navigation"

import { TransactionFilters } from "@/components/shared/transaction-filters"
import { TransactionTable } from "@/components/shared/transaction-table"
import { TransactionSummaryCards } from "@/components/shared/transaction-summary-cards"
import { TransactionForm } from "@/components/shared/transaction-form"
import { Sheet } from "@/components/ui/sheet"
import { TimeRange } from "@/app/actions/transactions-fetch"
import { Loader2 } from "lucide-react"
import type { Transaction } from "@/app/(authenticated)/financeiro/transacoes/components/columns"

interface TransactionsClientProps {
    initialData: any[]
}

export default function TransactionsClient({ initialData }: TransactionsClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null)
    const [isEditSheetOpen, setIsEditSheetOpen] = React.useState(false)

    // Filtros sincronizados com a URL
    const range = (searchParams.get('range') as TimeRange) || 'mes'
    const date: DateRange | undefined = React.useMemo(() => {
        const from = searchParams.get('from')
        const to = searchParams.get('to')
        if (from && to) {
            return { from: new Date(from), to: new Date(to) }
        }

        if (range === 'mes') {
            const now = new Date()
            return {
                from: new Date(now.getFullYear(), now.getMonth(), 1),
                to: new Date(now.getFullYear(), now.getMonth() + 1, 0)
            }
        }
        return undefined
    }, [searchParams, range])

    const handleRangeChange = (newRange: TimeRange) => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString())
            params.set('range', newRange)
            if (newRange !== 'custom') {
                params.delete('from')
                params.delete('to')
            }
            router.push(`?${params.toString()}`, { scroll: false })
        })
    }

    const handleDateChange = (newDate: DateRange | undefined) => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString())
            if (newDate?.from) params.set('from', newDate.from.toISOString())
            else params.delete('from')

            if (newDate?.to) params.set('to', newDate.to.toISOString())
            else params.delete('to')

            if (newDate?.from) params.set('range', 'custom')

            router.push(`?${params.toString()}`, { scroll: false })
        })
    }


    const handleSuccess = () => {
        router.refresh()
        setIsEditSheetOpen(false)
    }

    const handleRowClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setIsEditSheetOpen(true)
    }


    const totals = React.useMemo(() => {
        return initialData.reduce((acc, curr) => {
            const amount = parseFloat(curr.amount as any) || 0
            if (curr.type === 'revenue') acc.income += amount
            else if (curr.type === 'expense') acc.expense += amount
            else if (curr.type === 'investment') acc.investment += amount

            acc.balance = acc.income - acc.expense - acc.investment
            return acc
        }, { income: 0, expense: 0, investment: 0, balance: 0 })
    }, [initialData])

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Wrapper Principal Sagrado */}
            <div className="max-w-[1440px] mx-auto px-8 w-full flex-1 flex flex-col pt-8 pb-8 gap-6 overflow-hidden">

                {/* Header de Página (Área C) */}
                <div className="flex items-center justify-between flex-none">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 font-jakarta">
                            Transações
                        </h1>
                        <p className="text-zinc-500 mt-1 font-sans">
                            Gerencie suas entradas, saídas e investimentos em um só lugar.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 font-sans">
                        <TransactionFilters
                            range={range}
                            onRangeChange={handleRangeChange}
                            date={date}
                            onDateChange={handleDateChange}
                            onTransactionSuccess={handleSuccess}
                        />
                    </div>
                </div>

                {/* Wrapper de Cards e Tabela com Gap de 16px (gap-4) */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    {/* Grid de Totalizadores (KPIs) - Área D */}
                    <div className="flex-none font-sans">
                        <TransactionSummaryCards totals={totals} isLoading={isPending} />
                    </div>

                    {/* Container da Tabela (Área E) - Scroll Interno */}
                    <div className="flex-1 min-h-0 bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col relative font-sans">
                        {isPending && initialData.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-zinc-400 mb-4" />
                                <p className="text-zinc-500 font-medium font-sans">Carregando transações...</p>
                            </div>
                        ) : (
                            <>
                                {isPending && (
                                    <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center backdrop-blur-[1px]">
                                        <Loader2 className="h-8 w-8 animate-spin text-zinc-950" />
                                    </div>
                                )}
                                <TransactionTable data={initialData} onRowClick={handleRowClick} />
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Sheet */}
            <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
                <TransactionForm
                    open={isEditSheetOpen}
                    transaction={selectedTransaction}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsEditSheetOpen(false)}
                />
            </Sheet>
        </div>
    )
}

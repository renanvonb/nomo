'use client'

import * as React from "react"
import { useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DateRange } from "react-day-picker"
import { getTransactions, TimeRange } from "@/app/actions/transactions-fetch"
import { TopBar } from "@/components/ui/top-bar"
import { TransactionsHeader } from "@/components/transactions/transactions-header"
import { TransactionsContent } from "@/components/transactions/transactions-content"
import { TransactionDetailsDialog } from "@/components/transaction-details-dialog"
import { TransactionForm } from "@/components/transaction-form"
import { Sheet } from "@/components/ui/sheet"
import { toast } from "sonner"
import type { Transaction } from "@/types/transaction"
import { startOfMonth, endOfMonth } from "date-fns"

const periodTabs = [
    { id: 'dia', label: 'Dia' },
    { id: 'semana', label: 'Semana' },
    { id: 'mes', label: 'Mês' },
    { id: 'ano', label: 'Ano' },
    { id: 'custom', label: 'Período' },
]

export default function TransactionsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    // State
    const [data, setData] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchValue, setSearchValue] = React.useState(searchParams.get('q') || "")
    const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null)
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false)
    const [isEditSheetOpen, setIsEditSheetOpen] = React.useState(false)
    const [isNewSheetOpen, setIsNewSheetOpen] = React.useState(false)
    const [newTransactionType, setNewTransactionType] = React.useState<"revenue" | "expense" | "investment">("expense")

    // URL params
    const range = (searchParams.get('range') as TimeRange) || 'mes'
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const searchQuery = searchParams.get('q')?.toLowerCase() || ""

    // Fetch data
    const fetchData = React.useCallback(async () => {
        try {
            setLoading(true)
            const result = await getTransactions({
                range,
                startDate: from || undefined,
                endDate: to || undefined,
            })
            setData(result)
        } catch (error) {
            console.error("Error fetching transactions:", error)
            toast.error("Erro ao carregar transações")
        } finally {
            setLoading(false)
        }
    }, [range, from, to])

    React.useEffect(() => {
        fetchData()
    }, [fetchData])

    // Hanlders
    const handleRangeChange = (newRange: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('range', newRange)
        params.delete('from')
        params.delete('to')
        router.push(`?${params.toString()}`, { scroll: false })
    }

    const handleDateChange = (newDate: DateRange | undefined) => {
        const params = new URLSearchParams(searchParams.toString())
        if (newDate?.from) params.set('from', newDate.from.toISOString())
        else params.delete('from')
        if (newDate?.to) params.set('to', newDate.to.toISOString())
        else params.delete('to')
        router.push(`?${params.toString()}`, { scroll: false })
    }

    // Search debounce
    React.useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString())
            if (searchValue) params.set('q', searchValue)
            else params.delete('q')
            router.push(`?${params.toString()}`, { scroll: false })
        }, 300)
        return () => clearTimeout(timer)
    }, [searchValue, router, searchParams])

    const handleAddClick = (type: "revenue" | "expense" | "investment") => {
        setNewTransactionType(type)
        setIsNewSheetOpen(true)
    }

    const handleRowClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setIsDetailsDialogOpen(true)
    }

    const handleEdit = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setIsEditSheetOpen(true)
    }

    const handleSuccess = () => {
        fetchData()
        setIsNewSheetOpen(false)
        setIsEditSheetOpen(false)
        setIsDetailsDialogOpen(false)
    }

    const filteredData = React.useMemo(() => {
        if (!searchQuery) return data
        return data.filter(t => {
            const desc = (t.description || "").toLowerCase()
            const payee = (t.payees?.name || "").toLowerCase()
            const cat = (t.categories?.name || "").toLowerCase()
            return desc.includes(searchQuery) || payee.includes(searchQuery) || cat.includes(searchQuery)
        })
    }, [data, searchQuery])

    const dateRange: DateRange | undefined = React.useMemo(() => {
        if (from && to) return { from: new Date(from), to: new Date(to) }
        return undefined
    }, [from, to])

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-50">
            {/* Top Bar with Period Tabs */}
            <TopBar
                moduleName="Transações"
                tabs={periodTabs}
                activeTab={range}
                onTabChange={handleRangeChange}
                variant="simple"
            />

            {/* Main Content Wrapper */}
            <div className="max-w-[1440px] mx-auto px-8 w-full flex-1 flex flex-col pt-8 pb-8 gap-6 overflow-hidden">

                <TransactionsHeader
                    title="Transações"
                    description="Gerencie e acompanhe suas movimentações financeiras."
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    range={range}
                    date={dateRange}
                    onDateChange={handleDateChange}
                    onAddClick={handleAddClick}
                />

                <TransactionsContent
                    data={filteredData}
                    isPending={loading || isPending}
                    searchQuery={searchQuery}
                    range={range}
                    onRowClick={handleRowClick}
                    onResetSearch={() => setSearchValue("")}
                    onAddClick={handleAddClick}
                />

                {/* Sheets and Dialogs */}
                <Sheet open={isNewSheetOpen} onOpenChange={setIsNewSheetOpen}>
                    <TransactionForm
                        open={isNewSheetOpen}
                        defaultType={newTransactionType}
                        onSuccess={handleSuccess}
                        onCancel={() => setIsNewSheetOpen(false)}
                    />
                </Sheet>

                <TransactionDetailsDialog
                    transaction={selectedTransaction}
                    open={isDetailsDialogOpen}
                    onOpenChange={setIsDetailsDialogOpen}
                    onEdit={handleEdit}
                    onSuccess={handleSuccess}
                />

                <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
                    <TransactionForm
                        key={selectedTransaction?.id}
                        open={isEditSheetOpen}
                        transaction={selectedTransaction}
                        onSuccess={handleSuccess}
                        onCancel={() => setIsEditSheetOpen(false)}
                    />
                </Sheet>
            </div>
        </div>
    )
}


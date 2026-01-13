"use client"

import * as React from "react"
import { useTransition } from "react"
import { DateRange } from "react-day-picker"
import { useRouter, useSearchParams } from "next/navigation"

import { TransactionFilters } from "@/components/transaction-filters"
import { TransactionTable } from "@/components/transaction-table"
import { TransactionSummaryCards } from "@/components/transaction-summary-cards"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionDetailsDialog } from "@/components/transaction-details-dialog"
import { TransactionsTableSkeleton } from "@/components/ui/skeletons"
import { Sheet } from "@/components/ui/sheet"
import { EmptyState } from "@/components/ui/empty-state"
import { TimeRange } from "@/app/actions/transactions-fetch"
import { Loader2, Plus, Search, ChevronDown, Inbox } from "lucide-react"
import type { Transaction } from "@/types/transaction"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdaptiveDatePicker } from "@/components/ui/adaptive-date-picker"

interface TransactionsClientProps {
    initialData: any[]
}

export default function TransactionsClient({ initialData }: TransactionsClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null)
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false)
    const [isEditSheetOpen, setIsEditSheetOpen] = React.useState(false)
    const [isNewSheetOpen, setIsNewSheetOpen] = React.useState(false)
    const [newTransactionType, setNewTransactionType] = React.useState<"revenue" | "expense" | "investment">("expense")

    const handleNewTransaction = (type: "revenue" | "expense" | "investment") => {
        setNewTransactionType(type)
        setIsNewSheetOpen(true)
    }

    // Search Debounce state
    const [searchValue, setSearchValue] = React.useState(searchParams.get('q') || "")

    React.useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString())
            if (searchValue) params.set('q', searchValue)
            else params.delete('q')
            router.push(`?${params.toString()}`, { scroll: false })
        }, 300)
        return () => clearTimeout(timer)
    }, [searchValue, router, searchParams])

    // Filtros sincronizados com a URL
    const range = (searchParams.get('range') as TimeRange) || 'mes'
    const searchQuery = searchParams.get('q')?.toLowerCase() || ""


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
            // Clear date params when changing range - AdaptiveDatePicker will set current period
            params.delete('from')
            params.delete('to')
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

            router.push(`?${params.toString()}`, { scroll: false })
        })
    }



    // Filtragem Client-side reativa

    const filteredData = React.useMemo(() => {
        if (!searchQuery) return initialData
        return initialData.filter(t => {
            const desc = (t.description || "").toLowerCase()
            const payee = (t.payees?.name || "").toLowerCase()
            const cat = (t.categories?.name || "").toLowerCase()
            return desc.includes(searchQuery) || payee.includes(searchQuery) || cat.includes(searchQuery)
        })
    }, [initialData, searchQuery])

    const handleSuccess = () => {
        router.refresh()
        setIsEditSheetOpen(false)
    }

    const handleRowClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setIsDetailsDialogOpen(true)
    }

    const handleEdit = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setIsEditSheetOpen(true)
    }


    const totals = React.useMemo(() => {
        return filteredData.reduce((acc, curr) => {
            const amount = parseFloat(curr.amount as any) || 0
            if (curr.type === 'revenue') acc.income += amount
            else if (curr.type === 'expense') acc.expense += amount
            else if (curr.type === 'investment') acc.investment += amount

            acc.balance = acc.income - acc.expense - acc.investment
            return acc
        }, { income: 0, expense: 0, investment: 0, balance: 0 })
    }, [filteredData])


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
                        <p className="text-zinc-500 mt-1 font-sans text-sm font-inter">
                            Gerencie e acompanhe suas movimentações financeiras.
                        </p>
                    </div>

                    <div id="filter-group" className="flex items-center gap-3 font-sans justify-end flex-wrap">
                        {/* 1. Search Bar (200px) */}
                        <div className="relative w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input
                                placeholder="Buscar..."
                                className="pl-9 h-10 font-inter w-full"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </div>

                        {/* 2. Select Period (100px) */}
                        <Select
                            value={range}
                            onValueChange={handleRangeChange}
                        >
                            <SelectTrigger className="w-[100px] font-inter">
                                <SelectValue placeholder="Período" />
                            </SelectTrigger>
                            <SelectContent className='bg-white'>
                                <SelectItem value="dia">Hoje</SelectItem>
                                <SelectItem value="semana">Semana</SelectItem>
                                <SelectItem value="mes">Mês</SelectItem>
                                <SelectItem value="ano">Ano</SelectItem>
                                <SelectItem value="custom">Personalizar</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* 3. Adaptive Date Picker (150px) */}
                        <AdaptiveDatePicker
                            mode={range}
                            value={date}
                            onChange={handleDateChange}
                            className="w-[150px]"
                        />

                        {/* 4. Add Button -> Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="font-inter font-medium">
                                    Adicionar
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px] bg-white">
                                <DropdownMenuItem onClick={() => handleNewTransaction('revenue')} className="cursor-pointer">
                                    Receita
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleNewTransaction('expense')} className="cursor-pointer">
                                    Despesa
                                </DropdownMenuItem>

                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>



                {/* Wrapper de Cards e Tabela com Gap de 32px (gap-8) */}
                <div className="flex-1 flex flex-col gap-8 overflow-hidden">
                    {/* Grid de Totalizadores (KPIs) - Área D */}
                    <div className="flex-none font-sans">
                        <TransactionSummaryCards totals={totals} isLoading={isPending} />
                    </div>

                    {/* Container da Tabela (Área E) - Scroll Interno */}
                    {filteredData.length > 0 ? (
                        <div id="data-table-wrapper" className="flex-1 min-h-0 bg-white rounded-[16px] border border-zinc-200 shadow-sm flex flex-col relative overflow-hidden font-sans">
                            {isPending && (
                                <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center backdrop-blur-[1px]">
                                    <Loader2 className="h-8 w-8 animate-spin text-zinc-950" />
                                </div>
                            )}
                            <TransactionTable data={filteredData} onRowClick={handleRowClick} />
                        </div>
                    ) : (
                        <EmptyState
                            variant="outlined"
                            size="lg"
                            icon={Inbox}
                            title={searchQuery ? "Nenhuma transação encontrada" : "Nenhuma transação cadastrada"}
                            description={
                                searchQuery
                                    ? "Não encontramos transações com os termos buscados. Tente ajustar sua pesquisa."
                                    : "Comece registrando sua primeira movimentação financeira para acompanhar suas finanças."
                            }
                            action={
                                searchQuery ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => setSearchValue("")}
                                        className="font-inter"
                                    >
                                        Limpar busca
                                    </Button>
                                ) : (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="font-inter">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Adicionar
                                                <ChevronDown className="h-4 w-4 ml-2" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="center" className="w-[160px] bg-white">
                                            <DropdownMenuItem onClick={() => handleNewTransaction('revenue')} className="cursor-pointer">
                                                Receita
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleNewTransaction('expense')} className="cursor-pointer">
                                                Despesa
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )
                            }
                            className="flex-1"
                        />
                    )}

                    {/* New Transaction Sheet */}
                    <Sheet open={isNewSheetOpen} onOpenChange={setIsNewSheetOpen}>
                        <TransactionForm
                            open={isNewSheetOpen}
                            defaultType={newTransactionType}
                            onSuccess={() => {
                                handleSuccess()
                                setIsNewSheetOpen(false)
                            }}
                            onCancel={() => setIsNewSheetOpen(false)}
                        />
                    </Sheet>

                </div>

                {/* Details Dialog */}
                <TransactionDetailsDialog
                    transaction={selectedTransaction}
                    open={isDetailsDialogOpen}
                    onOpenChange={setIsDetailsDialogOpen}
                    onEdit={handleEdit}
                    onSuccess={handleSuccess}
                />

                {/* Edit Sheet */}
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

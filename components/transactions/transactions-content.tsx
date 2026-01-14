"use client"

import * as React from "react"
import { TransactionTable } from "@/components/transaction-table"
import { TransactionSummaryCards } from "@/components/transaction-summary-cards"
import { EmptyState } from "@/components/ui/empty-state"
import { Loader2, Inbox, Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TransactionsContentProps {
    data: any[]
    isPending: boolean
    searchQuery: string
    range: string
    onRowClick: (transaction: any) => void
    onResetSearch: () => void
    onAddClick: (type: "revenue" | "expense" | "investment") => void
}

import { Skeleton } from "@/components/ui/skeleton"
import { TableContentSkeleton } from "@/components/ui/skeletons"

const emptyMessages: Record<string, string> = {
    dia: "Nenhuma transação registrada neste dia",
    semana: "Nenhuma transação registrada nesta semana",
    mes: "Nenhuma transação registrada neste mês",
    ano: "Nenhuma transação registrada neste ano",
    custom: "Nenhuma transação registrada neste período"
}

export function TransactionsContent({
    data,
    isPending,
    searchQuery,
    range,
    onRowClick,
    onResetSearch,
    onAddClick,
}: TransactionsContentProps) {
    const totals = React.useMemo(() => {
        return data.reduce((acc, curr) => {
            const amount = parseFloat(curr.amount as any) || 0
            if (curr.type === 'revenue') acc.income += amount
            else if (curr.type === 'expense') acc.expense += amount
            else if (curr.type === 'investment') acc.investment += amount

            acc.balance = acc.income - acc.expense - acc.investment
            return acc
        }, { income: 0, expense: 0, investment: 0, balance: 0 })
    }, [data])

    const emptyTitle = searchQuery
        ? "Nenhuma transação encontrada"
        : (emptyMessages[range] || "Nenhuma transação cadastrada")

    return (
        <div className="flex-1 flex flex-col gap-8 overflow-hidden">
            {/* Grid de Totalizadores (KPIs) - SEMPRE VISÍVEL */}
            <div className="flex-none font-sans">
                <TransactionSummaryCards totals={totals} isLoading={isPending && data.length === 0} />
            </div>

            {/* Área de Conteúdo */}
            {isPending && data.length === 0 ? (
                <TableContentSkeleton />
            ) : data.length === 0 ? (
                <EmptyState
                    variant="outlined"
                    size="lg"
                    icon={Inbox}
                    title={emptyTitle}
                    description={
                        searchQuery
                            ? "Não encontramos transações com os termos buscados. Tente ajustar sua pesquisa."
                            : "Comece registrando sua primeira movimentação financeira para acompanhar suas finanças."
                    }
                    action={
                        searchQuery ? (
                            <Button
                                variant="outline"
                                onClick={onResetSearch}
                                className="font-inter"
                            >
                                Limpar busca
                            </Button>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="font-inter">
                                        Adicionar
                                        <ChevronDown className="h-4 w-4 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center" className="w-[160px] bg-white border-zinc-200 shadow-md">
                                    <DropdownMenuItem onClick={() => onAddClick('revenue')} className="cursor-pointer">
                                        Receita
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onAddClick('expense')} className="cursor-pointer">
                                        Despesa
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )
                    }
                    className="flex-1"
                />
            ) : (
                <div id="data-table-wrapper" className="flex-1 min-h-0 bg-white rounded-[16px] border border-zinc-200 shadow-sm flex flex-col relative overflow-hidden font-sans">
                    {isPending && (
                        <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center backdrop-blur-[1px]">
                            <Loader2 className="h-8 w-8 animate-spin text-zinc-950" />
                        </div>
                    )}
                    <TransactionTable data={data} onRowClick={onRowClick} />
                </div>
            )}
        </div>
    )
}


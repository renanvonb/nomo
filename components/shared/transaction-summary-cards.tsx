"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpCircle, ArrowDownCircle, PieChart, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

interface SummaryTotals {
    income: number
    expense: number
    investment: number
    balance: number
}

interface TransactionSummaryCardsProps {
    totals: SummaryTotals
    isLoading: boolean
}

export function TransactionSummaryCards({ totals, isLoading }: TransactionSummaryCardsProps) {
    const formatValue = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value)
    }

    const cards = [
        {
            label: "Receitas",
            value: totals.income,
            icon: ArrowUpCircle,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100",
        },
        {
            label: "Despesas",
            value: totals.expense * -1,
            icon: ArrowDownCircle,
            color: "text-rose-600",
            bgColor: "bg-rose-100",
        },
        {
            label: "Investimentos",
            value: totals.investment * -1,
            icon: PieChart,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            label: "Saldo Total",
            value: totals.balance,
            icon: Wallet,
            color: "text-zinc-600",
            bgColor: "bg-zinc-100",
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <Card
                    key={index}
                    className={cn(
                        "p-6 border-zinc-200 bg-white rounded-2xl transition-all duration-200 hover:shadow-md hover:border-zinc-300",
                        isLoading && "pointer-events-none"
                    )}
                >
                    <div className="flex flex-col gap-4">
                        <span className="text-zinc-500 font-semibold font-sans tracking-tight">
                            {card.label}
                        </span>

                        <div className="flex items-center justify-between">
                            {isLoading ? (
                                <Skeleton className="h-8 w-32" />
                            ) : (
                                <div className="text-2xl font-bold tracking-tight font-sans text-zinc-950">
                                    {formatValue(card.value)}
                                </div>
                            )}

                            <div className={cn("p-2 rounded-full", card.bgColor, "flex-none")}>
                                <card.icon className={cn("h-5 w-5", card.color)} />
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

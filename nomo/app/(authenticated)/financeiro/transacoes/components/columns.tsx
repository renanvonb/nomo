"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { ArrowUpCircle, ArrowDownCircle, PieChart } from "lucide-react"

export type Transaction = {
    id: string
    description: string
    amount: number
    type: "revenue" | "expense" | "investment"
    due_date: string
    payment_date: string | null
    payees?: { name: string } | null
    payment_methods?: { name: string } | null
    categories?: { name: string } | null
    subcategories?: { name: string } | null
}

const typeIconMap = {
    revenue: { icon: ArrowUpCircle, color: "text-emerald-600" },
    expense: { icon: ArrowDownCircle, color: "text-rose-600" },
    investment: { icon: PieChart, color: "text-blue-600" },
}

export const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "description",
        header: "Descrição",
        cell: ({ row }) => {
            const type = row.original.type as keyof typeof typeIconMap
            const { icon: Icon, color } = typeIconMap[type]

            return (
                <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className="text-sm font-medium">{row.getValue("description")}</span>
                </div>
            )
        },
    },
    {
        id: "payee",
        accessorFn: (row) => row.payees?.name,
        header: "Favorecido",
        cell: ({ row }) => {
            const payee = row.original.payees?.name
            return payee ? (
                <Badge variant="secondary" className="text-sm font-normal">{payee}</Badge>
            ) : (
                <span className="text-sm text-muted-foreground">-</span>
            )
        },
    },
    {
        id: "category",
        accessorFn: (row) => row.categories?.name,
        header: "Categoria",
        cell: ({ row }) => {
            const category = row.original.categories?.name
            return category ? (
                <Badge variant="secondary" className="text-sm font-normal">{category}</Badge>
            ) : (
                <span className="text-sm text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: "payment_date",
        header: "Pagamento",
        cell: ({ row }) => {
            const date = row.getValue("payment_date") as string | null
            if (!date) return <span className="text-sm text-muted-foreground">-</span>
            const [year, month, day] = date.split("-")
            return <div className="text-sm">{`${day}/${month}/${year}`}</div>
        },
    },
    {
        accessorKey: "amount",
        header: "Valor",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            const type = row.original.type

            const formatted = new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
            }).format(amount)

            const colorClass = type === "revenue"
                ? "text-emerald-600"
                : type === "expense"
                    ? "text-rose-600"
                    : "text-blue-600"

            return (
                <div className={`text-sm font-semibold ${colorClass}`}>
                    {formatted}
                </div>
            )
        },
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const isPaid = !!row.original.payment_date
            const dueDate = row.original.due_date

            // Simple date comparison using ISO string format (YYYY-MM-DD)
            const today = new Date().toISOString().split('T')[0]

            let status: "Pendente" | "Realizado" | "Agendado" | "Atrasado"

            if (isPaid) {
                status = "Realizado"
            } else if (dueDate > today) {
                status = "Agendado"
            } else if (dueDate < today) {
                status = "Atrasado"
            } else {
                status = "Pendente"
            }

            return <StatusIndicator status={status} />
        },
    },
]

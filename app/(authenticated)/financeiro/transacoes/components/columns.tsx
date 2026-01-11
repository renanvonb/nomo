"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { ArrowUpCircle, ArrowDownCircle, PieChart } from "lucide-react"
import { useVisibility } from "@/hooks/use-visibility-state"
import { Transaction } from "@/types/transaction"

const typeIconMap = {
    revenue: { icon: ArrowUpCircle, color: "text-emerald-600" },
    expense: { icon: ArrowDownCircle, color: "text-rose-600" },
    investment: { icon: PieChart, color: "text-blue-600" },
}

export const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "description",
        header: () => <div className="min-w-[200px]">Descrição</div>,
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
        header: () => <div className="min-w-[150px]">Favorecido</div>,
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
        header: () => <div className="min-w-[150px]">Categoria</div>,
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
        header: () => <div className="min-w-[100px]">Pagamento</div>,
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
        cell: function AmountCell({ row }) {
            const { isVisible } = useVisibility()
            const amount = parseFloat(row.getValue("amount"))
            const type = row.original.type

            const formatted = isVisible
                ? new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                }).format(amount)
                : "R$ ••••"

            const colorClass = type === "revenue"
                ? "text-emerald-600"
                : type === "expense"
                    ? "text-rose-600"
                    : "text-blue-600"

            return (
                <div className={`text-sm font-semibold min-w-[120px] ${colorClass}`}>
                    {formatted}
                </div>
            )
        },
    },
    {
        id: "status",
        header: () => <div className="w-[120px]">Status</div>,
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

            return (
                <div className="w-[120px]">
                    <StatusIndicator status={status} />
                </div>
            )
        },
    },
]

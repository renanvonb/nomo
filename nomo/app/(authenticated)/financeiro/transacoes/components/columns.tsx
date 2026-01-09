"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

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

const typeBadgeMap = {
    revenue: "Receita",
    expense: "Despesa",
    investment: "Investimento",
}

export const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "description",
        header: "Descrição",
        cell: ({ row }) => (
            <div className="text-sm font-medium">{row.getValue("description")}</div>
        ),
    },
    {
        accessorKey: "type",
        header: "Tipo",
        cell: ({ row }) => {
            const type = row.getValue("type") as keyof typeof typeBadgeMap
            return (
                <Badge variant="secondary">
                    {typeBadgeMap[type]}
                </Badge>
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
                <Badge variant="secondary">{payee}</Badge>
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
                <Badge variant="secondary">{category}</Badge>
            ) : (
                <span className="text-sm text-muted-foreground">-</span>
            )
        },
    },
    {
        id: "subcategory",
        accessorFn: (row) => row.subcategories?.name,
        header: "Subcategoria",
        cell: ({ row }) => {
            const subcategory = row.original.subcategories?.name
            return subcategory ? (
                <Badge variant="secondary">{subcategory}</Badge>
            ) : (
                <span className="text-sm text-muted-foreground">-</span>
            )
        },
    },
    {
        id: "payment_method",
        accessorFn: (row) => row.payment_methods?.name,
        header: "Método",
        cell: ({ row }) => {
            const method = row.original.payment_methods?.name
            return method ? (
                <Badge variant="secondary">{method}</Badge>
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
            return (
                <div className="text-sm">
                    {isPaid ? "Pago" : "Pendente"}
                </div>
            )
        },
    },
]

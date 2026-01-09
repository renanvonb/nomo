"use client"

import { DataTable } from "@/app/(authenticated)/financeiro/transacoes/components/data-table"
import { columns, Transaction } from "@/app/(authenticated)/financeiro/transacoes/components/columns"

interface TransactionTableProps {
    data: any[]
    onRowClick?: (transaction: Transaction) => void
}

export function TransactionTable({ data, onRowClick }: TransactionTableProps) {
    return <DataTable columns={columns} data={data} onRowClick={onRowClick} />
}

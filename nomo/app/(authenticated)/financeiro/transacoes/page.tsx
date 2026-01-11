import { Suspense } from "react"
import TransactionsClient from "@/components/transactions-client"
import { getTransactions, TimeRange } from "@/app/actions/transactions-fetch"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

interface TransactionsPageProps {
    searchParams: {
        range?: string
        from?: string
        to?: string
    }
}

async function TransactionsContent({ searchParams }: TransactionsPageProps) {
    const range = (searchParams.range as TimeRange) || 'mes'
    const from = searchParams.from
    const to = searchParams.to

    const initialData = await getTransactions({
        range,
        startDate: from,
        endDate: to,
    })

    return <TransactionsClient initialData={initialData} />
}

import { TableSkeleton } from "@/components/ui/skeletons"

export default function TransactionsPage({ searchParams }: TransactionsPageProps) {
    return (
        <Suspense fallback={<TableSkeleton />}>
            <TransactionsContent searchParams={searchParams} />
        </Suspense>
    )
}

import { Suspense } from "react"
import TransactionsClient from "@/components/shared/transactions-client"
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

function TransactionsSkeleton() {
    return (
        <div className="flex flex-col h-screen animate-pulse bg-zinc-50 font-sans">
            <div className="max-w-[1440px] mx-auto px-8 w-full flex-1 flex flex-col pt-8 pb-8 gap-6 overflow-hidden">
                {/* Title Skeleton */}
                <div className="flex-none">
                    <div className="h-9 w-48 bg-zinc-200 rounded-xl mb-2" />
                    <div className="h-4 w-64 bg-zinc-100 rounded-lg" />
                </div>

                {/* Wrapper de Cards e Tabela com Gap de 16px (gap-4) */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    {/* Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-none">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-white border border-zinc-200 rounded-2xl p-6" />
                        ))}
                    </div>

                    {/* Table Skeleton */}
                    <div className="flex-1 bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
                        {/* Fake Header */}
                        <div className="h-14 bg-white border-b border-zinc-200 sticky top-0 z-10 flex items-center px-4 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-4 bg-zinc-100 rounded w-full max-w-[120px]" />
                            ))}
                        </div>
                        {/* Fake Rows */}
                        <div className="flex-1 overflow-hidden">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="h-16 border-b border-zinc-100 flex items-center px-4 gap-4">
                                    <div className="h-4 bg-zinc-50 rounded w-full" />
                                    <div className="h-4 bg-zinc-50 rounded w-1/2" />
                                    <div className="h-4 bg-zinc-50 rounded w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default function TransactionsPage({ searchParams }: TransactionsPageProps) {
    return (
        <Suspense fallback={<TransactionsSkeleton />}>
            <TransactionsContent searchParams={searchParams} />
        </Suspense>
    )
}

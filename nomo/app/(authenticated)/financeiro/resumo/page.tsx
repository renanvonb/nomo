import { Suspense } from "react"
import DashboardClient from "@/components/dashboard-client"
import { getTransactions, TimeRange } from "@/app/actions/transactions-fetch"
import { TableSkeleton } from "@/components/ui/skeletons"

interface DashboardPageProps {
    searchParams: {
        range?: string
        from?: string
        to?: string
        q?: string
    }
}

async function DashboardContent({ searchParams }: DashboardPageProps) {
    const range = (searchParams.range as TimeRange) || 'mes'
    const from = searchParams.from
    const to = searchParams.to

    const initialData = await getTransactions({
        range,
        startDate: from,
        endDate: to,
    })

    return <DashboardClient initialData={initialData} />
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
    return (
        <Suspense fallback={<div className="p-8"><TableSkeleton /></div>}>
            <DashboardContent searchParams={searchParams} />
        </Suspense>
    )
}

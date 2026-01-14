import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

/**
 * AuthSkeleton: Mimics the 60/40 layout of Login/Signup screens
 */
export function AuthSkeleton() {
    return (
        <div className="flex h-screen w-screen bg-white overflow-hidden font-inter">
            {/* Left Column: Form Area (60%) */}
            <div className="flex-1 md:w-[60%] md:flex-none flex flex-col items-center justify-center p-8 md:p-12 lg:p-16">
                <div className="w-full max-w-[320px] flex flex-col items-center">
                    <Skeleton className="h-8 w-40 mb-2" /> {/* Title */}
                    <Separator className="mt-[24px] mb-[24px] w-full opacity-50" />

                    <div className="w-full space-y-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-20" /> {/* Label */}
                                <Skeleton className="h-11 w-full rounded-md" /> {/* Input */}
                            </div>
                        ))}
                        <Skeleton className="h-11 w-full rounded-md mt-2" /> {/* Button */}
                    </div>
                </div>
                <div className="absolute bottom-8 w-full flex justify-center">
                    <Skeleton className="h-4 w-48" /> {/* Footer link */}
                </div>
            </div>

            {/* Right Column: Brand Area (40%) */}
            <div className="hidden md:flex md:w-[40%] m-4 rounded-[16px] bg-zinc-50 p-6 relative">
                <Skeleton className="absolute top-6 left-6 h-8 w-24" /> {/* Logo */}
                <Skeleton className="absolute bottom-6 left-6 h-4 w-64" /> {/* Copyright */}
            </div>
        </div>
    )
}

/**
 * TableSkeleton: Mimics the Transactions Data Table structure
 */
export function TransactionsTableSkeleton() {
    return (
        <div className="flex flex-col h-screen animate-pulse bg-zinc-50 font-sans">
            <div className="max-w-[1440px] mx-auto px-8 w-full flex-1 flex flex-col pt-8 pb-8 gap-6 overflow-hidden">
                {/* Title Skeleton */}
                <div className="flex-none">
                    <Skeleton className="h-9 w-48 bg-zinc-200 rounded-xl mb-2" />
                    <Skeleton className="h-4 w-64 bg-zinc-100 rounded-lg" />
                </div>

                {/* Wrapper de Cards e Tabela */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    {/* Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-none">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-white border border-zinc-200 rounded-2xl p-6">
                                <Skeleton className="h-4 w-24 mb-4" />
                                <Skeleton className="h-8 w-32" />
                            </div>
                        ))}
                    </div>

                    {/* Table Skeleton */}
                    <div className="flex-1 bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
                        {/* Fake Header */}
                        <div className="h-14 bg-white border-b border-zinc-200 sticky top-0 z-10 flex items-center px-6 gap-4">
                            <Skeleton className="h-4 w-32" /> {/* Descrição */}
                            <Skeleton className="h-4 w-20" /> {/* Tipo */}
                            <Skeleton className="h-4 w-24" /> {/* Favorecido */}
                            <Skeleton className="h-4 w-24" /> {/* Categoria */}
                            <Skeleton className="h-4 w-24 ml-auto" /> {/* Valor */}
                        </div>
                        {/* Fake Rows */}
                        <div className="flex-1 overflow-hidden divide-y divide-zinc-100">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-16 flex items-center px-6 gap-4">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                    <Skeleton className="h-4 w-20 ml-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * SidebarSkeleton: Mimics navigation menu and user footer
 */
export function SidebarSkeleton() {
    return (
        <div className="h-full w-full flex flex-col p-4 space-y-6 bg-zinc-50/50 border-r">
            <Skeleton className="h-8 w-24 mb-4" /> {/* Brand/Logo */}
            <div className="space-y-2 flex-1">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-2">
                        <Skeleton className="h-5 w-5 rounded-md" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))}
            </div>
            <div className="pt-4 border-t flex items-center space-x-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        </div>
    )
}

/**
 * TopbarSkeleton: Mimics high-level navigation and breadcrumbs
 */
export const TableSkeleton = TransactionsTableSkeleton

/**
 * TableContentSkeleton: Only the table part without search/header/cards
 */
export function TableContentSkeleton() {
    return (
        <div className="flex-1 bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative animate-pulse">
            {/* Fake Header */}
            <div className="h-14 bg-white border-b border-zinc-200 flex items-center px-6 gap-4">
                <Skeleton className="h-4 w-32 bg-zinc-100" />
                <Skeleton className="h-4 w-20 bg-zinc-100 text-transparent" />
                <Skeleton className="h-4 w-24 bg-zinc-100" />
                <Skeleton className="h-4 w-24 bg-zinc-100" />
                <Skeleton className="h-4 w-24 bg-zinc-100 ml-auto" />
            </div>
            {/* Fake Rows */}
            <div className="flex-1 overflow-hidden divide-y divide-zinc-100">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-16 flex items-center px-6 gap-4">
                        <Skeleton className="h-4 w-40 bg-zinc-50" />
                        <Skeleton className="h-6 w-16 rounded-full bg-zinc-50" />
                        <Skeleton className="h-6 w-24 rounded-full bg-zinc-50" />
                        <Skeleton className="h-6 w-24 rounded-full bg-zinc-50" />
                        <Skeleton className="h-4 w-20 ml-auto bg-zinc-50" />
                    </div>
                ))}
            </div>
        </div>
    )
}


/**
 * ModuleCardsSkeleton: Grid of card skeletons for modules like Cadastros
 */
export function ModuleCardsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[...Array(28)].map((_, i) => (
                <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-2xl bg-zinc-100" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4 bg-zinc-100" />
                            <Skeleton className="h-3 w-1/2 bg-zinc-50" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function TopbarSkeleton() {
    return (
        <div className="h-[72px] w-full border-b flex items-center px-6 justify-between bg-white">
            <Skeleton className="h-4 w-32" /> {/* Breadcrumb */}
            <div className="flex items-center space-x-8">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
            </div>
            <div className="w-32" /> {/* Spacer */}
        </div>
    )
}

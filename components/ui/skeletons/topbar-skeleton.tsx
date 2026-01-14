import { Skeleton } from "@/components/ui/skeleton"

export function TopBarSkeleton() {
    return (
        <div className="sticky top-0 z-50 w-full border-b bg-white">
            <div className="flex h-[72px] items-center justify-between px-6">
                {/* Left: Breadcrumb */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <span className="text-zinc-400">/</span>
                    <Skeleton className="h-4 w-20" />
                </div>

                {/* Center: Navigation */}
                <div className="flex items-center gap-6">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-9 w-9 rounded-lg" />
                </div>
            </div>
        </div>
    )
}

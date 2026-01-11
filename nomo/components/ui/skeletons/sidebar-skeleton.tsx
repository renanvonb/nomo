import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export function SidebarSkeleton() {
    return (
        <div className="flex h-full w-64 flex-col gap-4 border-r bg-white p-4">
            {/* Logo/Header */}
            <div className="px-2 py-4">
                <Skeleton className="h-8 w-24" />
            </div>

            <Separator />

            {/* Menu Items */}
            <div className="flex-1 space-y-2">
                {/* Menu Group 1 */}
                <div className="space-y-1">
                    <Skeleton className="h-4 w-20 mb-2" />
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2">
                            <Skeleton className="h-5 w-5" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                    ))}
                </div>

                <Separator className="my-4" />

                {/* Menu Group 2 */}
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2">
                            <Skeleton className="h-5 w-5" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            {/* User Footer */}
            <div className="flex items-center gap-3 px-2 py-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
        </div>
    )
}

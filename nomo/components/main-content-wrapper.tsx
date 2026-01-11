'use client'

import { useSidebar } from '@/hooks/use-sidebar-state'
import { cn } from '@/lib/utils'

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
    const { isOpen } = useSidebar()

    return (
        <main
            className={cn(
                "flex-1 transition-all duration-300 flex flex-col h-screen overflow-hidden border-l border-zinc-200",
                isOpen ? "ml-64" : "ml-0 md:ml-20"
            )}
        >
            {children}
        </main>
    )
}

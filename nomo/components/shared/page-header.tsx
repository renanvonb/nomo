'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PanelLeftClose, PanelLeftOpen, Bell, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/hooks/use-sidebar-state'
import { TopbarSkeleton } from '@/components/ui/skeletons'

interface NavLink {
    label: string
    href: string
}

interface PageHeaderProps {
    links: NavLink[]
    isLoading?: boolean
}

export function PageHeader({ links, isLoading }: PageHeaderProps) {
    if (isLoading) {
        return <TopbarSkeleton />
    }

    const pathname = usePathname()
    const { isOpen, toggle } = useSidebar()

    return (
        <header id="global-header" className="sticky top-0 z-30 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md h-16 flex-none font-sans">
            <div className="max-w-[1440px] mx-auto px-8 h-full flex items-center justify-between w-full">

                {/* Left: Sidebar Toggle */}
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggle}
                        className="text-zinc-400 hover:text-zinc-950"
                        title={isOpen ? "Recolher Sidebar" : "Expandir Sidebar"}
                    >
                        {isOpen ? (
                            <PanelLeftClose className="h-5 w-5" />
                        ) : (
                            <PanelLeftOpen className="h-5 w-5" />
                        )}
                    </Button>
                </div>

                {/* Center: Navigation Links (Empty - moved to sidebar) */}
                <div className="flex items-center justify-center">
                    <nav className="flex items-center gap-6 h-full">
                        {links.map((link) => {
                            const isActive = pathname.startsWith(link.href)
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'relative h-16 flex items-center px-1 text-sm font-medium transition-colors border-b-2 font-inter',
                                        isActive
                                            ? 'text-zinc-950 border-zinc-950'
                                            : 'text-zinc-500 border-transparent hover:text-zinc-950'
                                    )}
                                >
                                    {link.label}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Right: Actions (Theme, Notifications) */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Alternar Tema"
                        className="text-zinc-400 hover:text-zinc-950"
                    >
                        <Sun className="h-5 w-5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Notificações"
                        className="text-zinc-400 hover:text-zinc-950"
                    >
                        <Bell className="h-5 w-5" />
                    </Button>
                </div>

            </div>
        </header>
    )
}

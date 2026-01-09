'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/hooks/use-sidebar-state'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface NavLink {
    label: string
    href: string
}

interface PageHeaderProps {
    links: NavLink[]
}

export function PageHeader({ links }: PageHeaderProps) {
    const pathname = usePathname()
    const { isOpen, toggle } = useSidebar()
    const pathSegments = pathname.split('/').filter(Boolean)

    return (
        <header className="sticky top-0 z-30 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md h-16 flex-none">
            <div className="max-w-[1440px] mx-auto px-8 h-full flex items-center justify-between w-full">
                {/* Eixo Esquerdo: Sidebar Toggle + Breadcrumb */}
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggle}
                        className="text-zinc-400 hover:text-zinc-950 transition-all flex-none"
                        title={isOpen ? "Recolher Sidebar" : "Expandir Sidebar"}
                    >
                        {isOpen ? (
                            <PanelLeftClose className="h-5 w-5" />
                        ) : (
                            <PanelLeftOpen className="h-5 w-5" />
                        )}
                    </Button>

                    <Breadcrumb className="hidden md:block font-sans">
                        <BreadcrumbList>
                            {pathSegments.map((segment, index) => {
                                const href = `/${pathSegments.slice(0, index + 1).join('/')}`
                                const isLast = index === pathSegments.length - 1
                                const label = segment.charAt(0).toUpperCase() + segment.slice(1)

                                return (
                                    <React.Fragment key={href}>
                                        <BreadcrumbItem>
                                            {isLast ? (
                                                <BreadcrumbPage className="capitalize font-medium text-zinc-950 font-sans">{label}</BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink href={href} className="capitalize text-zinc-500 hover:text-zinc-950 transition-colors font-sans">{label}</BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                        {!isLast && <BreadcrumbSeparator />}
                                    </React.Fragment>
                                )
                            })}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Eixo Direito: Navegação de Módulo */}
                <nav className="flex items-center gap-1 font-sans">
                    {links.map((link) => {
                        const isActive = pathname.startsWith(link.href)

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'px-4 py-2 font-medium transition-all duration-200 rounded-md whitespace-nowrap font-sans',
                                    isActive
                                        ? 'bg-zinc-100 text-zinc-950'
                                        : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50'
                                )}
                            >
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </header>
    )
}

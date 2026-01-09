'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Wallet, FileText, LogOut, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/actions/auth'
import { useSidebar } from '@/hooks/use-sidebar-state'

import { Logo } from '@/components/ui/logo'

interface SidebarProps {
    user: {
        email?: string
    }
}

const modules = [
    {
        name: 'Financeiro',
        href: '/financeiro/transacoes',
        icon: Wallet,
        pattern: /^\/financeiro/,
    },
    {
        name: 'Documentos',
        href: '/documentos',
        icon: FileText,
        pattern: /^\/documentos/,
    },
]

export function AppSidebar({ user }: SidebarProps) {
    const pathname = usePathname()
    const { isOpen, toggle } = useSidebar()

    return (
        <>
            {/* Mobile Trigger */}
            <button
                onClick={toggle}
                className="fixed top-4 left-4 z-50 md:hidden p-2 bg-zinc-950 text-white rounded-lg border border-zinc-800"
            >
                <Menu className="h-5 w-5" />
            </button>

            <aside className={cn(
                "fixed left-0 top-0 z-40 h-screen transition-all duration-300 border-r border-zinc-800 bg-zinc-950 flex flex-col font-sans",
                isOpen ? "w-64" : "w-0 -translate-x-full md:w-20 md:translate-x-0"
            )}>
                <div className={cn(
                    "p-8 h-24 flex items-center transition-all duration-300",
                    !isOpen && "md:p-0 md:justify-center"
                )}>
                    <Logo
                        variant={isOpen ? "full" : "symbol"}
                        size={isOpen ? 32 : 36}
                        className="text-white"
                    />
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-hidden">
                    {modules.map((module) => {
                        const isActive = module.pattern.test(pathname)
                        const Icon = module.icon

                        return (
                            <Link
                                key={module.name}
                                href={module.href}
                                title={module.name}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                                    isActive
                                        ? 'bg-zinc-900 text-zinc-50 shadow-sm'
                                        : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900/50'
                                )}
                            >
                                <Icon className={cn(
                                    "h-5 w-5 transition-colors",
                                    isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-50"
                                )}
                                />
                                <span className={cn(
                                    "transition-all duration-300 whitespace-nowrap",
                                    !isOpen && "md:opacity-0 md:translate-x-4"
                                )}>
                                    {module.name}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-zinc-900 bg-zinc-950 overflow-hidden">
                    <div className="flex items-center gap-3 px-2 py-3 mb-2">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <User className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div className={cn(
                            "flex-1 min-w-0 transition-all duration-300",
                            !isOpen && "md:opacity-0 md:translate-x-4"
                        )}>
                            <p className="text-sm font-semibold text-white truncate">
                                {user.email?.split('@')[0]}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <form action={signOut}>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-3 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl px-4",
                                !isOpen && "md:justify-center md:px-0"
                            )}
                            size="sm"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className={cn(
                                "transition-all duration-300",
                                !isOpen && "md:hidden"
                            )}>
                                Sair
                            </span>
                        </Button>
                    </form>
                </div>
            </aside>
        </>
    )
}

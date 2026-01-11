'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, ArrowRightLeft, TrendingUp, UserPlus, LogOut, User, Menu, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/actions/auth'
import { useSidebar } from '@/hooks/use-sidebar-state'
import { SidebarSkeleton } from '@/components/ui/skeletons'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SidebarProps {
    user: {
        email?: string
    }
}

const menuItems = [
    {
        label: 'Dashboard',
        href: '/financeiro/resumo',
        icon: LayoutDashboard,
    },
    {
        label: 'Transações',
        href: '/financeiro/transacoes',
        icon: ArrowRightLeft,
    },
    {
        label: 'Investimentos',
        href: '/financeiro/investimentos',
        icon: TrendingUp,
        disabled: true,
    },
    {
        label: 'Cadastros',
        href: '/cadastros',
        icon: UserPlus,
        disabled: true,
    },
]

export function AppSidebar({ user }: SidebarProps) {
    const pathname = usePathname()
    const { isOpen, toggle } = useSidebar()

    if (!user) {
        return <SidebarSkeleton />
    }

    // Extracting user name from metadata or using email prefix
    const userName = (user as any)?.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'


    return (
        <>
            {/* Mobile Trigger */}
            <button
                onClick={toggle}
                className="fixed top-4 left-4 z-50 md:hidden p-2 bg-zinc-950 text-white rounded-lg border border-zinc-800"
            >
                <Menu className="h-5 w-5" />
            </button>

            <aside id="main-sidebar" className={cn(
                "fixed left-0 top-0 z-40 h-screen transition-all duration-300 border-r border-zinc-800 bg-zinc-950 flex flex-col font-sans",
                isOpen ? "w-64" : "w-0 -translate-x-full md:w-20 md:translate-x-0"
            )}>
                <div className={cn(
                    "h-16 flex items-center border-b border-zinc-800 transition-all duration-300",
                    isOpen ? "px-4" : "md:px-0 md:justify-center"
                )}>
                    <span className="font-jakarta font-bold text-2xl text-white tracking-tight">
                        {isOpen ? ".wallet" : "."}
                    </span>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-hidden">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.label}
                                href={item.disabled ? '#' : item.href}
                                title={item.label}
                                aria-disabled={item.disabled}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                                    isActive
                                        ? 'bg-zinc-900 text-zinc-50 shadow-sm'
                                        : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900/50',
                                    item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                                )}
                            >
                                <Icon className={cn(
                                    "h-5 w-5 min-w-[20px] transition-colors",
                                    isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-50"
                                )}
                                />
                                <span className={cn(
                                    "transition-all duration-300 whitespace-nowrap",
                                    !isOpen && "md:opacity-0 md:translate-x-4"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-zinc-900">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full flex items-center gap-3 px-2 h-auto py-2 hover:bg-zinc-900 rounded-xl transition-all duration-300",
                                    !isOpen && "justify-center px-0"
                                )}
                            >
                                <Avatar className="h-9 w-9 shrink-0 border border-zinc-800">
                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${userName}&background=random`} />
                                    <AvatarFallback className="bg-zinc-800 text-zinc-400">
                                        {userName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {isOpen && (
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {userName}
                                        </p>
                                    </div>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="right"
                            align="end"
                            sideOffset={12}
                            className="w-56 bg-zinc-950 border-zinc-800 text-zinc-200"
                        >
                            <DropdownMenuLabel className="font-normal border-b border-zinc-900 mb-1 pb-2">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none text-white">{userName}</p>
                                    <p className="text-xs leading-none text-zinc-500 truncate">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuItem className="cursor-pointer focus:bg-zinc-900 focus:text-white">
                                <User className="mr-2 h-4 w-4" />
                                <span>Perfil</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer focus:bg-zinc-900 focus:text-white">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Configurações</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-900" />
                            <DropdownMenuItem
                                className="text-red-400 focus:text-red-400 focus:bg-red-950/20 cursor-pointer"
                                onClick={() => signOut()}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sair</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>
        </>
    )
}

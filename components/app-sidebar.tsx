'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, ArrowRightLeft, TrendingUp, UserPlus, LogOut, User, Menu, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/actions/auth'
import { useSidebar } from '@/hooks/use-sidebar-state'
import { SidebarSkeleton } from '@/components/ui/skeletons'

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

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
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'Transações',
        href: '/transacoes',
        icon: ArrowRightLeft,
    },
    {
        label: 'Investimentos',
        href: '/investimentos',
        icon: TrendingUp,
        disabled: true,
        tooltip: 'Investimentos (Em breve)',
    },
    {
        label: 'Cadastros',
        href: '/cadastros',
        icon: UserPlus,
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
        <TooltipProvider delayDuration={300}>
            {/* Mobile Trigger */}
            <button
                onClick={toggle}
                className="fixed top-4 left-4 z-50 md:hidden p-2 bg-zinc-950 text-white rounded-lg border border-zinc-800"
            >
                <Menu className="h-5 w-5" />
            </button>

            <aside id="main-sidebar" className={cn(
                "fixed left-0 top-0 z-40 h-screen transition-all duration-300 border-r border-white/5 bg-sidebar flex flex-col font-sans group/sidebar",
                isOpen ? "w-64" : "w-0 -translate-x-full md:w-20 md:translate-x-0"
            )}>
                <div className="flex items-center h-[72px] px-6 transition-all duration-300 border-b border-white/10">
                    <div className="flex items-center">
                        {/* Symbol */}
                        <div className="relative h-8 w-8 shrink-0 cursor-pointer">
                            <Image
                                src="/brand/symbol.png"
                                alt="Sollyd Symbol"
                                fill
                                className="object-contain relative z-10" // Original color
                            />
                            {/* Inner Gradient Hover Effect */}
                            <div
                                className="absolute inset-0 z-20 bg-gradient-to-t from-transparent via-[#00CEB6]/60 to-transparent opacity-0 group-hover/sidebar:opacity-100 group-hover/sidebar:animate-logo-sweep transition-opacity duration-300 pointer-events-none mix-blend-color-dodge"
                                style={{
                                    maskImage: 'url(/brand/symbol.png)',
                                    WebkitMaskImage: 'url(/brand/symbol.png)',
                                    maskSize: 'contain',
                                    WebkitMaskSize: 'contain',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskPosition: 'center',
                                    WebkitMaskPosition: 'center',
                                }}
                            />
                        </div>

                        {/* Text (Only if Open) */}
                        <span className={cn(
                            "font-jakarta font-bold text-2xl text-white tracking-tight transition-all duration-300 whitespace-nowrap overflow-hidden",
                            isOpen ? "w-auto opacity-100 ml-3" : "w-0 opacity-0 ml-0"
                        )}>
                            Sollyd
                        </span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-hidden">
                    <div className={cn(
                        "px-4 mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider font-inter",
                        !isOpen && "hidden"
                    )}>
                        Financeiro
                    </div>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        const Icon = item.icon

                        const LinkItem = (
                            <Link
                                href={item.disabled ? '#' : item.href}
                                title={isOpen && !item.disabled ? item.label : undefined} // Native title only if open and not disabled
                                aria-disabled={item.disabled}
                                onClick={(e) => item.disabled && e.preventDefault()}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden',
                                    isActive
                                        ? 'bg-sidebar-active text-white'
                                        : 'text-sidebar-muted hover:text-white hover:bg-sidebar-hover',
                                    item.disabled && "opacity-50 cursor-not-allowed" // Removed pointer-events-none
                                )}
                            >
                                <Icon className={cn(
                                    "h-5 w-5 min-w-[20px] transition-colors",
                                    isActive ? "text-white" : "text-sidebar-muted group-hover:text-white"
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

                        // Show tooltip if sidebar is closed OR if item is disabled (to show "Em breve")
                        if (!isOpen || item.disabled) {
                            return (
                                <Tooltip key={item.label}>
                                    <TooltipTrigger asChild>
                                        <div className={item.disabled ? "cursor-not-allowed" : ""}>
                                            {LinkItem}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        <p>{(item as any).tooltip || item.label}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )
                        }

                        return (
                            <div key={item.label}>
                                {LinkItem}
                            </div>
                        )
                    })}
                </nav>



                <div className="p-4 border-t border-white/10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full flex items-center gap-3 px-2 h-auto py-2 hover:bg-sidebar-hover rounded-xl transition-all duration-300 text-sidebar-muted hover:text-white",
                                    !isOpen && "justify-center px-0"
                                )}
                            >
                                <Avatar className="h-9 w-9 shrink-0 border border-white/10">
                                    {/* <AvatarImage src={user.user_metadata?.avatar_url} /> */}
                                    <AvatarFallback className="bg-[#00665C] text-white font-medium">
                                        {userName.charAt(0).toUpperCase()}
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
                            className="w-56 bg-sidebar border-white/10 text-sidebar-muted"
                        >
                            <DropdownMenuLabel className="font-normal border-b border-white/10 mb-1 pb-2">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none text-white">{userName}</p>
                                    <p className="text-xs leading-none text-sidebar-muted/70 truncate">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuItem className="cursor-pointer focus:bg-sidebar-hover focus:text-white hover:text-white">
                                <User className="mr-2 h-4 w-4" />
                                <span>Perfil</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer focus:bg-sidebar-hover focus:text-white hover:text-white">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Configurações</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
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
        </TooltipProvider>
    )
}

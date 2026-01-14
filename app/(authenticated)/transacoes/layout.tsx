import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/page-header'

export default async function TransacoesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-zinc-50 font-sans">
            {/* O TopBar e PageHeader são renderizados na page.tsx para maior controle dos filtros */}
            {children}
        </div>
    )
}

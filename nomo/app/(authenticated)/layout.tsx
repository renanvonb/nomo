import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/shared/app-sidebar'
import { SidebarProvider } from '@/hooks/use-sidebar-state'
import { MainContentWrapper } from '@/components/shared/main-content-wrapper'

import { VisibilityProvider } from '@/hooks/use-visibility-state'

export default async function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    return (
        <SidebarProvider>
            <VisibilityProvider>
                <div className="flex h-screen overflow-hidden bg-zinc-50">
                    <AppSidebar user={user} />
                    <MainContentWrapper>
                        {children}
                    </MainContentWrapper>
                </div>
            </VisibilityProvider>
        </SidebarProvider>
    )
}

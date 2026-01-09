import * as React from "react"
import { PageShell } from "@/components/shared/page-shell"
import { LayoutDashboard, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ResumoPage() {
    return (
        <PageShell
            title="Resumo"
            description="Acompanhe o desempenho das suas finanças de forma consolidada."
            isEmpty={true}
            actions={
                <Button className="bg-zinc-950 text-white hover:bg-zinc-800 flex gap-2 font-sans">
                    <Plus className="h-4 w-4" />
                    <span className="font-semibold">Nova Transação</span>
                </Button>
            }
            emptyConfig={{
                icon: LayoutDashboard,
                title: "Resumo em construção",
                description: "Estamos preparando um dashboard incrível para você acompanhar suas finanças.",
                actionText: "Saiba mais",
                onAction: () => console.log("Saiba mais clicado"),
            }}
        >
            <div className="flex-1 flex items-center justify-center">
                <p className="text-zinc-500 font-sans text-lg">Conteúdo do dashboard aqui</p>
            </div>
        </PageShell>
    )
}

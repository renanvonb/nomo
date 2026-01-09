import * as React from "react"
import { PageShell } from "@/components/shared/page-shell"
import { TrendingUp, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function InvestimentosPage() {
    return (
        <PageShell
            title="Investimentos"
            description="Gerencie sua carteira de investimentos e acompanhe rentabilidades."
            isEmpty={true}
            actions={
                <Button className="bg-zinc-950 text-white hover:bg-zinc-800 flex gap-2 font-sans">
                    <Plus className="h-4 w-4" />
                    <span className="font-semibold">Nova Transação</span>
                </Button>
            }
            emptyConfig={{
                icon: TrendingUp,
                title: "Módulo de Investimentos",
                description: "Em breve você poderá consolidar todos os seus ativos em um só lugar.",
                actionText: "Ver demonstração",
                onAction: () => console.log("Ver demonstração clicado"),
            }}
        >
            <div className="flex-1 flex items-center justify-center">
                <p className="text-zinc-500 font-sans text-lg">Gráficos de rendimento aqui</p>
            </div>
        </PageShell>
    )
}

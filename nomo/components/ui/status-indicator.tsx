import { cn } from "@/lib/utils"

interface StatusIndicatorProps {
    status: "Pendente" | "Realizado" | "Agendado" | "Atrasado"
    className?: string
}

const statusConfig = {
    Pendente: {
        color: "bg-gray-400",
        label: "Pendente"
    },
    Realizado: {
        color: "bg-green-500",
        label: "Realizado"
    },
    Agendado: {
        color: "bg-blue-500",
        label: "Agendado"
    },
    Atrasado: {
        color: "bg-orange-500",
        label: "Atrasado"
    }
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
    const config = statusConfig[status]

    return (
        <div className={cn("flex items-center gap-2 font-inter text-sm", className)}>
            <div className={cn("w-2 h-2 rounded-full", config.color)} />
            <span>{config.label}</span>
        </div>
    )
}

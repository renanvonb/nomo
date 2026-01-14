import { SidebarSkeleton } from "@/components/ui/skeletons"
import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="flex items-center justify-center w-full h-[calc(100vh-4rem)]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-medium text-zinc-500 animate-pulse">Carregando...</p>
            </div>
        </div>
    )
}

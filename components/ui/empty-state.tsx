import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const emptyStateVariants = cva(
    "flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300",
    {
        variants: {
            variant: {
                default: "bg-background",
                outlined: "border-2 border-dashed border-muted-foreground/20 bg-muted/5 rounded-2xl",
            },
            size: {
                sm: "p-6 min-h-[200px]",
                lg: "p-12 min-h-[400px]",
            },
        },
        defaultVariants: {
            variant: "outlined",
            size: "lg",
        },
    }
)

interface EmptyStateProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
    title: string
    description?: string
    icon?: LucideIcon
    action?: React.ReactNode
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
    ({ className, variant, size, title, description, icon: Icon, action, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(emptyStateVariants({ variant, size }), className)}
                {...props}
            >
                {Icon && (
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                        <Icon className="h-8 w-8 text-zinc-400" strokeWidth={1.5} />
                    </div>
                )}
                <h3 className="text-xl font-bold tracking-tight font-jakarta">{title}</h3>
                {description && (
                    <p className="mt-2 text-zinc-500 font-sans max-w-[400px]">
                        {description}
                    </p>
                )}
                {action && <div className="mt-8">{action}</div>}
            </div>
        )
    }
)
EmptyState.displayName = "EmptyState"

export { EmptyState }

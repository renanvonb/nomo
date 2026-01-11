import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface TransactionsTableSkeletonProps {
    rows?: number
}

export function TransactionsTableSkeleton({ rows = 5 }: TransactionsTableSkeletonProps) {
    return (
        <div className="relative w-full h-full overflow-auto">
            <Table>
                <TableHeader className="sticky top-0 bg-secondary z-10 shadow-sm">
                    <TableRow>
                        <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, index) => (
                        <TableRow key={index}>
                            {/* Descrição - wider skeleton */}
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                            </TableCell>

                            {/* Favorecido - Badge-sized */}
                            <TableCell>
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </TableCell>

                            {/* Categoria - Badge-sized */}
                            <TableCell>
                                <Skeleton className="h-6 w-28 rounded-full" />
                            </TableCell>

                            {/* Pagamento - Date-sized */}
                            <TableCell>
                                <Skeleton className="h-4 w-20" />
                            </TableCell>

                            {/* Valor - Right-aligned */}
                            <TableCell className="text-right">
                                <Skeleton className="h-4 w-24 ml-auto" />
                            </TableCell>

                            {/* Status - Small skeleton */}
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-2 w-2 rounded-full" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

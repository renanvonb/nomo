"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Pencil, Trash2, CircleArrowUp, CircleArrowDown, CircleDollarSign } from "lucide-react"
import type { Transaction } from "@/app/(authenticated)/financeiro/transacoes/components/columns"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { useVisibility } from "@/hooks/use-visibility-state"
import { deleteTransaction } from "@/app/actions/transactions"
import { toast } from "sonner"

interface TransactionDetailsDialogProps {
    transaction: Transaction | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onEdit: (transaction: Transaction) => void
    onSuccess: () => void
}

const transactionTypeConfig = {
    revenue: {
        icon: CircleArrowUp,
        color: "text-emerald-500",
        bgColor: "bg-emerald-50",
        label: "Receita"
    },
    expense: {
        icon: CircleArrowDown,
        color: "text-rose-500",
        bgColor: "bg-rose-50",
        label: "Despesa"
    },
    investment: {
        icon: CircleDollarSign,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        label: "Investimento"
    }
}

export function TransactionDetailsDialog({
    transaction,
    open,
    onOpenChange,
    onEdit,
    onSuccess,
}: TransactionDetailsDialogProps) {
    const [showDeleteAlert, setShowDeleteAlert] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const { isVisible } = useVisibility()

    if (!transaction) return null

    const typeConfig = transactionTypeConfig[transaction.type]
    const TypeIcon = typeConfig.icon

    const formatValue = (value: number) => {
        if (!isVisible) return "R$ ••••"
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const getStatus = (): "Pendente" | "Realizado" | "Agendado" | "Atrasado" => {
        if (transaction.payment_date !== null) return "Realizado"
        const dueDate = new Date(transaction.due_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        dueDate.setHours(0, 0, 0, 0)

        if (dueDate > today) return "Agendado"
        if (dueDate < today) return "Atrasado"
        return "Pendente"
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteTransaction(transaction.id)
            if (result.success) {
                toast.success("Transação excluída com sucesso")
                setShowDeleteAlert(false)
                onOpenChange(false)
                onSuccess()
            } else {
                toast.error(result.error || "Erro ao excluir transação")
            }
        } catch (error) {
            toast.error("Erro ao excluir transação")
        } finally {
            setIsDeleting(false)
        }
    }

    const handleEdit = () => {
        onOpenChange(false)
        onEdit(transaction)
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px] bg-white rounded-[16px]">
                    {/* Transaction Type Icon */}
                    <div className={`h-12 w-12 mx-auto mb-4 p-2 ${typeConfig.bgColor} rounded-full flex items-center justify-center`}>
                        <TypeIcon className={`h-8 w-8 ${typeConfig.color}`} />
                    </div>

                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold font-jakarta text-zinc-950 text-center">
                            {transaction.description}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-zinc-500 font-inter text-center">
                            Vencimento: {format(new Date(transaction.due_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </DialogDescription>
                    </DialogHeader>

                    <Separator className="my-2" />

                    <div className="grid gap-4 py-4">
                        {/* Descrição - Full width */}
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-zinc-700 font-inter">
                                Descrição
                            </label>
                            <p className="text-sm text-zinc-950 font-inter">
                                {transaction.description}
                            </p>
                        </div>

                        {/* Valor - Destaque visual */}
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-zinc-700 font-inter">
                                Valor
                            </label>
                            <p className="text-2xl font-bold text-zinc-950 font-jakarta">
                                {formatValue(transaction.amount)}
                            </p>
                        </div>

                        {/* Grid 2 colunas */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-zinc-700 font-inter">
                                    Favorecido
                                </label>
                                <p className="text-sm text-zinc-950 font-inter">
                                    {transaction.payees?.name || "-"}
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-zinc-700 font-inter">
                                    Categoria
                                </label>
                                <p className="text-sm text-zinc-950 font-inter">
                                    {transaction.categories?.name || "-"}
                                    {transaction.subcategories?.name && ` / ${transaction.subcategories.name}`}
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-zinc-700 font-inter">
                                    Data de Vencimento
                                </label>
                                <p className="text-sm text-zinc-950 font-inter">
                                    {format(new Date(transaction.due_date), "dd/MM/yyyy", { locale: ptBR })}
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-zinc-700 font-inter">
                                    Status
                                </label>
                                <StatusIndicator status={getStatus()} />
                            </div>
                        </div>


                        {transaction.payment_date !== null && (
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-zinc-700 font-inter">
                                    Data de Pagamento
                                </label>
                                <p className="text-sm text-zinc-950 font-inter">
                                    {format(new Date(transaction.payment_date), "dd/MM/yyyy", { locale: ptBR })}
                                </p>
                            </div>
                        )}
                    </div>

                    <Separator className="my-2" />

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteAlert(true)}
                            className="text-destructive hover:text-destructive font-inter"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                        </Button>
                        <Button onClick={handleEdit} className="font-inter">
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-jakarta">
                            Confirmar Exclusão
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-inter">
                            Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="font-inter">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-inter"
                        >
                            {isDeleting ? "Excluindo..." : "Excluir"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

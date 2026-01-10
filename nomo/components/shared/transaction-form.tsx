"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, parseISO } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet"
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/badge"
import { saveTransaction, updateTransaction, deleteTransaction } from "@/app/actions/transactions"
import { getPaymentMethods, getPayees, getCategories, getSubcategories } from "@/app/actions/transaction-data"
import { PaymentMethod, Payee, Category, Subcategory } from "@/types/transaction"
import type { Transaction } from "@/app/(authenticated)/financeiro/transacoes/components/columns"
import { toast } from "sonner"

const transactionSchema = z.object({
    description: z.string().min(1, "Descrição é obrigatória"),
    amount: z.number().gt(0, "Valor deve ser maior que zero"),
    type: z.enum(["revenue", "expense", "investment"]),
    payee_id: z.string().optional(),
    payment_method_id: z.string().min(1, "Método é obrigatório"),
    classification: z.enum(["essential", "necessary", "superfluous"]),
    category_id: z.string().min(1, "Categoria é obrigatória"),
    subcategory_id: z.string().optional(),
    due_date: z.date(),
    payment_date: z.date().optional(),
    is_installment: z.boolean(),
}).refine((data) => {
    if (data.type === 'expense' && !data.payee_id) {
        return false;
    }
    return true;
}, {
    message: "Favorecido é obrigatório para despesas",
    path: ["payee_id"],
})

type TransactionFormValues = z.infer<typeof transactionSchema>

export interface TransactionFormProps {
    open?: boolean
    transaction?: Transaction | null
    onSuccess?: () => void
    onCancel?: () => void
}

const formatCurrencyBR = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)
}

const parseCurrencyBR = (value: string) => {
    const cleanValue = value.replace(/\D/g, "")
    return Number(cleanValue) / 100
}

export function TransactionForm({ open, transaction, onSuccess, onCancel }: TransactionFormProps) {
    const [isPending, startTransition] = React.useTransition()
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
    const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([])
    const [payees, setPayees] = React.useState<Payee[]>([])
    const [allCategories, setAllCategories] = React.useState<Category[]>([])
    const [subcategories, setSubcategories] = React.useState<Subcategory[]>([])

    const isEditMode = !!transaction

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            description: "",
            amount: 0,
            type: "expense",
            payee_id: "",
            payment_method_id: "",
            classification: "necessary",
            category_id: "",
            subcategory_id: "",
            due_date: new Date(),
            payment_date: undefined,
            is_installment: false,
        },
    })

    const { formState: { isDirty }, reset, watch } = form
    const type = watch("type")
    const selectedCategoryId = watch("category_id")

    // Load transaction data when in edit mode
    React.useEffect(() => {
        if (transaction && open) {
            // Find IDs from names for proper population
            const loadTransactionData = async () => {
                const [methods, pays, cats] = await Promise.all([
                    getPaymentMethods(),
                    getPayees(),
                    getCategories()
                ])

                // Find matching IDs
                const payeeId = pays.find(p => p.name === transaction.payees?.name)?.id || ""
                const methodId = methods.find(m => m.name === transaction.payment_methods?.name)?.id || ""
                const categoryId = cats.find(c => c.name === transaction.categories?.name)?.id || ""

                // Load subcategories if category exists
                let subcategoryId = ""
                if (categoryId && transaction.subcategories?.name) {
                    const subs = await getSubcategories(categoryId)
                    subcategoryId = subs.find(s => s.name === transaction.subcategories?.name)?.id || ""
                }

                reset({
                    description: transaction.description,
                    amount: transaction.amount,
                    type: transaction.type,
                    payee_id: payeeId,
                    payment_method_id: methodId,
                    classification: "necessary",
                    category_id: categoryId,
                    subcategory_id: subcategoryId,
                    due_date: parseISO(transaction.due_date),
                    payment_date: transaction.payment_date ? parseISO(transaction.payment_date) : undefined,
                    is_installment: false,
                })
            }

            loadTransactionData()
        } else if (!open) {
            reset()
        }
    }, [transaction, open, reset])

    // Load initial data
    React.useEffect(() => {
        if (open) {
            const loadData = async () => {
                const [methods, pays, cats] = await Promise.all([
                    getPaymentMethods(),
                    getPayees(),
                    getCategories()
                ])
                setPaymentMethods(methods)
                setPayees(pays)
                setAllCategories(cats)
            }
            loadData()
        }
    }, [open])

    // Load subcategories when category changes
    React.useEffect(() => {
        if (selectedCategoryId) {
            const loadSubcategories = async () => {
                const subs = await getSubcategories(selectedCategoryId)
                setSubcategories(subs)
            }
            loadSubcategories()
        } else {
            setSubcategories([])
        }
    }, [selectedCategoryId])

    const onSubmit = async (data: TransactionFormValues) => {
        startTransition(async () => {
            try {
                const payload = {
                    ...data,
                    due_date: format(data.due_date, 'yyyy-MM-dd'),
                    payment_date: data.payment_date ? format(data.payment_date, 'yyyy-MM-dd') : null,
                }

                const result = isEditMode && transaction
                    ? await updateTransaction(transaction.id, payload)
                    : await saveTransaction(payload)

                if (result.success) {
                    toast.success(isEditMode ? "Transação atualizada com sucesso!" : "Transação registrada com sucesso!", {
                        description: `${data.description} • ${new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        }).format(data.amount)}`,
                        duration: 4000,
                    })
                    reset()
                    if (onSuccess) onSuccess()
                } else {
                    toast.error(isEditMode ? "Erro ao atualizar transação" : "Erro ao registrar transação", {
                        description: result.error || "Não foi possível salvar a transação. Tente novamente.",
                        duration: 5000,
                    })
                }
            } catch (error) {
                console.error(error)
                toast.error(isEditMode ? "Erro ao atualizar transação" : "Erro ao registrar transação", {
                    description: "Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.",
                    duration: 5000,
                })
            }
        })
    }

    const handleDelete = async () => {
        if (!transaction) return

        startTransition(async () => {
            try {
                const result = await deleteTransaction(transaction.id)
                if (result.success) {
                    setShowDeleteDialog(false)
                    toast.success("Transação excluída com sucesso!", {
                        description: transaction.description,
                    })
                    if (onSuccess) onSuccess()
                } else {
                    toast.error("Erro ao excluir transação", {
                        description: result.error || "Não foi possível excluir a transação.",
                    })
                }
            } catch (error) {
                console.error(error)
                toast.error("Erro ao excluir transação", {
                    description: "Ocorreu um erro inesperado.",
                })
            }
        })
    }

    const currencyDisplay = formatCurrencyBR(watch("amount"))

    return (
        <SheetContent className="w-[600px] sm:max-w-[600px] flex flex-col p-0 gap-0">
            <SheetHeader className="p-6 pb-4 border-b">
                <SheetTitle className="text-2xl font-bold text-zinc-950 font-jakarta">
                    {isEditMode ? "Editar transação" : "Nova transação"}
                </SheetTitle>
                <SheetDescription className="text-zinc-500 font-sans">
                    {isEditMode ? "Atualize os dados da transação" : "Preencha os dados da nova transação"}
                </SheetDescription>
            </SheetHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-6">
                            {/* Tabs de Tipo */}
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <Tabs value={field.value} onValueChange={field.onChange}>
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="revenue">Receita</TabsTrigger>
                                                <TabsTrigger value="expense">Despesa</TabsTrigger>
                                                <TabsTrigger value="investment">Investimento</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </FormItem>
                                )}
                            />

                            {/* Descrição */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Descrição</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ex: Aluguel" className="rounded-xl px-4 py-6 font-sans" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Valor e Favorecido */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Valor R$</FormLabel>
                                            <FormControl>
                                                <Input
                                                    value={currencyDisplay}
                                                    onChange={(e) => {
                                                        const parsed = parseCurrencyBR(e.target.value)
                                                        field.onChange(parsed)
                                                    }}
                                                    placeholder="0,00"
                                                    className="rounded-xl px-4 py-6 font-mono tracking-wider font-sans"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {type === 'expense' && (
                                    <FormField
                                        control={form.control}
                                        name="payee_id"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Favorecido</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="rounded-xl px-4 py-6 border-zinc-200 font-sans">
                                                            <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-white border-zinc-200 max-h-[300px]">
                                                        {payees.map(payee => (
                                                            <SelectItem key={payee.id} value={payee.id}>{payee.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            {/* Método e Classificação */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="payment_method_id"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Método</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="rounded-xl px-4 py-6 border-zinc-200 font-sans">
                                                        <SelectValue placeholder="Selecione" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-white border-zinc-200">
                                                    {paymentMethods.map(method => (
                                                        <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="classification"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Classificação</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="rounded-xl px-4 py-6 border-zinc-200 font-sans">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-white border-zinc-200">
                                                    <SelectItem value="essential">Essencial</SelectItem>
                                                    <SelectItem value="necessary">Necessário</SelectItem>
                                                    <SelectItem value="superfluous">Supérfluo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Categoria e Subcategoria */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="category_id"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Categoria</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="rounded-xl px-4 py-6 border-zinc-200 font-sans">
                                                        <SelectValue placeholder="Selecione" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-white border-zinc-200">
                                                    {allCategories.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="subcategory_id"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Subcategoria</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCategoryId}>
                                                <FormControl>
                                                    <SelectTrigger className="rounded-xl px-4 py-6 border-zinc-200 font-sans">
                                                        <SelectValue placeholder="Selecione" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-white border-zinc-200">
                                                    {subcategories.map(sub => (
                                                        <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Datas */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="due_date"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2 flex flex-col">
                                            <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Data de Vencimento</FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    className="rounded-xl px-4 py-6 font-sans"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="payment_date"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2 flex flex-col">
                                            <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Data de Pagamento</FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    className="rounded-xl px-4 py-6 font-sans"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Parcelamento */}
                            <div className="p-5 border border-zinc-200 rounded-2xl bg-zinc-50/50 mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <FormLabel className="text-base font-bold text-zinc-900 font-sans">Parcelamento</FormLabel>
                                        <Badge variant="secondary" className="bg-zinc-200 text-zinc-700 font-sans text-[10px] py-0 px-2 uppercase tracking-wider">
                                            Em breve
                                        </Badge>
                                    </div>
                                    <Switch
                                        disabled
                                        checked={false}
                                        className="data-[state=checked]:bg-zinc-950"
                                    />
                                </div>
                                <p className="text-sm text-zinc-500 font-medium font-sans">Recurso de divisão mensal indisponível.</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <SheetFooter className="p-6 border-t bg-white flex flex-row items-center justify-between flex-none">
                        <div>
                            {isEditMode && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setShowDeleteDialog(true)}
                                    disabled={isPending}
                                >
                                    Excluir
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <SheetClose asChild>
                                <Button type="button" variant="outline" onClick={onCancel}>
                                    Cancelar
                                </Button>
                            </SheetClose>
                            <Button
                                type="submit"
                                disabled={isPending || (isEditMode && !isDirty)}
                            >
                                {isPending ? "Salvando..." : "Salvar"}
                            </Button>
                        </div>
                    </SheetFooter>
                </form>
            </Form>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="z-[100]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-jakarta">Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir a transação <strong>{transaction?.description}</strong>?
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-rose-600 hover:bg-rose-700"
                        >
                            {isPending ? "Excluindo..." : "Confirmar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </SheetContent>
    )
}

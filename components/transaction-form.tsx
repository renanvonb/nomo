"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, parseISO } from "date-fns"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { MonthPicker } from "@/components/ui/month-picker"
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
import { getPaymentMethods, getCategories, getSubcategories, getWallets } from "@/app/actions/transaction-data"
import { usePayees } from "@/hooks/usePayees"
import { PaymentMethod, Payee, Category, Subcategory, Wallet } from "@/types/transaction"
import type { Transaction } from "@/types/transaction"
import { toast } from "sonner"
import { createPayee } from "@/app/actions/contacts"
import { Plus } from "lucide-react"

const transactionSchema = z.object({
    description: z.string().min(1, "Descrição é obrigatória"),
    amount: z.number().gt(0, "Valor deve ser maior que zero"),
    type: z.enum(["revenue", "expense", "investment"]),
    wallet_id: z.string().optional(),
    payee_id: z.string().optional(), // Validado no superRefine
    payment_method_id: z.string().optional(),
    classification: z.enum(["essential", "necessary", "superfluous"]).optional(),
    category_id: z.string().min(1, "Categoria é obrigatória"),
    subcategory_id: z.string().optional(),
    due_date: z.date().optional(),
    payment_date: z.date().optional(),
    competence_date: z.date().optional(),
    status: z.string().optional(),
    observation: z.string().optional(),
    is_installment: z.boolean(),
}).superRefine((data, ctx) => {
    if ((data.type === 'revenue' || data.type === 'expense') && !data.payee_id) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: data.type === 'revenue' ? "Pagador é obrigatório" : "Favorecido é obrigatório",
            path: ["payee_id"],
        })
    }
})


type TransactionFormValues = z.infer<typeof transactionSchema>

export interface TransactionFormProps {
    open?: boolean
    transaction?: Transaction | null
    defaultType?: "revenue" | "expense" | "investment"
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

export function TransactionForm({ open, transaction, defaultType = "expense", onSuccess, onCancel }: TransactionFormProps) {
    const [isPending, startTransition] = React.useTransition()
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
    const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([])

    const [allCategories, setAllCategories] = React.useState<Category[]>([])
    const [subcategories, setSubcategories] = React.useState<Subcategory[]>([])
    const [wallets, setWallets] = React.useState<Wallet[]>([])
    const [isLoadingData, setIsLoadingData] = React.useState(!!transaction)

    // Quick Create States
    const [isCreatingPayee, setIsCreatingPayee] = React.useState(false)
    const [newEntityName, setNewEntityName] = React.useState("")
    const [isCreatingEntity, setIsCreatingEntity] = React.useState(false)

    const isEditMode = !!transaction

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            description: "",
            amount: 0,
            type: defaultType,
            wallet_id: "",
            payee_id: "", // Unified field for both Payer and Payee
            payment_method_id: "",
            classification: "necessary",
            category_id: "",
            subcategory_id: "",
            due_date: new Date(),
            payment_date: undefined,
            competence_date: new Date(),
            status: "pending",
            observation: "",
            is_installment: false,
        },
    })

    const { formState: { isDirty, errors }, reset, watch, setValue } = form
    const type = watch("type")
    const { payees, setPayees } = usePayees(type)
    const selectedCategoryId = watch("category_id")

    // Load transaction data when in edit mode
    React.useEffect(() => {
        if (transaction && open) {
            const loadTransactionData = async () => {
                const [methods, cats, wals] = await Promise.all([
                    getPaymentMethods(),
                    getCategories(),
                    getWallets()
                ])
                setPaymentMethods(methods)
                setAllCategories(cats)
                setWallets(wals)

                // Hybrid lookup: try payee_id first, then fallback to payer_id or joined implementations
                // Since we are migrating, we consolidate everything into payee_id UI field
                const payeeId = transaction.payee_id || transaction.payer_id || (transaction.payees?.id) || (transaction.payers?.id) || ""

                const methodId = transaction.payment_method_id || methods.find(m => m.name === transaction.payment_methods?.name)?.id || ""
                const categoryId = transaction.category_id || cats.find(c => c.name === transaction.categories?.name)?.id || ""

                let subcategoryId = transaction.subcategory_id || ""
                if (categoryId) {
                    const subs = await getSubcategories(categoryId)
                    setSubcategories(subs)
                    if (!subcategoryId && transaction.subcategories?.name) {
                        subcategoryId = subs.find(s => s.name === transaction.subcategories?.name)?.id || ""
                    }
                }

                reset({
                    description: transaction.description,
                    amount: transaction.amount,
                    type: transaction.type,
                    payee_id: payeeId,
                    payment_method_id: methodId,
                    classification: transaction.classification || "necessary",
                    category_id: categoryId,
                    subcategory_id: subcategoryId,
                    due_date: parseISO(transaction.due_date),
                    payment_date: transaction.payment_date ? parseISO(transaction.payment_date) : undefined,
                    is_installment: false,
                    observation: transaction.observation || "",
                    competence_date: transaction.competence_date ? parseISO(transaction.competence_date) : undefined,
                    status: transaction.status || "pending",
                    wallet_id: transaction.wallet_id || "",
                })
                setIsLoadingData(false)
            }

            loadTransactionData()
        } else if (!open) {
            reset()
        }
    }, [transaction, open, reset])

    // Reset/Initialize form when opening
    React.useEffect(() => {
        if (open && !transaction) {
            // New transaction: Reset to default type
            reset({
                description: "",
                amount: 0,
                type: defaultType,
                payee_id: "",
                payment_method_id: "",
                classification: "necessary",
                category_id: "",
                subcategory_id: "",
                due_date: new Date(),
                payment_date: undefined,
                is_installment: false,
                observation: "",
                competence_date: new Date(),
                status: "pending",
                wallet_id: "",
            })
            // Load initial data
            const loadData = async () => {
                const [methods, cats, wals] = await Promise.all([
                    getPaymentMethods(),
                    getCategories(),
                    getWallets()
                ])
                setPaymentMethods(methods)
                setAllCategories(cats)
                setWallets(wals)
            }
            loadData()
        }
    }, [open, defaultType, transaction, reset])

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

    // Unified Create Contact
    const handleCreateContact = async () => {
        if (!newEntityName.trim()) return
        setIsCreatingEntity(true)
        try {
            const result = await createPayee(newEntityName)
            if (result.success && result.data) {
                setPayees(prev => [...prev, result.data!].sort((a, b) => a.name.localeCompare(b.name)))
                form.setValue("payee_id", result.data.id)
                toast.success("Contato criado com sucesso!")
                setIsCreatingPayee(false)
                setNewEntityName("")
            } else {
                toast.error(result.error || "Erro ao criar contato")
            }
        } catch (error) {
            toast.error("Erro ao criar contato")
        } finally {
            setIsCreatingEntity(false)
        }
    }

    const onSubmit = async (data: TransactionFormValues) => {
        startTransition(async () => {
            try {
                const effectiveDueDate = data.due_date || data.payment_date || new Date()

                const payload = {
                    ...data,
                    wallet_id: null,
                    due_date: format(effectiveDueDate, 'yyyy-MM-dd'),
                    payment_date: data.payment_date ? format(data.payment_date, 'yyyy-MM-dd') : null,
                    competence_date: data.competence_date ? format(data.competence_date, 'yyyy-MM-dd') : null,
                }

                if (isEditMode && transaction) {
                    await updateTransaction(transaction.id, payload)
                } else {
                    await saveTransaction(payload)
                }

                toast.success(isEditMode ? "Transação salva com sucesso!" : "Transação registrada com sucesso!")
                reset()
                if (onSuccess) onSuccess()

            } catch (error) {
                console.error(error)
                toast.error("Erro ao salvar transação")
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
                    toast.success("Transação excluída com sucesso!")
                    if (onSuccess) onSuccess()
                } else {
                    toast.error(result.error || "Erro ao excluir transação")
                }
            } catch (error) {
                console.error(error)
                toast.error("Erro ao excluir transação")
            }
        })
    }

    const currencyDisplay = formatCurrencyBR(watch("amount"))

    if (isLoadingData) {
        return (
            <SheetContent className="w-[600px] sm:max-w-[600px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </SheetContent>
        )
    }

    return (
        <SheetContent className="w-[600px] sm:max-w-[600px] flex flex-col p-0 gap-0">
            <SheetHeader className="p-6 pb-4 border-b">
                <SheetTitle className="text-2xl font-bold text-zinc-950 font-jakarta">
                    {isEditMode
                        ? "Editar transação"
                        : type === 'revenue'
                            ? "Nova receita"
                            : type === 'expense'
                                ? "Nova despesa"
                                : "Novo investimento"
                    }
                </SheetTitle>
                <SheetDescription className="text-zinc-500 font-sans">
                    {isEditMode ? "Atualize os dados da transação" : "Preencha os dados da nova transação"}
                </SheetDescription>
            </SheetHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-4">
                            {/* Descrição */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Descrição</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder={type === 'revenue' ? "Ex: Salário Mensal" : "Ex: Aluguel"} className="rounded-xl px-4 py-6 font-sans" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Valor e Carteira */}
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

                                <FormField
                                    control={form.control}
                                    name="wallet_id"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Carteira</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                                                <FormControl>
                                                    <SelectTrigger className="rounded-xl px-4 py-6 border-zinc-200 font-sans">
                                                        <SelectValue placeholder="Selecione" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-white border-zinc-200">
                                                    {wallets.map(wallet => (
                                                        <SelectItem key={wallet.id} value={wallet.id}>{wallet.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Campos Específicos por Tipo */}
                            {type === 'expense' && (
                                <>
                                    {/* Favorecido e Classificação */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="payee_id"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Favorecido</FormLabel>
                                                    <div className="flex gap-2">
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="rounded-xl px-4 py-6 border-zinc-200 font-sans flex-1">
                                                                    <SelectValue placeholder="Selecione" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="bg-white border-zinc-200 max-h-[300px]">
                                                                {payees?.map(payee => (
                                                                    <SelectItem key={payee.id} value={payee.id}>{payee.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-[52px] w-[52px] rounded-xl shrink-0"
                                                            onClick={() => {
                                                                setNewEntityName("")
                                                                setIsCreatingPayee(true)
                                                            }}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
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
                                                    <Select onValueChange={field.onChange} value={field.value || "necessary"}>
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
                                    {/* Categoria etc ... */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="category_id"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Categoria</FormLabel>
                                                    <Select onValueChange={(val) => {
                                                        field.onChange(val)
                                                        form.setValue("subcategory_id", "")
                                                    }} value={field.value}>
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
                                        {/* Subcat ... */}
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
                                                            {subcategories?.map(sub => (
                                                                <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    {/* Dates ... */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="competence_date"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2 flex flex-col">
                                                    <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Competência</FormLabel>
                                                    <FormControl>
                                                        <MonthPicker value={field.value} onChange={field.onChange} className="w-full rounded-xl h-[50px]" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="due_date"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2 flex flex-col">
                                                    <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Vencimento</FormLabel>
                                                    <FormControl>
                                                        <DatePicker value={field.value} onChange={field.onChange} className="rounded-xl px-4 py-6 font-sans w-full" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="payment_date"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2 flex flex-col">
                                                    <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Pagamento</FormLabel>
                                                    <FormControl>
                                                        <DatePicker value={field.value} onChange={field.onChange} className="rounded-xl px-4 py-6 font-sans w-full" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Status</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || "pending"}>
                                                        <FormControl>
                                                            <SelectTrigger className="rounded-xl px-4 py-6 border-zinc-200 font-sans">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-white border-zinc-200">
                                                            <SelectItem value="pending">Pendente</SelectItem>
                                                            <SelectItem value="paid">Pago</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </>
                            )}

                            {type === 'revenue' && (
                                <>
                                    {/* Pagador e Categoria */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="payee_id"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Pagador</FormLabel>
                                                    <div className="flex gap-2">
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="rounded-xl px-4 py-6 border-zinc-200 font-sans flex-1">
                                                                    <SelectValue placeholder="Selecione" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="bg-white border-zinc-200 max-h-[300px]">
                                                                {payees?.map(payee => (
                                                                    <SelectItem key={payee.id} value={payee.id}>{payee.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-[52px] w-[52px] rounded-xl shrink-0"
                                                            onClick={() => {
                                                                setNewEntityName("")
                                                                setIsCreatingPayee(true)
                                                            }}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="category_id"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Categoria</FormLabel>
                                                    <Select onValueChange={(val) => {
                                                        field.onChange(val)
                                                        form.setValue("subcategory_id", "")
                                                    }} value={field.value}>
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
                                    </div>
                                    {/* Dates ... */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="competence_date"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2 flex flex-col">
                                                    <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Competência</FormLabel>
                                                    <FormControl>
                                                        <MonthPicker value={field.value} onChange={field.onChange} className="w-full rounded-xl h-[50px]" />
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
                                                    <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Data de Recebimento</FormLabel>
                                                    <FormControl>
                                                        <DatePicker value={field.value} onChange={field.onChange} className="rounded-xl px-4 py-6 font-sans w-full" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Status</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || "received"}>
                                                        <FormControl>
                                                            <SelectTrigger className="rounded-xl px-4 py-6 border-zinc-200 font-sans">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-white border-zinc-200">
                                                            <SelectItem value="pending">Pendente</SelectItem>
                                                            <SelectItem value="received">Recebido</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Observação (Comum) */}
                            <FormField
                                control={form.control}
                                name="observation"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-semibold text-zinc-900 font-sans">Observação</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Adicione uma observação..." className="resize-none rounded-xl" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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

            {/* Create Contact Dialog */}
            <Dialog open={isCreatingPayee} onOpenChange={setIsCreatingPayee}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Contato</DialogTitle>
                        <DialogDescription>
                            Adicione um novo contato para usar como pagador ou favorecido.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Nome do contato"
                            value={newEntityName}
                            onChange={(e) => setNewEntityName(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreatingPayee(false)}>Cancelar</Button>
                        <Button onClick={handleCreateContact} disabled={!newEntityName.trim() || isCreatingEntity}>
                            {isCreatingEntity ? "Criando..." : "Criar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SheetContent>
    )
}

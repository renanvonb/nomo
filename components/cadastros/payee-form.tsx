'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { ColorPicker, getColorClass } from "./color-picker"
import { IconPicker, getIconByName } from "./icon-picker"
import { useEffect, useState } from "react"
import { createPayee, updatePayee } from "@/lib/supabase/cadastros"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    color: z.string().min(1, "Cor é obrigatória"),
    icon: z.string().min(1, "Ícone é obrigatório"),
})

export type PayeeFormValues = z.infer<typeof formSchema>;

interface PayeeFormProps {
    defaultValues?: Partial<PayeeFormValues>;
    payeeId?: string;
    type: 'payer' | 'favored' | 'both';
    onSuccess: () => void;
    onCancel: () => void;
    onDelete?: () => void;
}

export function PayeeForm({
    defaultValues,
    payeeId,
    type,
    onSuccess,
    onCancel,
    onDelete,
}: PayeeFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<PayeeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            color: 'zinc',
            icon: 'user',
            ...defaultValues
        },
    })

    const { watch } = form;
    const watchName = watch('name');
    const watchColor = watch('color');
    const watchIcon = watch('icon');

    useEffect(() => {
        if (defaultValues) {
            form.reset({
                name: '',
                color: 'zinc',
                icon: 'user',
                ...defaultValues
            });
        }
    }, [defaultValues, form]);

    const handleSubmit = async (values: PayeeFormValues) => {
        try {
            setIsSubmitting(true);
            const payload = { ...values, type };

            if (payeeId) {
                await updatePayee(payeeId, payload);
                toast.success(`${type === 'payer' ? 'Pagador' : 'Beneficiário'} atualizado com sucesso!`);
            } else {
                await createPayee(payload);
                toast.success(`${type === 'payer' ? 'Pagador' : 'Beneficiário'} criado com sucesso!`);
            }
            onSuccess();
        } catch (error: any) {
            console.error('Error saving payee:', error);
            toast.error(error.message || 'Erro ao salvar registro');
        } finally {
            setIsSubmitting(false);
        }
    };

    const PreviewBadge = () => {
        const IconComp = getIconByName(watchIcon);
        const colorClass = getColorClass(watchColor);

        return (
            <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200 mb-4">
                <div className={cn('rounded-full p-2', colorClass)}>
                    <IconComp className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-zinc-900">
                    {watchName || (type === 'payer' ? 'Nome do pagador' : 'Nome do beneficiário')}
                </span>
            </div>
        );
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <PreviewBadge />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={form.formState.errors.name ? "text-red-600" : ""}>
                                Nome <span className="text-red-600">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Ex: Mercado Livre, Netflix" className="font-inter" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ícone</FormLabel>
                            <FormControl>
                                <IconPicker value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cor</FormLabel>
                            <FormControl>
                                <ColorPicker value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className={onDelete ? "flex justify-between gap-2 pt-4" : "flex justify-end gap-2 pt-4"}>
                    {onDelete && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onDelete}
                            disabled={isSubmitting}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            Excluir
                        </Button>
                    )}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#00665C] hover:bg-[#00665C]/90"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Salvar'
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}

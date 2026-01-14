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
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColorPicker, getColorClass } from "./color-picker"
import { getIconByName } from "./icon-picker"
import { useEffect, useState } from "react"
import { createWallet, updateWallet, setWalletAsPrincipal } from "@/lib/supabase/cadastros"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    color: z.string().min(1, "Cor é obrigatória"),
    icon: z.string().min(1, "Ícone é obrigatório"),
    is_principal: z.boolean(),
})

export type WalletFormValues = z.infer<typeof formSchema>;

interface WalletFormProps {
    defaultValues?: Partial<WalletFormValues>;
    walletId?: string;
    onSuccess: () => void;
    onCancel: () => void;
    onDelete?: () => void;
}

export function WalletForm({
    defaultValues,
    walletId,
    onSuccess,
    onCancel,
    onDelete,
}: WalletFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<WalletFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            color: 'zinc',
            icon: 'dollar-sign',
            is_principal: false,
            ...defaultValues,
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
                icon: 'dollar-sign',
                is_principal: false,
                ...defaultValues,
            });
        }
    }, [defaultValues, form]);

    const handleSubmit = async (values: WalletFormValues) => {
        try {
            setIsSubmitting(true);
            if (walletId) {
                await updateWallet(walletId, values);
                if (values.is_principal) {
                    await setWalletAsPrincipal(walletId);
                }
                toast.success('Carteira atualizada com sucesso!');
            } else {
                const newWallet = await createWallet(values);
                if (values.is_principal && newWallet.id) {
                    await setWalletAsPrincipal(newWallet.id);
                }
                toast.success('Carteira criada com sucesso!');
            }
            onSuccess();
        } catch (error: any) {
            console.error('Error saving wallet:', error);
            toast.error(error.message || 'Erro ao salvar carteira');
        } finally {
            setIsSubmitting(false);
        }
    };

    const PreviewBadge = () => {
        // Always display dollar-sign visually, even though we store type info in the icon field
        const IconComp = getIconByName('dollar-sign');
        const colorClass = getColorClass(watchColor);

        return (
            <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200 mb-4">
                <div className={cn('rounded-full p-2', colorClass)}>
                    <IconComp className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-zinc-900">
                    {watchName || 'Nome da carteira'}
                </span>
            </div>
        );
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <PreviewBadge />

                <div className="pb-2">
                    <Tabs
                        defaultValue={watchIcon === 'building-2' || watchIcon === 'building' ? 'corporate' : 'individual'}
                        className="w-full"
                        onValueChange={(value) => {
                            // Store the type in the icon field, even if we don't display it
                            form.setValue('icon', value === 'corporate' ? 'building-2' : 'user-round', { shouldDirty: true });
                        }}
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="individual">Pessoa física</TabsTrigger>
                            <TabsTrigger value="corporate">Pessoa jurídica</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={form.formState.errors.name ? "text-red-600" : ""}>
                                Nome <span className="text-red-600">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Informe o nome da carteira" className="font-inter" />
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

                <FormField
                    control={form.control}
                    name="is_principal"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 space-y-0 !mt-6 text-zinc-950">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Carteira principal</FormLabel>
                                <p className="text-sm text-zinc-500 font-inter">
                                    Definir como padrão para novas transações
                                </p>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
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

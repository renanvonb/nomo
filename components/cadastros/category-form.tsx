'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { ColorPicker } from "./color-picker"
import { IconPicker } from "./icon-picker"
import { Classification } from "@/types/entities"
import { useEffect, useState } from "react"
import { createCategory, updateCategory } from "@/lib/supabase/cadastros"
import { toast } from "sonner"

const formSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório").max(50, "Máximo 50 caracteres"),
    description: z.string().max(200, "Máximo 200 caracteres").optional(),
    classification_id: z.string().optional(),
    icon: z.string().min(1, "Ícone é obrigatório"),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor inválida"),
})

export type CategoryFormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
    defaultValues?: Partial<CategoryFormValues>;
    categoryId?: string;
    classifications: Classification[];
    onSuccess: () => void;
    onCancel: () => void;
    onDelete?: () => void;
}

export function CategoryForm({
    defaultValues,
    categoryId,
    classifications,
    onSuccess,
    onCancel,
    onDelete,
}: CategoryFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            classification_id: '',
            icon: 'Folder',
            color: '#00665C',
            ...defaultValues
        },
    })

    // Reset form when defaultValues change (e.g. switching between edit/create)
    useEffect(() => {
        if (defaultValues) {
            form.reset({
                name: '',
                description: '',
                classification_id: '',
                icon: 'Folder',
                color: '#00665C',
                ...defaultValues
            });
        }
    }, [defaultValues, form]);

    const handleSubmit = async (values: CategoryFormValues) => {
        try {
            setIsSubmitting(true);

            // Sanitize payload: convert empty strings to undefined to avoid UUID errors or empty text
            const payload = {
                ...values,
                description: values.description || undefined,
                classification_id: values.classification_id || undefined,
            };

            // Helper functions handle user_id injection via auth.getUser() implicitly/explicitly
            if (categoryId) {
                await updateCategory(categoryId, payload);
                toast.success('Categoria atualizada com sucesso!');
            } else {
                await createCategory(payload);
                toast.success('Categoria criada com sucesso!');
            }
            onSuccess();
        } catch (error: any) {
            console.error('Error saving category:', error);
            toast.error(error.message || 'Erro ao salvar categoria');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={form.formState.errors.name ? "text-destructive" : ""}>Nome *</FormLabel>
                            <FormControl>
                                <Input {...field} className="font-inter" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                                <Textarea {...field} className="font-inter" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="classification_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Classificação</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="font-inter">
                                        <SelectValue placeholder="Selecione uma classificação" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {classifications.map((item) => (
                                        <SelectItem key={item.id} value={item.id}>
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                Opcional, usado para agrupamento.
                            </FormDescription>
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
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
                                    Salvando
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

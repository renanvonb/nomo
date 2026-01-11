'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export interface FieldConfig {
    name: string;
    label: string;
    type: 'text' | 'select' | 'file';
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
}

export interface CrudBaseProps<T> {
    title: string;
    description: string;
    fields: FieldConfig[];
    data: T[];
    loading: boolean;
    onRefresh: () => Promise<void>;
    onCreate: (item: any) => Promise<any>;
    onUpdate: (id: string, item: any) => Promise<any>;
    onDelete: (id: string) => Promise<void>;
    renderRow: (item: T) => React.ReactNode;
    getItemId: (item: T) => string;
    emptyMessage?: string;
}

// =====================================================
// COMPONENT
// =====================================================

export function CrudBase<T>({
    title,
    description,
    fields,
    data,
    loading,
    onRefresh,
    onCreate,
    onUpdate,
    onDelete,
    renderRow,
    getItemId,
    emptyMessage = 'Nenhum registro encontrado.',
}: CrudBaseProps<T>) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    // Reset form when dialog closes
    useEffect(() => {
        if (!isDialogOpen) {
            setFormData({});
            setFormErrors({});
            setEditingItem(null);
        }
    }, [isDialogOpen]);

    // Populate form when editing
    useEffect(() => {
        if (editingItem) {
            const data: Record<string, any> = {};
            fields.forEach((field) => {
                data[field.name] = (editingItem as any)[field.name] || '';
            });
            setFormData(data);
        }
    }, [editingItem, fields]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        fields.forEach((field) => {
            if (field.required && !formData[field.name]) {
                errors[field.name] = `${field.label} é obrigatório`;
            }
        });
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            if (editingItem) {
                await onUpdate(getItemId(editingItem), formData);
                toast.success(`${title} atualizado com sucesso!`);
            } else {
                await onCreate(formData);
                toast.success(`${title} criado com sucesso!`);
            }
            setIsDialogOpen(false);
            await onRefresh();
        } catch (error: any) {
            toast.error(error.message || 'Erro ao salvar');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;

        setSubmitting(true);
        try {
            await onDelete(deletingId);
            toast.success(`${title} excluído com sucesso!`);
            setIsDeleteDialogOpen(false);
            setDeletingId(null);
            await onRefresh();
        } catch (error: any) {
            toast.error(error.message || 'Erro ao excluir');
        } finally {
            setSubmitting(false);
        }
    };

    const openCreateDialog = () => {
        setEditingItem(null);
        setFormData({});
        setIsDialogOpen(true);
    };

    const openEditDialog = (item: T) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const openDeleteDialog = (id: string) => {
        setDeletingId(id);
        setIsDeleteDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold font-jakarta text-zinc-900">{title}</h2>
                    <p className="text-sm text-zinc-600 mt-1">{description}</p>
                </div>
                <Button
                    onClick={openCreateDialog}
                    className="bg-primary hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                </Button>
            </div>

            {/* Table */}
            <div className="border rounded-lg bg-white">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                        {emptyMessage}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {fields.map((field) => (
                                    <TableHead key={field.name}>{field.label}</TableHead>
                                ))}
                                <TableHead className="w-[100px]">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item) => (
                                <TableRow key={getItemId(item)}>
                                    {renderRow(item)}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEditDialog(item)}
                                                className="h-8 w-8"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openDeleteDialog(getItemId(item))}
                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="font-jakarta">
                            {editingItem ? `Editar ${title}` : `Novo ${title}`}
                        </DialogTitle>
                        <DialogDescription>
                            {editingItem
                                ? `Atualize as informações do ${title.toLowerCase()}.`
                                : `Preencha os dados para criar um novo ${title.toLowerCase()}.`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {fields.map((field) => (
                            <div key={field.name} className="space-y-2">
                                <Label
                                    htmlFor={field.name}
                                    className={cn(
                                        'text-sm font-medium',
                                        formErrors[field.name] && 'text-red-600'
                                    )}
                                >
                                    {field.label}
                                    {field.required && <span className="text-red-600 ml-1">*</span>}
                                </Label>

                                {field.type === 'select' ? (
                                    <select
                                        id={field.name}
                                        value={formData[field.name] || ''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, [field.name]: e.target.value })
                                        }
                                        className={cn(
                                            'w-full h-10 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                                            formErrors[field.name] && 'border-red-500 focus:ring-red-500'
                                        )}
                                    >
                                        <option value="">Selecione...</option>
                                        {field.options?.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <Input
                                        id={field.name}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={formData[field.name] || ''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, [field.name]: e.target.value })
                                        }
                                        className={cn(
                                            formErrors[field.name] && 'border-red-500 focus-visible:ring-red-500'
                                        )}
                                    />
                                )}

                                {formErrors[field.name] && (
                                    <p className="text-sm text-red-600">{formErrors[field.name]}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={submitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Salvar'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-jakarta">Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir este {title.toLowerCase()}? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={submitting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Excluindo...
                                </>
                            ) : (
                                'Excluir'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

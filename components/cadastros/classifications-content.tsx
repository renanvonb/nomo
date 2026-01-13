'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Classification } from '@/types/entities';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { ColorPicker } from './color-picker';
import { IconPicker } from './icon-picker';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/empty-state';
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

interface ClassificationsContentProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ClassificationsContent({ isOpen, onOpenChange }: ClassificationsContentProps) {
    const [classifications, setClassifications] = useState<Classification[]>([]);
    const [loading, setLoading] = useState(true);
    // isDialogOpen removed (controlled by props)
    const [editingItem, setEditingItem] = useState<Classification | null>(null);
    const [deleteItem, setDeleteItem] = useState<Classification | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#00665C',
        icon: 'Tag',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const supabase = createClient();

    // Clear form when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setEditingItem(null);
            setFormData({
                name: '',
                description: '',
                color: '#00665C',
                icon: 'Tag',
            });
            setErrors({});
        }
    }, [isOpen]);

    useEffect(() => {
        fetchClassifications();
    }, []);

    const fetchClassifications = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error('Sessão expirada. Faça login novamente.');
                return;
            }

            const { data, error } = await supabase
                .from('classifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                // Check if error is due to missing columns
                if (error.message?.includes('column') && (error.message?.includes('icon') || error.message?.includes('color'))) {
                    console.error('Classifications table is missing icon/color columns. Please run migration 007.');
                    toast.error('Tabela de classificações precisa ser atualizada. Execute a migração do banco de dados.');
                    setClassifications([]);
                    return;
                }
                throw error;
            }

            setClassifications(data || []);
        } catch (error: any) {
            console.error('Error fetching classifications:', error);
            toast.error(`Erro ao carregar classificações: ${error.message || 'Erro desconhecido'}`);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        } else if (formData.name.length > 50) {
            newErrors.name = 'Máximo 50 caracteres';
        }

        if (!formData.description?.trim()) {
            newErrors.description = 'Descrição é obrigatória';
        } else if (formData.description.length > 200) {
            newErrors.description = 'Máximo 200 caracteres';
        }

        if (!formData.icon) {
            newErrors.icon = 'Ícone é obrigatório';
        }

        if (!/^#[0-9A-F]{6}$/i.test(formData.color)) {
            newErrors.color = 'Cor inválida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setSubmitting(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error('Sessão expirada. Faça login novamente.');
                return;
            }

            if (editingItem) {
                // Update
                const { error } = await supabase
                    .from('classifications')
                    .update({
                        name: formData.name.trim(),
                        description: formData.description?.trim() || null,
                        color: formData.color,
                        icon: formData.icon,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editingItem.id)
                    .eq('user_id', user.id);

                if (error) throw error;
                toast.success('Classificação atualizada com sucesso!');
            } else {
                // Create
                const { error } = await supabase
                    .from('classifications')
                    .insert([{
                        user_id: user.id,
                        name: formData.name.trim(),
                        description: formData.description?.trim() || null,
                        color: formData.color,
                        icon: formData.icon,
                    }]);

                if (error) throw error;
                toast.success('Classificação criada com sucesso!');
            }

            onOpenChange(false);
            fetchClassifications();
        } catch (error) {
            console.error('Error saving classification:', error);
            toast.error('Erro ao salvar classificação');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (item: Classification) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            color: item.color,
            icon: item.icon,
        });
        setErrors({});
        onOpenChange(true);
    };

    const handleDelete = async () => {
        if (!deleteItem) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error('Sessão expirada. Faça login novamente.');
                return;
            }

            const { error } = await supabase
                .from('classifications')
                .delete()
                .eq('id', deleteItem.id)
                .eq('user_id', user.id);

            if (error) throw error;

            // Atualizar estado local imediatamente
            setClassifications(prev => prev.filter(item => item.id !== deleteItem.id));

            toast.success('Classificação excluída com sucesso!');
        } catch (error: any) {
            console.error('Error deleting classification:', error);
            if (error.code === '23503') {
                toast.error('Não é possível excluir classificação vinculada a outros registros');
            } else {
                toast.error('Erro ao excluir classificação');
            }
        } finally {
            setDeleteItem(null);
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00665C]" />
                </div>
            ) : classifications.length === 0 ? (
                <EmptyState
                    variant="outlined"
                    size="lg"
                    icon={Icons.Tag}
                    title="Nenhuma classificação cadastrada"
                    description="Comece criando sua primeira classificação para organizar suas despesas"
                    action={
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(true)}
                            className="font-inter"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar
                        </Button>
                    }
                    className="flex-1 bg-card"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {classifications.map((item) => {
                        const Icon = (Icons[item.icon as keyof typeof Icons] as LucideIcon) || Icons.Tag;

                        return (
                            <Card
                                key={item.id}
                                className="relative group hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleEdit(item)}
                            >
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: item.color }}
                                    >
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="font-jakarta truncate">{item.name}</CardTitle>
                                        {item.description && (
                                            <CardDescription className="font-inter line-clamp-2">
                                                {item.description}
                                            </CardDescription>
                                        )}
                                    </div>
                                </CardHeader>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="font-jakarta">
                            {editingItem ? 'Editar Classificação' : 'Nova Classificação'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nome */}
                        <div>
                            <Label
                                htmlFor="name"
                                className={errors.name ? 'text-destructive' : ''}
                            >
                                Nome *
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`font-inter ${errors.name ? 'border-destructive' : ''}`}
                                maxLength={50}
                            />
                            {!errors.name && (
                                <p className="text-sm text-zinc-500 mt-1 font-inter">
                                    Digite o nome da classificação
                                </p>
                            )}
                            {errors.name && (
                                <p className="text-sm text-destructive mt-1 font-inter">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Descrição */}
                        <div>
                            <Label htmlFor="description" className={errors.description ? 'text-destructive' : ''}>Descrição *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="font-inter"
                                maxLength={200}
                                rows={3}
                            />
                            <p className="text-sm text-zinc-500 mt-1 font-inter">
                                Máximo 200 caracteres
                            </p>
                            {errors.description && (
                                <p className="text-sm text-destructive mt-1 font-inter">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Ícone */}
                        <div>
                            <Label
                                htmlFor="icon"
                                className={errors.icon ? 'text-destructive' : ''}
                            >
                                Ícone *
                            </Label>
                            <IconPicker
                                value={formData.icon}
                                onChange={(icon) => setFormData({ ...formData, icon })}
                            />
                            {errors.icon && (
                                <p className="text-sm text-destructive mt-1 font-inter">
                                    {errors.icon}
                                </p>
                            )}
                        </div>

                        {/* Cor */}
                        <div>
                            <Label htmlFor="color">Cor</Label>
                            <ColorPicker
                                value={formData.color}
                                onChange={(color) => setFormData({ ...formData, color })}
                            />
                        </div>

                        <DialogFooter className={editingItem ? "sm:justify-between" : ""}>
                            {editingItem && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setDeleteItem(editingItem);
                                        onOpenChange(false);
                                    }}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    Excluir
                                </Button>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={submitting}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-[#00665C] hover:bg-[#00665C]/90"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        'Salvar'
                                    )}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-jakarta">Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription className="font-inter">
                            Tem certeza que deseja excluir a classificação <strong>{deleteItem?.name}</strong>?
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}



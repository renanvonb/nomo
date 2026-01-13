'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Category, Subcategory, Classification } from '@/types/entities';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Plus, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { ColorPicker } from './color-picker';
import { IconPicker } from './icon-picker';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { createCategory, updateCategory } from '@/lib/supabase/cadastros';
import { CategoryForm, CategoryFormValues } from './category-form';

interface CategoriesContentProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CategoriesContent({ isOpen, onOpenChange }: CategoriesContentProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [classifications, setClassifications] = useState<Classification[]>([]);
    const [subcategories, setSubcategories] = useState<Record<string, Subcategory[]>>({});
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    // isDialogOpen removed (controlled by props)
    const [editingItem, setEditingItem] = useState<Category | null>(null);
    const [deleteItem, setDeleteItem] = useState<Category | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Subcategory dialog state
    const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
    const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
    const [selectedCategoryForSub, setSelectedCategoryForSub] = useState<string | null>(null);
    const [deleteSubcategory, setDeleteSubcategory] = useState<Subcategory | null>(null);

    // Form state
    // Category Form State is handled by React Hook Form in CategoryForm component

    // Subcategory Form State
    const [subcategoryFormData, setSubcategoryFormData] = useState({
        name: '',
        description: '',
    });

    const [subcategoryErrors, setSubcategoryErrors] = useState<Record<string, string>>({});

    const supabase = createClient();

    // Clear editing state when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setEditingItem(null);
        }
    }, [isOpen]);

    const openCreateDialog = () => {
        setEditingItem(null);
        onOpenChange(true);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // Carregar classificações primeiro para garantir que o formulário tenha dados
        await fetchClassifications();
        await fetchCategories();
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error('Sessão expirada. Faça login novamente.');
                return;
            }

            const { data, error } = await supabase
                .from('categories')
                .select('*, classifications(*)')
                .eq('user_id', user.id)
                .order('name', { ascending: true });

            if (error) {
                // Check if error is due to missing user_id column
                if (error.message?.includes('column') && error.message?.includes('user_id') && error.message?.includes('does not exist')) {
                    console.error('Categories table is missing user_id column. Please run migration 007.');
                    toast.error('Migração 007 necessária! Consulte docs/EXECUTAR_MIGRACAO_007.md', {
                        duration: 10000,
                    });
                    setCategories([]);
                    return;
                }
                // Check if error is due to missing table
                if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
                    console.error('Categories table does not exist. Please run migration 007.');
                    toast.error('Tabela de categorias não encontrada. Execute a migração 007.', {
                        duration: 10000,
                    });
                    setCategories([]);
                    return;
                }
                throw error;
            }

            setCategories(data || []);

            // Fetch subcategories for each category
            if (data && data.length > 0) {
                const categoryIds = data.map(c => c.id);
                const { data: subsData, error: subsError } = await supabase
                    .from('subcategories')
                    .select('*')
                    .in('category_id', categoryIds)
                    .eq('user_id', user.id);

                if (subsError) {
                    if (subsError.message?.includes('relation') && subsError.message?.includes('does not exist')) {
                        console.error('Subcategories table does not exist. Please run migration 007.');
                        setSubcategories({});
                        return;
                    }
                    throw subsError;
                }

                // Group subcategories by category_id
                const grouped: Record<string, Subcategory[]> = {};
                subsData?.forEach(sub => {
                    if (!grouped[sub.category_id]) {
                        grouped[sub.category_id] = [];
                    }
                    grouped[sub.category_id].push(sub);
                });
                setSubcategories(grouped);
            }
        } catch (error: any) {
            console.error('Error fetching categories:', error);
            toast.error(`Erro ao carregar categorias: ${error.message || 'Erro desconhecido'}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchClassifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { data, error } = await supabase
                .from('classifications')
                .select('*')
                .order('name');

            if (error) {
                if (error.code === '42P01' || error.message.includes('does not exist')) {
                    console.warn('Tabela classifications não existe.');
                    // Não bloquear o uso, apenas avisar
                    toast.error('Tabela de classificações não encontrada (Migração 012 necessária).');
                    return;
                }
                throw error;
            }
            setClassifications(data || []);
        } catch (error) {
            console.error('Error fetching classifications:', error);
            toast.error('Erro ao carregar classificações');
        }
    };



    const handleEdit = (item: Category) => {
        setEditingItem(item);
        // Form values will be passed via defaultValues prop
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

            // Check if category has subcategories
            const subs = subcategories[deleteItem.id] || [];
            if (subs.length > 0) {
                toast.error('Não é possível excluir categoria com subcategorias vinculadas');
                setDeleteItem(null);
                return;
            }

            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', deleteItem.id)
                .eq('user_id', user.id);

            if (error) throw error;

            // Atualizar estado local imediatamente
            setCategories(prev => prev.filter(cat => cat.id !== deleteItem.id));
            setSubcategories(prev => {
                const newSubs = { ...prev };
                delete newSubs[deleteItem.id];
                return newSubs;
            });

            toast.success('Categoria excluída com sucesso!');
        } catch (error: any) {
            console.error('Error deleting category:', error);
            toast.error('Erro ao excluir categoria');
        } finally {
            setDeleteItem(null);
        }
    };

    const toggleCategory = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const openSubcategoryDialog = (categoryId: string, subcategory?: Subcategory) => {
        setSelectedCategoryForSub(categoryId);
        setEditingSubcategory(subcategory || null);
        setSubcategoryFormData({
            name: subcategory?.name || '',
            description: subcategory?.description || '',
        });
        setSubcategoryErrors({});
        setIsSubcategoryDialogOpen(true);
    };

    const validateSubcategoryForm = () => {
        const newErrors: Record<string, string> = {};

        if (!subcategoryFormData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        } else if (subcategoryFormData.name.length > 50) {
            newErrors.name = 'Máximo 50 caracteres';
        }

        if (subcategoryFormData.description && subcategoryFormData.description.length > 200) {
            newErrors.description = 'Máximo 200 caracteres';
        }

        setSubcategoryErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubcategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateSubcategoryForm() || !selectedCategoryForSub) return;

        try {
            setSubmitting(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error('Sessão expirada. Faça login novamente.');
                return;
            }

            if (editingSubcategory) {
                // Update
                const { error } = await supabase
                    .from('subcategories')
                    .update({
                        name: subcategoryFormData.name.trim(),
                        description: subcategoryFormData.description?.trim() || null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editingSubcategory.id)
                    .eq('user_id', user.id);

                if (error) throw error;
                toast.success('Subcategoria atualizada com sucesso!');
            } else {
                // Create
                const { error } = await supabase
                    .from('subcategories')
                    .insert([{
                        user_id: user.id,
                        category_id: selectedCategoryForSub,
                        name: subcategoryFormData.name.trim(),
                        description: subcategoryFormData.description?.trim() || null,
                    }]);

                if (error) throw error;
                toast.success('Subcategoria criada com sucesso!');
            }

            setIsSubcategoryDialogOpen(false);
            fetchCategories();
        } catch (error) {
            console.error('Error saving subcategory:', error);
            toast.error('Erro ao salvar subcategoria');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSubcategory = async () => {
        if (!deleteSubcategory) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error('Sessão expirada. Faça login novamente.');
                return;
            }

            const { error } = await supabase
                .from('subcategories')
                .delete()
                .eq('id', deleteSubcategory.id)
                .eq('user_id', user.id);

            if (error) throw error;

            // Atualizar estado local imediatamente
            if (deleteSubcategory.category_id) {
                setSubcategories(prev => ({
                    ...prev,
                    [deleteSubcategory.category_id!]: (prev[deleteSubcategory.category_id!] || []).filter(
                        sub => sub.id !== deleteSubcategory.id
                    )
                }));
            }

            toast.success('Subcategoria excluída com sucesso!');
        } catch (error) {
            console.error('Error deleting subcategory:', error);
            toast.error('Erro ao excluir subcategoria');
        } finally {
            setDeleteSubcategory(null);
        }
    };



    return (
        <div className="space-y-6 h-full flex flex-col">
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="p-4 border rounded-lg space-y-3 bg-card">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-lg" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && categories.length === 0 && (
                <EmptyState
                    variant="outlined"
                    size="lg"
                    icon={Icons.Folder}
                    title="Nenhuma categoria cadastrada"
                    description="Comece criando sua primeira categoria para organizar suas transações"
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
            )}

            {!loading && categories.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.map((item) => {
                        const Icon = (Icons[item.icon as keyof typeof Icons] as LucideIcon) || Icons.Folder;
                        const subs = subcategories[item.id] || [];
                        const isExpanded = expandedCategories.has(item.id);

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
                                        <CardDescription className="font-inter line-clamp-2">
                                            {item.description}
                                        </CardDescription>
                                    </div>
                                </CardHeader>

                                {/* Subcategories Section */}
                                {subs.length > 0 && (
                                    <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(item.id)}>
                                        <CardContent className="pt-0">
                                            <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full justify-between font-inter"
                                                >
                                                    <span className="text-sm text-zinc-600">
                                                        {subs.length} subcategoria{subs.length !== 1 ? 's' : ''}
                                                    </span>
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="mt-2 space-y-2">
                                                {subs.map((sub) => (
                                                    <div
                                                        key={sub.id}
                                                        className="flex items-center justify-between p-2 rounded bg-zinc-50 hover:bg-zinc-100 transition-colors"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium font-inter truncate">
                                                                {sub.name}
                                                            </p>
                                                            {sub.description && (
                                                                <p className="text-xs text-zinc-500 font-inter truncate">
                                                                    {sub.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-1 ml-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openSubcategoryDialog(item.id, sub);
                                                                }}
                                                            >
                                                                <Pencil className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-destructive hover:text-destructive"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setDeleteSubcategory(sub);
                                                                }}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full font-inter"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openSubcategoryDialog(item.id);
                                                    }}
                                                >
                                                    <Plus className="w-3 h-3 mr-1" />
                                                    Adicionar Subcategoria
                                                </Button>
                                            </CollapsibleContent>
                                        </CardContent>
                                    </Collapsible>
                                )}

                                <CardFooter className="flex justify-between gap-2">
                                    {subs.length === 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openSubcategoryDialog(item.id);
                                            }}
                                            className="font-inter text-xs w-full justify-start pl-0 hover:bg-transparent text-zinc-500 hover:text-[#00665C]"
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Adicionar Subcategoria
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Category Create/Edit Dialog */}
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="font-jakarta">
                            {editingItem ? 'Editar Categoria' : 'Nova Categoria'}
                        </DialogTitle>
                    </DialogHeader>

                    <CategoryForm
                        classifications={classifications}
                        categoryId={editingItem?.id}
                        onSuccess={() => {
                            onOpenChange(false);
                            fetchCategories();
                        }}
                        onCancel={() => onOpenChange(false)}
                        defaultValues={editingItem ? {
                            name: editingItem.name,
                            description: editingItem.description || '',
                            classification_id: editingItem.classification_id || '',
                            color: editingItem.color,
                            icon: editingItem.icon
                        } : undefined}
                        onDelete={editingItem ? () => {
                            onOpenChange(false);
                            setDeleteItem(editingItem);
                        } : undefined}
                    />
                </DialogContent>
            </Dialog>

            {/* Subcategory Create/Edit Dialog */}
            <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="font-jakarta">
                            {editingSubcategory ? 'Editar Subcategoria' : 'Nova Subcategoria'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubcategorySubmit} className="space-y-4">
                        {/* Nome */}
                        <div>
                            <Label
                                htmlFor="sub-name"
                                className={subcategoryErrors.name ? 'text-destructive' : ''}
                            >
                                Nome *
                            </Label>
                            <Input
                                id="sub-name"
                                value={subcategoryFormData.name}
                                onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, name: e.target.value })}
                                className={`font-inter ${subcategoryErrors.name ? 'border-destructive' : ''}`}
                                maxLength={50}
                            />
                            {!subcategoryErrors.name && (
                                <p className="text-sm text-zinc-500 mt-1 font-inter">
                                    Digite o nome da subcategoria
                                </p>
                            )}
                            {subcategoryErrors.name && (
                                <p className="text-sm text-destructive mt-1 font-inter">
                                    {subcategoryErrors.name}
                                </p>
                            )}
                        </div>

                        {/* Descrição */}
                        <div>
                            <Label htmlFor="sub-description">Descrição</Label>
                            <Textarea
                                id="sub-description"
                                value={subcategoryFormData.description}
                                onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, description: e.target.value })}
                                className="font-inter"
                                maxLength={200}
                                rows={3}
                            />
                            <p className="text-sm text-zinc-500 mt-1 font-inter">
                                Opcional - máximo 200 caracteres
                            </p>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsSubcategoryDialogOpen(false)}
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
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Category Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-jakarta">Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription className="font-inter">
                            Tem certeza que deseja excluir a categoria <strong>{deleteItem?.name}</strong>?
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

            {/* Subcategory Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteSubcategory} onOpenChange={() => setDeleteSubcategory(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-jakarta">Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription className="font-inter">
                            Tem certeza que deseja excluir a subcategoria <strong>{deleteSubcategory?.name}</strong>?
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteSubcategory}
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



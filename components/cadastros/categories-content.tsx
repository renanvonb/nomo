'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Category, Classification } from '@/types/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Folder, SearchX } from 'lucide-react';
import { HighlightText } from '@/components/ui/highlight-text';
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
import { CategoryForm } from './category-form';
import { getIconByName } from './icon-picker';
import { getColorHex } from './color-picker';
import { ModuleCardsSkeleton } from '@/components/ui/skeletons';
import { CategorySheet } from './category-sheet';

interface CategoriesContentProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    searchQuery: string;
}

export function CategoriesContent({ isOpen, onOpenChange, searchQuery }: CategoriesContentProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [classifications, setClassifications] = useState<Classification[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<Category | null>(null);
    const [deleteItem, setDeleteItem] = useState<Category | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const filteredCategories = categories.filter(item => {
        const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
        return normalize(item.name).includes(normalize(searchQuery));
    });

    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
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
                .select('*, classifications(*), transactions(count)')
                .eq('user_id', user.id)
                .order('name', { ascending: true });

            if (error) throw error;
            setCategories(data || []);

            // If sheet is open, update selected category data
            if (isSheetOpen && selectedCategory) {
                const updated = data?.find(c => c.id === selectedCategory.id);
                if (updated) setSelectedCategory(updated);
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
                .eq('user_id', user.id)
                .order('name');

            if (error) throw error;
            setClassifications(data || []);
        } catch (error) {
            console.error('Error fetching classifications:', error);
        }
    };

    const handleEdit = (item: Category) => {
        setEditingItem(item);
        setIsSheetOpen(false); // Close sheet before opening edit dialog
        onOpenChange(true);
    };

    const handleDelete = async () => {
        if (!deleteItem) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', deleteItem.id)
                .eq('user_id', user.id);

            if (error) {
                if (error.code === '23503') {
                    toast.error('Não é possível excluir: existem transações ou subcategorias vinculadas.');
                    return;
                }
                throw error;
            }

            setCategories(prev => prev.filter(cat => cat.id !== deleteItem.id));
            setIsSheetOpen(false);
            toast.success('Categoria excluída com sucesso!');
        } catch (error: any) {
            console.error('Error deleting category:', error);
            toast.error('Erro ao excluir categoria');
        } finally {
            setDeleteItem(null);
        }
    };

    const openSheet = (category: Category) => {
        setSelectedCategory(category);
        setIsSheetOpen(true);
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {loading ? (
                <ModuleCardsSkeleton />
            ) : categories.length === 0 ? (
                <EmptyState
                    variant="outlined"
                    size="lg"
                    icon={Folder}
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
                    className="flex-1 bg-white border-zinc-200 border-dashed"
                />
            ) : filteredCategories.length === 0 ? (
                <EmptyState
                    variant="outlined"
                    size="lg"
                    icon={SearchX}
                    title="Nenhuma categoria encontrada"
                    description="Tente novamente para encontrar o que está buscando"
                    className="flex-1 bg-white border-zinc-200 border-dashed"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
                    {filteredCategories.map((item) => {
                        const Icon = getIconByName(item.icon || 'cart');
                        const cardColor = getColorHex(item.color || 'zinc');

                        return (
                            <Card
                                key={item.id}
                                className="group cursor-pointer hover:bg-zinc-50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-zinc-200"
                                onClick={() => openSheet(item)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                                            style={{ backgroundColor: cardColor }}
                                        >
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-zinc-900 truncate font-jakarta">
                                                <HighlightText text={item.name} highlight={searchQuery} />
                                            </h3>
                                            <p className="text-sm text-zinc-500 font-inter truncate">
                                                {item.subcategories?.[0]?.count || 0} subcategorias
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <CategorySheet
                category={selectedCategory}
                isOpen={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                onEdit={handleEdit}
                onDelete={(cat) => setDeleteItem(cat)}
                onRefresh={fetchCategories}
            />

            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="font-jakarta">
                            {editingItem ? 'Editar categoria' : 'Nova categoria'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingItem
                                ? 'Atualize as informações da categoria.'
                                : 'Preencha as informações da categoria.'}
                        </DialogDescription>
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

            <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-jakarta">Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription className="font-inter">
                            Tem certeza que deseja excluir a categoria <strong>{deleteItem?.name}</strong>?
                            Esta ação não pode ser desfeita e pode falhar se houver registros vinculados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

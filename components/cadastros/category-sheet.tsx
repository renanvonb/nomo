'use client';

import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Category, Subcategory } from "@/types/entities";
import { getIconByName } from "./icon-picker";
import { getColorClass } from "./color-picker";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { getSubcategoriesByCategoryId, createSubcategory, deleteSubcategory } from "@/lib/supabase/cadastros";
import { toast } from "sonner";

interface CategorySheetProps {
    category: Category | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onRefresh: () => void;
}

export function CategorySheet({
    category,
    isOpen,
    onOpenChange,
    onEdit,
    onDelete,
    onRefresh
}: CategorySheetProps) {
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [newSubName, setNewSubName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && category) {
            fetchSubcategories();
        } else {
            setSubcategories([]);
            setNewSubName('');
        }
    }, [isOpen, category]);

    const fetchSubcategories = async () => {
        if (!category) return;
        try {
            setLoading(true);
            const data = await getSubcategoriesByCategoryId(category.id);
            setSubcategories(data || []);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubcategory = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newSubName.trim() || !category) return;

        try {
            setSubmitting(true);
            await createSubcategory({
                category_id: category.id,
                name: newSubName.trim(),
            });
            setNewSubName('');
            await fetchSubcategories();
            onRefresh(); // Refresh parent to update counts if needed
            toast.success('Subcategoria adicionada!');
        } catch (error) {
            console.error('Error adding subcategory:', error);
            toast.error('Erro ao adicionar subcategoria');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSub = async (sub: Subcategory) => {
        try {
            await deleteSubcategory(sub.id);
            setSubcategories(prev => prev.filter(s => s.id !== sub.id));
            onRefresh();
            toast.success('Subcategoria removida');
        } catch (error) {
            console.error('Error deleting subcategory:', error);
            toast.error('Erro ao remover subcategoria');
        }
    };

    if (!category) return null;

    const Icon = getIconByName(category.icon || 'cart');
    const colorClass = getColorClass(category.color || 'zinc');

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader className="text-left border-b pb-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", colorClass)}>
                                <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <SheetTitle className="font-jakarta text-xl">{category.name}</SheetTitle>
                                <p className="text-sm text-zinc-500 font-inter">
                                    {category.transactions?.[0]?.count || 0} transações
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => onEdit(category)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => onDelete(category)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </SheetHeader>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-medium text-zinc-900 mb-4 font-jakarta uppercase tracking-wider">Subcategorias</h4>

                        <form onSubmit={handleAddSubcategory} className="flex gap-2 mb-4">
                            <Input
                                placeholder="Nova subcategoria..."
                                value={newSubName}
                                onChange={(e) => setNewSubName(e.target.value)}
                                className="font-inter"
                                disabled={submitting}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={submitting || !newSubName.trim()}
                                className="bg-[#00665C] hover:bg-[#00665C]/90 h-10 w-10 shrink-0"
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            </Button>
                        </form>

                        <div className="space-y-2">
                            {loading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
                                </div>
                            ) : subcategories.length === 0 ? (
                                <p className="text-sm text-zinc-500 font-inter py-4 text-center border border-dashed rounded-lg">
                                    Nenhuma subcategoria cadastrada.
                                </p>
                            ) : (
                                subcategories.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-zinc-50/50 group hover:border-zinc-200 transition-colors"
                                    >
                                        <span className="text-sm font-medium font-inter text-zinc-700">{sub.name}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleDeleteSub(sub)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

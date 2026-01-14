'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2, User, UserRound, SearchX } from 'lucide-react';
import { HighlightText } from '@/components/ui/highlight-text';
import { IconPicker, getIconByName } from './icon-picker';
import { ColorPicker, getColorClass } from './color-picker';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    Payee,
    getPayees,
    createPayee,
    updatePayee,
    deletePayee,
} from '@/lib/supabase/cadastros';
import { ModuleCardsSkeleton } from '@/components/ui/skeletons';

// Paleta de cores Shadcn (Anterior)
const COLORS = [
    { name: 'zinc', label: 'Cinza', bg: 'bg-zinc-500' },
    { name: 'red', label: 'Vermelho', bg: 'bg-red-500' },
    { name: 'orange', label: 'Laranja', bg: 'bg-orange-500' },
    { name: 'amber', label: 'Âmbar', bg: 'bg-amber-500' },
    { name: 'yellow', label: 'Amarelo', bg: 'bg-yellow-500' },
    { name: 'lime', label: 'Lima', bg: 'bg-lime-500' },
    { name: 'green', label: 'Verde', bg: 'bg-green-500' },
    { name: 'emerald', label: 'Esmeralda', bg: 'bg-emerald-500' },
    { name: 'teal', label: 'Azul-petróleo', bg: 'bg-teal-500' },
    { name: 'cyan', label: 'Ciano', bg: 'bg-cyan-500' },
    { name: 'sky', label: 'Céu', bg: 'bg-sky-500' },
    { name: 'blue', label: 'Azul', bg: 'bg-blue-500' },
    { name: 'indigo', label: 'Índigo', bg: 'bg-indigo-500' },
    { name: 'violet', label: 'Violeta', bg: 'bg-violet-500' },
    { name: 'purple', label: 'Roxo', bg: 'bg-purple-500' },
    { name: 'fuchsia', label: 'Fúcsia', bg: 'bg-fuchsia-500' },
    { name: 'pink', label: 'Rosa', bg: 'bg-pink-500' },
    { name: 'rose', label: 'Rosa-escuro', bg: 'bg-rose-500' },
];



export interface PayersContentProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    searchQuery: string;
}

export function PayersContent({ isOpen, onOpenChange, searchQuery }: PayersContentProps) {
    const router = useRouter();
    const [payers, setPayers] = useState<Payee[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingPayer, setEditingPayer] = useState<Payee | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', color: 'zinc', icon: 'user-round' });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const filteredPayers = payers.filter(payer => {
        const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
        return normalize(payer.name).includes(normalize(searchQuery));
    });

    const fetchPayers = async () => {
        setLoading(true);
        try {
            const data = await getPayees('payer');
            setPayers(data);
        } catch (error: any) {
            console.error('Erro ao carregar pagadores:', error);
            if (error.message === 'Usuário não autenticado') {
                toast.error('Sessão expirada. Faça login novamente.');
                router.push('/login');
            } else {
                toast.error('Erro ao carregar pagadores');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayers();
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setFormData({ name: '', color: 'zinc', icon: 'user-round' });
            setFormErrors({});
            setEditingPayer(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (editingPayer) {
            setFormData({
                name: editingPayer.name,
                color: editingPayer.color || 'zinc',
                icon: editingPayer.icon || 'user-round',
            });
        }
    }, [editingPayer]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.name.trim()) {
            errors.name = 'Nome é obrigatório';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            if (editingPayer) {
                await updatePayee(editingPayer.id, { ...formData, type: 'payer' });
                toast.success('Pagador atualizado com sucesso!');
            } else {
                await createPayee({ ...formData, type: 'payer' });
                toast.success('Pagador criado com sucesso!');
            }
            onOpenChange(false);
            await fetchPayers();
        } catch (error: any) {
            if (error.message === 'Usuário não autenticado') {
                toast.error('Sessão expirada. Faça login novamente.');
                router.push('/login');
            } else {
                toast.error(error.message || 'Erro ao salvar pagador');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;

        setSubmitting(true);
        try {
            await deletePayee(deletingId);
            setPayers(prev => prev.filter(payer => payer.id !== deletingId));
            toast.success('Pagador excluído com sucesso!');
            setIsDeleteDialogOpen(false);
            setDeletingId(null);
        } catch (error: any) {
            if (error.message === 'Usuário não autenticado') {
                toast.error('Sessão expirada. Faça login novamente.');
                router.push('/login');
            } else {
                toast.error(error.message || 'Erro ao excluir pagador');
            }
        } finally {
            setSubmitting(false);
        }
    };



    const PreviewBadge = () => {
        let iconName = formData.icon || 'user-round';
        if (iconName === 'user') iconName = 'user-round';
        // Ensure building-2 uses the correct component if my icon-picker handles it by name
        // (Since I added 'building-2' to ICONS, getIconByName will find it).

        const IconComp = getIconByName(iconName, UserRound);
        const colorClass = getColorClass(formData.color);

        return (
            <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <div className={cn('rounded-full p-2', colorClass)}>
                    <IconComp className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-zinc-900">
                    {formData.name || 'Nome do pagador'}
                </span>
            </div>
        );
    };

    return (
        <>
            {loading ? (
                <ModuleCardsSkeleton />
            ) : payers.length === 0 ? (
                <EmptyState
                    variant="outlined"
                    size="lg"
                    icon={User}
                    title="Nenhum pagador cadastrado"
                    description="Adicione seu primeiro pagador para registrar suas entradas"
                    action={
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(true)}
                            className="font-inter"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar
                        </Button>
                    }
                    className="flex-1 bg-white border-zinc-200 border-dashed"
                />
            ) : filteredPayers.length === 0 ? (
                <EmptyState
                    variant="outlined"
                    size="lg"
                    icon={SearchX}
                    title="Nenhum pagador encontrado"
                    description="Tente novamente para encontrar o que está buscando"
                    className="flex-1 bg-white border-zinc-200 border-dashed"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
                    {filteredPayers.map((payer) => {
                        const iconName = (!payer.icon || payer.icon === 'user') ? 'user-round' : payer.icon;
                        const IconComponent = getIconByName(iconName, UserRound);
                        const colorClass = getColorClass(payer.color);

                        return (
                            <Card
                                key={payer.id}
                                className="hover:bg-zinc-50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group border-zinc-200 relative overflow-hidden"
                                onClick={() => {
                                    setEditingPayer(payer);
                                    onOpenChange(true);
                                }}
                            >
                                <div className="absolute top-4 right-4">
                                    <Badge variant="secondary" className="font-inter text-[10px] uppercase tracking-wider px-2 py-0 border bg-zinc-100/80 backdrop-blur-sm shadow-sm">
                                        {(payer.icon === 'building-2' || payer.icon === 'building') ? 'Jurídica' : 'Física'}
                                    </Badge>
                                </div>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className={cn('rounded-full p-2.5 flex-shrink-0', colorClass)}>
                                            <IconComponent className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-zinc-900 truncate">
                                                <HighlightText text={payer.name} highlight={searchQuery} />
                                            </h3>
                                            <p className="text-sm text-zinc-500 font-inter">
                                                {payer.transactions?.[0]?.count || 0} transações
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="font-jakarta">
                            {editingPayer ? 'Editar pagador' : 'Novo pagador'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPayer
                                ? 'Atualize as informações do pagador.'
                                : 'Preencha as informações do pagador.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pb-4">
                        <PreviewBadge />

                        <Tabs
                            defaultValue={formData.icon === 'building-2' || formData.icon === 'building' ? 'corporate' : 'individual'}
                            className="w-full"
                            onValueChange={(value) => {
                                setFormData({
                                    ...formData,
                                    icon: value === 'corporate' ? 'building-2' : 'user-round'
                                });
                            }}
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="individual">Pessoa física</TabsTrigger>
                                <TabsTrigger value="corporate">Pessoa jurídica</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="space-y-2">
                            <Label
                                htmlFor="name"
                                className={cn(
                                    'text-sm font-medium',
                                    formErrors.name && 'text-red-600'
                                )}
                            >
                                Nome <span className="text-red-600">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="Ex: João Silva, Empresa XYZ"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className={cn(
                                    formErrors.name && 'border-red-500 focus-visible:ring-red-500'
                                )}
                            />
                            {formErrors.name && (
                                <p className="text-sm text-red-600">{formErrors.name}</p>
                            )}
                        </div>



                        <div className="space-y-2">
                            <Label>Cor</Label>
                            <div className="grid grid-cols-9 gap-2">
                                {COLORS.map((color) => {
                                    const isSelected = formData.color === color.name;

                                    return (
                                        <button
                                            key={color.name}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: color.name })}
                                            className={cn(
                                                'h-10 w-10 rounded-lg transition-all',
                                                color.bg,
                                                isSelected && 'ring-2 ring-zinc-950 ring-offset-2'
                                            )}
                                            title={color.label}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className={editingPayer ? "sm:justify-between" : ""}>
                        {editingPayer && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setDeletingId(editingPayer.id);
                                    onOpenChange(false);
                                    setIsDeleteDialogOpen(true);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                Excluir
                            </Button>
                        )}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={submitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-[#00665C] hover:bg-[#00665C]/90"
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
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-jakarta">
                            Confirmar exclusão
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir este pagador? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={submitting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {submitting ? 'Excluindo...' : 'Excluir'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

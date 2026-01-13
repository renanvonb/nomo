'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
    Plus, Pencil, Trash2, Loader2,
    User, Building2, Store, Home, Car,
    ShoppingCart, Utensils, Heart, Briefcase,
    Wallet, CreditCard, Smartphone
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    Payee,
    getPayees,
    createPayee,
    updatePayee,
    deletePayee,
} from '@/lib/supabase/cadastros';

// Paleta de cores Shadcn
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

// Ícones disponíveis
const ICONS = [
    { name: 'user', label: 'Pessoa', Icon: User },
    { name: 'building', label: 'Empresa', Icon: Building2 },
    { name: 'store', label: 'Loja', Icon: Store },
    { name: 'home', label: 'Casa', Icon: Home },
    { name: 'car', label: 'Carro', Icon: Car },
    { name: 'cart', label: 'Carrinho', Icon: ShoppingCart },
    { name: 'food', label: 'Comida', Icon: Utensils },
    { name: 'heart', label: 'Coração', Icon: Heart },
    { name: 'briefcase', label: 'Maleta', Icon: Briefcase },
    { name: 'wallet', label: 'Carteira', Icon: Wallet },
    { name: 'card', label: 'Cartão', Icon: CreditCard },
    { name: 'phone', label: 'Telefone', Icon: Smartphone },
];

export interface PayersContentProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PayersContent({ isOpen, onOpenChange }: PayersContentProps) {
    const router = useRouter();
    const [payees, setPayees] = useState<Payee[]>([]);
    const [loading, setLoading] = useState(true);

    // isDialogOpen controlled by parent
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingPayee, setEditingPayee] = useState<Payee | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', color: 'zinc', icon: 'user' });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const fetchPayees = async () => {
        setLoading(true);
        try {
            const data = await getPayees('payer');
            setPayees(data);
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
        fetchPayees();
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setFormData({ name: '', color: 'zinc', icon: 'user' });
            setFormErrors({});
            setEditingPayee(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (editingPayee) {
            setFormData({
                name: editingPayee.name,
                color: editingPayee.color || 'zinc',
                icon: editingPayee.icon || 'user',
            });
        }
    }, [editingPayee]);

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
            if (editingPayee) {
                await updatePayee(editingPayee.id, formData);
                toast.success('Pagador atualizado com sucesso!');
            } else {
                await createPayee({ ...formData, type: 'payer' });
                toast.success('Pagador criado com sucesso!');
            }
            onOpenChange(false);
            await fetchPayees();
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

            // Atualizar estado local imediatamente
            setPayees(prev => prev.filter(payee => payee.id !== deletingId));

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

    const openEditDialog = (payee: Payee) => {
        setEditingPayee(payee);
        onOpenChange(true);
    };

    const openDeleteDialog = (id: string) => {
        setDeletingId(id);
        setIsDeleteDialogOpen(true);
    };

    const getIconComponent = (iconName: string) => {
        const icon = ICONS.find(i => i.name === iconName);
        return icon ? icon.Icon : User;
    };

    const getColorClass = (colorName: string) => {
        const color = COLORS.find(c => c.name === colorName);
        return color ? color.bg : 'bg-zinc-500';
    };

    // Preview do badge
    const PreviewBadge = () => {
        const IconComp = getIconComponent(formData.icon);
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
            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#00665C]" />
                </div>
            ) : payees.length === 0 ? (
                <EmptyState
                    variant="outlined"
                    size="lg"
                    icon={User}
                    title="Nenhum pagador cadastrado"
                    description="Adicione seu primeiro pagador para registrar suas receitas"
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
                    className="flex-1 bg-card"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {payees.map((payee) => {
                        const IconComponent = getIconComponent(payee.icon);
                        const colorClass = getColorClass(payee.color);

                        return (
                            <Card
                                key={payee.id}
                                className="hover:shadow-md transition-shadow cursor-pointer group"
                                onClick={() => openEditDialog(payee)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className={cn('rounded-full p-2.5', colorClass)}>
                                                <IconComponent className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-zinc-900 truncate">
                                                    {payee.name}
                                                </h3>
                                                <p className="text-sm text-zinc-500 capitalize">
                                                    {COLORS.find(c => c.name === payee.color)?.label || payee.color}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
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
                            {editingPayee ? 'Editar Pagador' : 'Novo Pagador'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPayee
                                ? 'Atualize as informações do pagador.'
                                : 'Preencha os dados para criar um novo pagador.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pb-4">
                        {/* Preview do Badge */}
                        <PreviewBadge />

                        {/* Nome */}
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
                                placeholder="Ex: Goapice, Recebee"
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

                        {/* Ícone */}
                        <div className="space-y-2">
                            <Label>Ícone</Label>
                            <div className="grid grid-cols-6 gap-2">
                                {ICONS.map((icon) => {
                                    const IconComp = icon.Icon;
                                    const isSelected = formData.icon === icon.name;

                                    return (
                                        <button
                                            key={icon.name}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon: icon.name })}
                                            className={cn(
                                                'p-3 rounded-lg border-2 transition-all hover:border-zinc-400',
                                                isSelected
                                                    ? 'border-zinc-950 bg-zinc-100'
                                                    : 'border-zinc-200'
                                            )}
                                            title={icon.label}
                                        >
                                            <IconComp className="h-5 w-5 mx-auto" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Cor */}
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

                    <DialogFooter className={editingPayee ? "sm:justify-between" : ""}>
                        {editingPayee && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    if (editingPayee) {
                                        openDeleteDialog(editingPayee.id);
                                        onOpenChange(false);
                                    }
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

            {/* Delete Confirmation Dialog */}
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
        </>
    );
}

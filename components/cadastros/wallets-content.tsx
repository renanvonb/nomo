'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Wallet as WalletIcon,
    Landmark,
    CreditCard,
    Banknote,
    PiggyBank,
    Briefcase,
    CircleDollarSign,
    Check
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    Wallet,
    getWallets,
    createWallet,
    updateWallet,
    deleteWallet,
} from '@/lib/supabase/cadastros';

// Constantes de Ícones e Cores
const ICONS = [
    { id: 'wallet', icon: WalletIcon, label: 'Carteira' },
    { id: 'bank', icon: Landmark, label: 'Banco' },
    { id: 'card', icon: CreditCard, label: 'Cartão' },
    { id: 'cash', icon: Banknote, label: 'Dinheiro' },
    { id: 'savings', icon: PiggyBank, label: 'Poupança' },
    { id: 'business', icon: Briefcase, label: 'Negócios' },
    { id: 'investment', icon: CircleDollarSign, label: 'Investimento' },
];

const COLORS = [
    { name: 'Sollyd', value: '#00665C' },
    { name: 'Preto', value: '#09090b' },
    { name: 'Azul', value: '#2563eb' },
    { name: 'Vermelho', value: '#dc2626' },
    { name: 'Laranja', value: '#d97706' },
    { name: 'Roxo', value: '#7c3aed' },
    { name: 'Verde', value: '#16a34a' },
];

const walletSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    color: z.string().min(1, 'Cor é obrigatória'),
    icon: z.string().min(1, 'Ícone é obrigatório'),
});

type WalletFormValues = z.infer<typeof walletSchema>;

interface WalletsContentProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function WalletsContent({ isOpen, onOpenChange }: WalletsContentProps) {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [loading, setLoading] = useState(true);
    // isDialogOpen removed
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const form = useForm<WalletFormValues>({
        resolver: zodResolver(walletSchema),
        defaultValues: {
            name: '',
            color: COLORS[0].value,
            icon: 'wallet',
        },
    });

    const { formState: { isSubmitting }, reset } = form;

    const fetchWallets = async () => {
        try {
            const data = await getWallets();
            setWallets(data);
        } catch (error) {
            console.error('Erro ao carregar carteiras:', error);
            toast.error('Erro ao carregar as carteiras.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallets();
    }, []);

    // Atualiza o form quando entra em modo edição
    useEffect(() => {
        if (editingWallet) {
            reset({
                name: editingWallet.name,
                color: editingWallet.color || COLORS[0].value,
                icon: editingWallet.icon || 'wallet',
            });
        } else {
            reset({
                name: '',
                color: COLORS[0].value,
                icon: 'wallet',
            });
        }
    }, [editingWallet, reset]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setEditingWallet(null);
            form.reset({
                name: '',
                color: COLORS[0].value,
                icon: 'wallet',
            });
        }
    }, [isOpen, form]);

    const onSubmit = async (values: WalletFormValues) => {
        try {
            if (editingWallet) {
                await updateWallet(editingWallet.id, values);
                toast.success('Carteira atualizada com sucesso!');
            } else {
                await createWallet(values);
                toast.success('Carteira criada com sucesso!');
            }
            onOpenChange(false);
            fetchWallets();
        } catch (error: any) {
            console.error('Erro ao salvar carteira:', error);
            toast.error('Erro ao salvar carteira. Tente novamente.');
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await deleteWallet(deletingId);
            setWallets((prev) => prev.filter((w) => w.id !== deletingId));
            toast.success('Carteira excluída com sucesso!');
            setIsDeleteDialogOpen(false);
        } catch (error: any) {
            console.error('Erro ao excluir:', error);
            toast.error('Erro ao excluir a carteira.');
        }
    };

    const getIconComponent = (iconName: string) => {
        const item = ICONS.find((i) => i.id === iconName);
        return item ? item.icon : WalletIcon;
    };

    return (
        <>
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#00665C]" />
                </div>
            ) : wallets.length === 0 ? (
                <EmptyState
                    variant="outlined"
                    size="lg"
                    icon={WalletIcon}
                    title="Nenhuma carteira cadastrada"
                    description="Crie carteiras para organizar suas finanças (Ex: NuBank, Itaú, Dinheiro)."
                    action={
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(true)}
                            className="font-inter"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar
                        </Button>
                    }
                    className="flex-1 bg-card"
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {wallets.map((wallet) => {
                        const Icon = getIconComponent(wallet.icon || 'wallet');
                        const cardColor = wallet.color || COLORS[0].value;

                        return (
                            <Card
                                key={wallet.id}
                                className="group cursor-pointer hover:shadow-md transition-all"
                                onClick={() => {
                                    setEditingWallet(wallet);
                                    onOpenChange(true);
                                }}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="flex h-12 w-12 items-center justify-center rounded-2xl transition-colors"
                                                style={{
                                                    backgroundColor: `${cardColor}20`,
                                                    color: cardColor
                                                }}
                                            >
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-zinc-900">{wallet.name}</h3>
                                                <p className="text-xs text-zinc-500 font-medium">
                                                    {wallet.user_id ? 'Particular' : 'Sistema'}
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

            {/* Dialog de Criação/Edição com Form */}
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingWallet ? 'Editar Carteira' : 'Nova Carteira'}</DialogTitle>
                        <DialogDescription>
                            Preencha as informações da carteira.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome da Carteira</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: NuBank, Cofre, Investimentos..." {...field} />
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
                                        <FormLabel>Cor de Identificação</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-wrap gap-3">
                                                {COLORS.map((color) => (
                                                    <button
                                                        key={color.value}
                                                        type="button"
                                                        className={cn(
                                                            "h-8 w-8 rounded-full transition-all ring-offset-2 focus:outline-none focus:ring-2 disabled:opacity-50",
                                                            field.value === color.value
                                                                ? "ring-2 ring-zinc-950 scale-110"
                                                                : "hover:scale-110"
                                                        )}
                                                        style={{ backgroundColor: color.value }}
                                                        onClick={() => field.onChange(color.value)}
                                                        title={color.name}
                                                    />
                                                ))}
                                            </div>
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
                                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                                {ICONS.map((item) => {
                                                    const isSelected = field.value === item.id;
                                                    return (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => field.onChange(item.id)}
                                                            className={cn(
                                                                "flex h-10 w-10 items-center justify-center rounded-xl border transition-all hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
                                                                isSelected
                                                                    ? "border-[#00665C] bg-[#00665C]/10 text-[#00665C] ring-1 ring-[#00665C]"
                                                                    : "border-zinc-200 text-zinc-500"
                                                            )}
                                                            title={item.label}
                                                        >
                                                            <item.icon className="h-5 w-5" />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className={editingWallet ? "sm:justify-between" : ""}>
                                {editingWallet && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => {
                                            setDeletingId(editingWallet.id);
                                            onOpenChange(false);
                                            setIsDeleteDialogOpen(true);
                                        }}
                                    >
                                        Excluir
                                    </Button>
                                )}
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="bg-[#00665C] hover:bg-[#00665C]/90">
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Salvar
                                    </Button>
                                </div>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Dialog de Exclusão */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Carteira</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir esta carteira? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

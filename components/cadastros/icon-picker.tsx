'use client';

import {
    User, Building2, Store, Home, Car,
    ShoppingCart, Utensils, Heart, Briefcase,
    Wallet, CreditCard, Smartphone, DollarSign,
    Zap, Coffee, Plane, Gamepad2, Book, Flag, UserRound,
    LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const ICONS = [
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
    { name: 'dollar-sign', label: 'Cifrão', Icon: DollarSign },
    { name: 'zap', label: 'Energia', Icon: Zap },
    { name: 'coffee', label: 'Café', Icon: Coffee },
    { name: 'plane', label: 'Viagem', Icon: Plane },
    { name: 'gamepad', label: 'Lazer', Icon: Gamepad2 },
    { name: 'book', label: 'Educação', Icon: Book },
    { name: 'flag', label: 'Bandeira', Icon: Flag },
    { name: 'user-round', label: 'Usuário', Icon: UserRound },
    { name: 'building-2', label: 'Empresa', Icon: Building2 },
];

interface IconPickerProps {
    value: string;
    onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
    return (
        <div className="grid grid-cols-9 gap-2">
            {ICONS.map((icon) => {
                const IconComp = icon.Icon;
                const isSelected = value === icon.name;

                return (
                    <button
                        key={icon.name}
                        type="button"
                        onClick={() => onChange(icon.name)}
                        className={cn(
                            'p-2 rounded-lg border-2 transition-all hover:border-zinc-400',
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
    );
}

export function getIconByName(name: string, DefaultIcon: LucideIcon = User): LucideIcon {
    const icon = ICONS.find(i => i.name === name);
    return icon ? icon.Icon : DefaultIcon;
}

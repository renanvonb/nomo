'use client';


import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

const iconList = [
    'Wallet', 'CreditCard', 'Banknote', 'DollarSign', 'Coins',
    'User', 'Users', 'Building', 'Building2', 'Store',
    'ShoppingCart', 'ShoppingBag', 'Package', 'Gift',
    'Home', 'Car', 'Utensils', 'Coffee', 'Pizza',
    'Heart', 'Star', 'Tag', 'Bookmark', 'Award',
    'Briefcase', 'Laptop', 'Smartphone', 'Headphones',
    'Plane', 'Train', 'Bus', 'Bike',
    'Zap', 'Droplet', 'Flame', 'Wind',
    'GraduationCap', 'BookOpen', 'Pencil', 'FileText',
    'Activity', 'TrendingUp', 'TrendingDown', 'BarChart',
];

interface IconPickerProps {
    value: string;
    onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
    return (
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-[200px] overflow-y-auto p-1 border rounded-md">
            {iconList.map((iconName) => {
                const Icon = Icons[iconName as keyof typeof Icons] as LucideIcon;
                const isSelected = value === iconName;
                return (
                    <button
                        key={iconName}
                        type="button"
                        onClick={() => onChange(iconName)}
                        className={`flex items-center justify-center p-2 rounded-lg border-2 transition-all hover:border-zinc-400 ${isSelected
                            ? 'border-zinc-950 bg-zinc-100'
                            : 'border-zinc-200'
                            }`}
                        title={iconName}
                    >
                        <Icon className="w-5 h-5" />
                    </button>
                );
            })}
        </div>
    );
}

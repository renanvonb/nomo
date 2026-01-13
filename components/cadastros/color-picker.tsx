'use client';



const shadcnColors = [
    '#0f172a', // slate-900
    '#1e293b', // slate-800
    '#334155', // slate-700
    '#64748b', // slate-500
    '#00665C', // verde Sollyd
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#f59e0b', // amber-500
    '#eab308', // yellow-500
    '#84cc16', // lime-500
    '#22c55e', // green-500
    '#10b981', // emerald-500
    '#14b8a6', // teal-500
    '#06b6d4', // cyan-500
    '#0ea5e9', // sky-500
    '#3b82f6', // blue-500
    '#6366f1', // indigo-500
    '#8b5cf6', // violet-500
    '#a855f7', // purple-500
    '#d946ef', // fuchsia-500
    '#ec4899', // pink-500
    '#f43f5e', // rose-500
];

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    colors?: string[];
}

export function ColorPicker({ value, onChange, colors = shadcnColors }: ColorPickerProps) {
    return (
        <div className="grid grid-cols-8 gap-2">
            {colors.map((color) => (
                <button
                    key={color}
                    type="button"
                    onClick={() => onChange(color)}
                    className={`w-8 h-8 rounded-lg transition-all border-2 ${value === color ? 'border-zinc-950 ring-2 ring-zinc-950 ring-offset-2' : 'border-transparent hover:scale-110'
                        }`}
                    style={{ backgroundColor: color }}
                    title={color}
                />
            ))}
        </div>
    );
}

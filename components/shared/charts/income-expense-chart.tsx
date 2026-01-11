"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface IncomeExpenseData {
    month: string
    receitas: number
    despesas: number
}

interface IncomeExpenseChartProps {
    data: IncomeExpenseData[]
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
    return (
        <Card className="rounded-[16px] border-zinc-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold font-jakarta text-zinc-950">
                    Receitas vs Despesas
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                tickFormatter={(value) => `R$${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: '#f4f4f5' }}
                                formatter={(value: number | undefined) => value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) : 'R$ 0,00'}
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7' }}
                            />
                            <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                            <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

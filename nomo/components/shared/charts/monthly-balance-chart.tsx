"use client"

import * as React from "react"
import { Line } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useVisibility } from "@/hooks/use-visibility-state"

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

interface MonthlyBalanceChartProps {
    data: Array<{ day: string; receitas: number; despesas: number }>
}

export function MonthlyBalanceChart({ data }: MonthlyBalanceChartProps) {
    const { isVisible } = useVisibility()

    const formatValue = (value: number) => {
        if (!isVisible) return "R$ ••••"
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value)
    }

    const formatAxisValue = (value: number) => {
        if (!isVisible) return "••••"
        return `R$${(value / 1000).toFixed(0)}k`
    }

    const chartConfig = {
        labels: data.map(item => item.day),
        datasets: [
            {
                label: 'Receitas',
                data: data.map(item => item.receitas),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
            },
            {
                label: 'Despesas',
                data: data.map(item => item.despesas),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#ef4444',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const,
                labels: {
                    font: {
                        family: 'Inter',
                        size: 12,
                    },
                    color: '#71717a',
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 16,
                },
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#18181b',
                bodyColor: '#52525b',
                borderColor: '#e4e4e7',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                titleFont: {
                    family: 'Plus Jakarta Sans',
                    size: 13,
                    weight: '600' as const,
                },
                bodyFont: {
                    family: 'Inter',
                    size: 12,
                },
                callbacks: {
                    label: (context: any) => {
                        const label = context.dataset.label || ''
                        const value = context.parsed.y || 0
                        return `${label}: ${formatValue(value)}`
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        family: 'Inter',
                        size: 12,
                    },
                    color: '#71717a',
                },
                border: {
                    display: false,
                },
            },
            y: {
                grid: {
                    color: '#f4f4f5',
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        family: 'Inter',
                        size: 12,
                    },
                    color: '#71717a',
                    callback: function (value: any) {
                        return formatAxisValue(value)
                    },
                },
                border: {
                    display: false,
                },
            },
        },
    }

    return (
        <Card className="rounded-[16px] border-zinc-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold font-jakarta text-zinc-950">
                    Balanço Mensal (Receitas x Despesas)
                </CardTitle>
                <CardDescription className="text-sm text-zinc-500 font-inter">
                    Comparativo temporal ao longo do mês
                </CardDescription>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-zinc-500 font-inter">
                        Nenhum dado encontrado
                    </div>
                ) : (
                    <div className="h-[300px] w-full">
                        <Line data={chartConfig} options={options} />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

"use client"

import * as React from "react"
import { Bar } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useVisibility } from "@/hooks/use-visibility-state"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface CategoryBarChartProps {
    data: Array<{ name: string; value: number }>
    subcategoryData: Array<{ name: string; value: number }>
}

export function CategoryBarChart({ data, subcategoryData }: CategoryBarChartProps) {
    const [viewMode, setViewMode] = React.useState<'category' | 'subcategory'>('category')
    const { isVisible } = useVisibility()

    const chartData = viewMode === 'category' ? data : subcategoryData

    const formatValue = (value: number) => {
        if (!isVisible) return "R$ ••••"
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value)
    }

    const chartConfig = {
        labels: chartData.map(item => item.name),
        datasets: [
            {
                label: 'Valor',
                data: chartData.map(item => item.value),
                backgroundColor: '#ef4444',
                borderRadius: 8,
                barThickness: 32,
            },
        ],
    }

    const options = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
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
                    weight: 600,
                },
                bodyFont: {
                    family: 'Inter',
                    size: 12,
                },
                callbacks: {
                    label: (context: any) => {
                        return formatValue(context.parsed.x)
                    },
                },
            },
        },
        scales: {
            x: {
                display: false,
                grid: {
                    display: false,
                },
            },
            y: {
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
        },
    }

    return (
        <Card className="rounded-[16px] border-zinc-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                    <CardTitle className="text-lg font-semibold font-jakarta text-zinc-950">
                        Gastos por {viewMode === 'category' ? 'Categoria' : 'Subcategoria'}
                    </CardTitle>
                    <CardDescription className="text-sm text-zinc-500 font-inter mt-1">
                        Distribuição de despesas
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={viewMode === 'category' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('category')}
                        className="font-inter text-xs"
                    >
                        Categoria
                    </Button>
                    <Button
                        variant={viewMode === 'subcategory' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('subcategory')}
                        className="font-inter text-xs"
                    >
                        Subcategoria
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-zinc-500 font-inter">
                        Nenhum dado encontrado
                    </div>
                ) : (
                    <div className="h-[300px] w-full">
                        <Bar data={chartConfig} options={options} />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

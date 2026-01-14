"use client"

import * as React from "react"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useVisibility } from "@/hooks/use-visibility-state"

ChartJS.register(ArcElement, Tooltip, Legend)

const CLASSIFICATION_COLORS = {
    essential: "#10b981",    // Green - Emerald 600
    necessary: "#f59e0b",    // Orange - Amber 500
    superfluous: "#ef4444"   // Red - Red 500
}

const CLASSIFICATION_LABELS = {
    essential: "Essencial",
    necessary: "Necessário",
    superfluous: "Supérfluo"
}

interface ClassificationPieChartProps {
    data: Array<{ classification: string; value: number }>
}

export function ClassificationPieChart({ data }: ClassificationPieChartProps) {
    const { isVisible } = useVisibility()

    const formatValue = (value: number) => {
        if (!isVisible) return "R$ ••••"
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const chartData = data.map(item => ({
        ...item,
        name: CLASSIFICATION_LABELS[item.classification as keyof typeof CLASSIFICATION_LABELS] || item.classification,
        color: CLASSIFICATION_COLORS[item.classification as keyof typeof CLASSIFICATION_COLORS] || "#888888"
    }))

    const total = data.reduce((sum, item) => sum + item.value, 0)

    const chartConfig = {
        labels: chartData.map(item => item.name),
        datasets: [
            {
                data: chartData.map(item => item.value),
                backgroundColor: chartData.map(item => item.color),
                borderWidth: 0,
                spacing: 2,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
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
                        const label = context.label || ''
                        const value = context.parsed || 0
                        return `${label}: ${formatValue(value)}`
                    },
                },
            },
        },
    }

    return (
        <Card className="rounded-[16px] border-zinc-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-zinc-500 font-semibold font-sans tracking-tight text-sm">
                    Classificações
                </CardTitle>
            </CardHeader>
            <CardContent>
                {chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-zinc-500 font-inter">
                        Nenhum dado encontrado
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="h-[250px] w-full flex items-center justify-center">
                            <Doughnut data={chartConfig} options={options} />
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            {chartData.map((entry) => {
                                const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0
                                return (
                                    <div key={entry.classification} className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-3 w-3 rounded-full shrink-0"
                                                style={{ backgroundColor: entry.color }}
                                            />
                                            <span className="text-zinc-600 font-inter text-xs truncate">{entry.name}</span>
                                        </div>
                                        <div className="text-zinc-950 font-semibold font-inter ml-5">
                                            {formatValue(entry.value)}
                                        </div>
                                        <div className="text-zinc-500 text-xs font-inter ml-5">
                                            {percentage}%
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

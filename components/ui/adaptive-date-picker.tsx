"use client"

import * as React from "react"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { ptBR } from "date-fns/locale"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { MonthPicker } from "@/components/ui/month-picker"

type PeriodMode = "dia" | "semana" | "mes" | "ano" | "custom"

interface AdaptiveDatePickerProps {
    mode: PeriodMode
    value?: DateRange | Date
    onChange?: (range: DateRange | undefined) => void
    className?: string
}

export function AdaptiveDatePicker({ mode, value, onChange, className }: AdaptiveDatePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(
        value instanceof Date ? value : value?.from
    )

    // Automatically set current period when mode changes
    React.useEffect(() => {
        const now = new Date()

        if (mode === "dia") {
            setDate(now)
            onChange?.({ from: now, to: now })
        } else if (mode === "semana") {
            const weekStart = startOfWeek(now, { weekStartsOn: 0 })
            const weekEnd = endOfWeek(now, { weekStartsOn: 0 })
            setDate(now)
            onChange?.({ from: weekStart, to: weekEnd })
        } else if (mode === "mes") {
            const monthStart = startOfMonth(now)
            const monthEnd = endOfMonth(now)
            setDate(now)
            onChange?.({ from: monthStart, to: monthEnd })
        } else if (mode === "ano") {
            const yearStart = startOfYear(now)
            const yearEnd = endOfYear(now)
            setDate(now)
            onChange?.({ from: yearStart, to: yearEnd })
        }
        // For 'custom' mode, don't auto-set dates
    }, [mode]) // Only run when mode changes

    // Format display based on mode
    const getDisplayText = () => {
        if (!date) return "Selecionar"

        if (mode === "dia") {
            return format(date, "dd/MM/yyyy", { locale: ptBR })
        }
        if (mode === "semana") {
            const weekStart = startOfWeek(date, { weekStartsOn: 0 })
            const weekEnd = endOfWeek(date, { weekStartsOn: 0 })
            return `${format(weekStart, "dd/MM", { locale: ptBR })} - ${format(weekEnd, "dd/MM", { locale: ptBR })}`
        }
        if (mode === "mes") {
            return format(date, "MMM/yyyy", { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase())
        }
        if (mode === "ano") {
            return format(date, "yyyy", { locale: ptBR })
        }
        if (mode === "custom") {
            return format(date, "dd/MM/yyyy", { locale: ptBR })
        }
        return "Selecionar"
    }

    // Handle date selection based on mode
    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) return

        setDate(selectedDate)

        if (mode === "dia") {
            // Single day
            onChange?.({ from: selectedDate, to: selectedDate })
            setOpen(false)
        } else if (mode === "semana") {
            // Week range
            const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 })
            const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 })
            onChange?.({ from: weekStart, to: weekEnd })
            setOpen(false)
        } else if (mode === "ano") {
            // Year range
            const yearStart = startOfYear(selectedDate)
            const yearEnd = endOfYear(selectedDate)
            onChange?.({ from: yearStart, to: yearEnd })
            setOpen(false)
        }
    }

    // Handle month selection
    const handleMonthSelect = (selectedDate: Date) => {
        setDate(selectedDate)
        const monthStart = startOfMonth(selectedDate)
        const monthEnd = endOfMonth(selectedDate)
        onChange?.({ from: monthStart, to: monthEnd })
        setOpen(false)
    }

    // Render month picker for "mes" mode
    if (mode === "mes") {
        return (
            <MonthPicker
                value={date}
                onChange={handleMonthSelect}
                className={className}
            />
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-auto justify-start text-left font-inter font-normal px-3",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {getDisplayText()}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    locale={ptBR}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}

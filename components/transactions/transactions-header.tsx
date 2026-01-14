"use client"

import { Search, Plus, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AdaptiveDatePicker } from "@/components/ui/adaptive-date-picker"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DateRange } from "react-day-picker"
import { TimeRange } from "@/app/actions/transactions-fetch"

interface TransactionsHeaderProps {
    title: string
    description: string
    searchValue: string
    onSearchChange: (value: string) => void
    range: TimeRange
    date: DateRange | undefined
    onDateChange: (date: DateRange | undefined) => void
    onAddClick: (type: "revenue" | "expense" | "investment") => void
}

export function TransactionsHeader({
    title,
    description,
    searchValue,
    onSearchChange,
    range,
    date,
    onDateChange,
    onAddClick,
}: TransactionsHeaderProps) {
    return (
        <div className="flex items-center justify-between flex-none">
            <div className="ml-2">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-950 font-jakarta">
                    {title}
                </h1>
                <p className="text-zinc-500 mt-1 font-sans text-sm font-inter">
                    {description}
                </p>
            </div>

            <div id="filter-group" className="flex items-center gap-3 font-sans justify-end flex-wrap">
                {/* 1. Adaptive Date Picker (150px) - Maintains specific date selection within the period */}
                <AdaptiveDatePicker
                    mode={range as any}
                    value={date}
                    onChange={onDateChange}
                    className="w-auto"
                />

                {/* 2. Search Bar (250px) */}
                <div className="relative w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Buscar"
                        className="pl-9 h-10 font-inter w-full"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {/* 3. Add Button -> Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="font-inter font-medium bg-[#00665C] hover:bg-[#00665C]/90">
                            Adicionar
                            <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px] bg-white">
                        <DropdownMenuItem onClick={() => onAddClick('revenue')} className="cursor-pointer">
                            Receita
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAddClick('expense')} className="cursor-pointer">
                            Despesa
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}

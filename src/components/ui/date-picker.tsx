"use client"

import * as React from "react"
import { format } from "date-fns"
import { sl } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value: string | null
  onChange: (date: string | null) => void
  placeholder?: string
}

export function DatePicker({ value, onChange, placeholder }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  // Parse the value string to Date object
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    // Try parsing different formats
    const parsed = new Date(value)
    if (!isNaN(parsed.getTime())) return parsed
    // Try DD.MM.YYYY format
    const parts = value.split(".")
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
      if (!isNaN(d.getTime())) return d
    }
    return undefined
  }, [value])

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Format as DD.MM.YYYY for Slovenian locale
      onChange(format(date, "d. M. yyyy", { locale: sl }))
    } else {
      onChange(null)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal border-ocean-frost hover:bg-ocean-light",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-ocean-surf" />
          {value ? value : <span>{placeholder || "Izberite datum"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[99999]" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

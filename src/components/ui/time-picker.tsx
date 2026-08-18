"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TimePickerProps {
  value: string | null
  onChange: (time: string | null) => void
  placeholder?: string | null
}

export function TimePicker({ value, onChange, placeholder }: TimePickerProps) {
  const [open, setOpen] = React.useState(false)

  const quickTimes = ["6:00", "7:00", "8:00", "9:00", "12:00", "13:00", "14:00", "15:00"]

  const normalizeTime = (time: string) => {
    if (!time) return null
    const [hour, minute = "00"] = time.split(":")
    return `${Number(hour)}:${minute.padStart(2, "0")}`
  }

  const handleChange = (time: string) => {
    onChange(normalizeTime(time))
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
          <Clock className="mr-2 h-4 w-4 text-ocean-surf" />
          {value ? value : <span>{placeholder || "Izberite čas"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 z-[99999]" align="start">
        <input
          type="time"
          value={value && /^\d{1,2}:\d{2}$/.test(value) ? value.padStart(5, "0") : ""}
          onChange={(event) => handleChange(event.target.value)}
          className="h-10 w-full rounded-md border border-ocean-frost bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-ocean-surf focus:ring-2 focus:ring-ocean-surf/20"
        />
        <div className="mt-3 grid grid-cols-4 gap-2">
          {quickTimes.map((time) => (
            <Button
              key={time}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleChange(time)}
              className="h-8 border-ocean-frost text-xs hover:bg-ocean-light"
            >
              {time}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

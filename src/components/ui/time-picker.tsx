"use client"

import TimePickerBase from "react-time-picker"
import { Clock, X } from "lucide-react"

import "react-time-picker/dist/TimePicker.css"
import "react-clock/dist/Clock.css"
import "./time-picker.css"

import { cn } from "@/lib/utils"

interface TimePickerProps {
  value: string | null
  onChange: (time: string | null) => void
  placeholder?: string | null
}

const normalizeTime = (time: unknown): string | null => {
  const firstValue = Array.isArray(time) ? time[0] : time

  if (!firstValue) return null

  if (firstValue instanceof Date) {
    return `${firstValue.getHours()}:${String(firstValue.getMinutes()).padStart(2, "0")}`
  }

  if (typeof firstValue !== "string") return null

  const match = firstValue.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
  if (!match) return firstValue

  return `${Number(match[1])}:${match[2]}`
}

export function TimePicker({ value, onChange, placeholder }: TimePickerProps) {
  return (
    <div
      className={cn(
        "mediform-time-picker w-full rounded-md border border-ocean-frost bg-white text-sm shadow-sm transition-all duration-200 focus-within:border-ocean-surf focus-within:ring-2 focus-within:ring-ocean-surf/20",
        !value && "text-muted-foreground"
      )}
    >
      <TimePickerBase
        value={value || null}
        onChange={(nextValue) => onChange(normalizeTime(nextValue))}
        format="H:mm"
        locale="sl-SI"
        maxDetail="minute"
        disableClock={false}
        clearIcon={<X className="h-4 w-4 text-slate-500" />}
        clockIcon={<Clock className="h-4 w-4 text-ocean-surf" />}
        hourPlaceholder={placeholder ? "--" : "hh"}
        minutePlaceholder="mm"
        clockAriaLabel="Odpri izbiro ure"
        clearAriaLabel="Počisti čas"
        hourAriaLabel="Ura"
        minuteAriaLabel="Minute"
        nativeInputAriaLabel={placeholder || "Izberite čas"}
      />
    </div>
  )
}

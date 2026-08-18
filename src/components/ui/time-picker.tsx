"use client"

import * as React from "react"
import { Check, Clock, X } from "lucide-react"

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
  const [draftHour, setDraftHour] = React.useState(8)
  const [draftMinute, setDraftMinute] = React.useState(0)
  const [mode, setMode] = React.useState<"hour" | "minute">("hour")
  const [hourPeriod, setHourPeriod] = React.useState<"am" | "pm">("am")

  const minutes = Array.from({ length: 12 }, (_, index) => index * 5)
  const displayedHours = Array.from({ length: 12 }, (_, index) =>
    hourPeriod === "am" ? index : index + 12
  )

  const parseTime = (time: string | null) => {
    if (!time) return null
    const match = time.match(/^(\d{1,2}):(\d{2})$/)
    if (!match) return null
    const hour = Math.min(23, Math.max(0, Number(match[1])))
    const minute = Math.min(59, Math.max(0, Number(match[2])))
    return { hour, minute }
  }

  const formatTime = (hour: number, minute: number) => {
    return `${hour}:${String(minute).padStart(2, "0")}`
  }

  React.useEffect(() => {
    const parsed = parseTime(value)
    if (!parsed) return
    setDraftHour(parsed.hour)
    setDraftMinute(parsed.minute)
    setHourPeriod(parsed.hour < 12 ? "am" : "pm")
  }, [value])

  const selectHour = (hour: number) => {
    setDraftHour(hour)
    setMode("minute")
  }

  const selectMinute = (minute: number) => {
    setDraftMinute(minute)
    onChange(formatTime(draftHour, minute))
    setOpen(false)
    setMode("hour")
  }

  const clearTime = () => {
    onChange(null)
    setOpen(false)
    setMode("hour")
  }

  const getClockPosition = (index: number) => {
    const angle = (index / 12) * 360 - 90
    const radius = 92
    const x = Math.cos((angle * Math.PI) / 180) * radius
    const y = Math.sin((angle * Math.PI) / 180) * radius
    return {
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      transform: "translate(-50%, -50%)",
    }
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
      <PopoverContent className="w-72 p-4 z-[99999]" align="start">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-ocean-deep">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-semibold">Izberi čas</span>
          </div>
          <div className="rounded-md bg-ocean-light px-3 py-1 font-mono text-lg font-semibold text-ocean-deep">
            {formatTime(draftHour, draftMinute)}
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 rounded-md border border-ocean-frost bg-white p-1">
          <Button
            type="button"
            variant={mode === "hour" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("hour")}
            className={mode === "hour" ? "bg-ocean-deep text-white hover:bg-ocean-teal" : "text-slate-700"}
          >
            Ura
          </Button>
          <Button
            type="button"
            variant={mode === "minute" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("minute")}
            className={mode === "minute" ? "bg-ocean-deep text-white hover:bg-ocean-teal" : "text-slate-700"}
          >
            Minute
          </Button>
        </div>

        {mode === "hour" && (
          <div className="mb-3 grid grid-cols-2 rounded-md border border-ocean-frost bg-white p-1">
            <Button
              type="button"
              variant={hourPeriod === "am" ? "default" : "ghost"}
              size="sm"
              onClick={() => setHourPeriod("am")}
              className={hourPeriod === "am" ? "bg-ocean-deep text-white hover:bg-ocean-teal" : "text-slate-700"}
            >
              00-11
            </Button>
            <Button
              type="button"
              variant={hourPeriod === "pm" ? "default" : "ghost"}
              size="sm"
              onClick={() => setHourPeriod("pm")}
              className={hourPeriod === "pm" ? "bg-ocean-deep text-white hover:bg-ocean-teal" : "text-slate-700"}
            >
              12-23
            </Button>
          </div>
        )}

        <div className="relative mx-auto h-56 w-56 rounded-full border border-ocean-frost bg-gradient-to-br from-white to-ocean-light/40 shadow-inner">
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ocean-deep" />
          {mode === "hour" ? (
            displayedHours.map((hour, index) => (
              <Button
                key={hour}
                type="button"
                variant={draftHour === hour ? "default" : "outline"}
                size="sm"
                onClick={() => selectHour(hour)}
                style={getClockPosition(index)}
                className={cn(
                  "absolute h-9 w-9 rounded-full p-0 font-mono",
                  draftHour === hour
                    ? "bg-ocean-deep text-white hover:bg-ocean-teal"
                    : "border-ocean-frost bg-white hover:bg-ocean-light"
                )}
              >
                {String(hour).padStart(2, "0")}
              </Button>
            ))
          ) : (
            minutes.map((minute, index) => (
              <Button
                key={minute}
                type="button"
                variant={draftMinute === minute ? "default" : "outline"}
                size="sm"
                onClick={() => selectMinute(minute)}
                style={getClockPosition(index)}
                className={cn(
                  "absolute h-9 w-9 rounded-full p-0 font-mono",
                  draftMinute === minute
                    ? "bg-ocean-deep text-white hover:bg-ocean-teal"
                    : "border-ocean-frost bg-white hover:bg-ocean-light"
                )}
              >
                {String(minute).padStart(2, "0")}
              </Button>
            ))
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearTime}
            className="text-slate-600 hover:bg-slate-100"
          >
            <X className="mr-2 h-4 w-4" />
            Počisti
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onChange(formatTime(draftHour, draftMinute))
              setOpen(false)
              setMode("hour")
            }}
            className="bg-ocean-deep text-white hover:bg-ocean-teal"
          >
            <Check className="mr-2 h-4 w-4" />
            Potrdi
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

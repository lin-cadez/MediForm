"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { sl } from "date-fns/locale"
import "react-day-picker/style.css"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={sl}
      className={cn("p-3 rdp-ocean", className)}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

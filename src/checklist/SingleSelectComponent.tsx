"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SingleSelectInputProps {
  predefinedOptions: string[]
  value: string | null
  onChange: (value: string | null) => void
}

export default function SingleSelectInput({ predefinedOptions, value, onChange }: SingleSelectInputProps) {
  const [inputValue, setInputValue] = useState(value || "")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value || "")
  }, [value])

  const handleSelect = (option: string) => {
    setInputValue(option)
    onChange(option)
    setIsDropdownOpen(false)
    setHighlightedIndex(-1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    setIsDropdownOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev < predefinedOptions.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : predefinedOptions.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0) {
          handleSelect(predefinedOptions[highlightedIndex])
        }
        break
      case "Escape":
        setIsDropdownOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  const filteredOptions = predefinedOptions.filter((option) => option.toLowerCase().includes(inputValue.toLowerCase()))

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative mb-4" ref={dropdownRef}>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Vpišite ali izberite možnost..."
            className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 border-violet-200"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-violet-100"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 text-violet-500 transition-transform duration-200",
                isDropdownOpen && "rotate-180",
              )}
            />
          </Button>
        </div>
      </div>

      {isDropdownOpen && filteredOptions.length > 0 && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-violet-200 rounded-lg shadow-xl max-h-60 overflow-auto">
          {filteredOptions.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                "w-full px-3 py-2 text-left text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-violet-50 transition-colors duration-150 flex items-center justify-between",
                index === highlightedIndex && "bg-gradient-to-r from-blue-50 to-violet-50",
                option === value && "bg-gradient-to-r from-blue-100 to-violet-100 text-violet-700",
              )}
            >
              <span>{option}</span>
              {option === value && <Check className="h-4 w-4 text-violet-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

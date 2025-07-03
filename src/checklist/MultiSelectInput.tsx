"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectInputProps {
    predefinedOptions: string[];
    value: string[];
    onChange: (value: string[]) => void;
}

export default function MultiSelectInput({
    predefinedOptions,
    value,
    onChange,
}: MultiSelectInputProps) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>(value);
    const [inputValue, setInputValue] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSelectedOptions(value);
    }, [value]);

    const handleSelect = (option: string) => {
        if (!selectedOptions.includes(option)) {
            const updatedOptions = [...selectedOptions, option];
            setSelectedOptions(updatedOptions);
            onChange(updatedOptions);
        }
        setInputValue("");
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
    };

    const handleRemove = (option: string) => {
        const updatedOptions = selectedOptions.filter(
            (item) => item !== option
        );
        setSelectedOptions(updatedOptions);
        onChange(updatedOptions);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setIsDropdownOpen(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case "Enter":
                e.preventDefault();
                if (
                    highlightedIndex >= 0 &&
                    availableOptions[highlightedIndex]
                ) {
                    handleSelect(availableOptions[highlightedIndex]);
                } else if (
                    inputValue.trim() &&
                    !selectedOptions.includes(inputValue.trim())
                ) {
                    handleSelect(inputValue.trim());
                }
                break;
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < availableOptions.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : availableOptions.length - 1
                );
                break;
            case "Escape":
                setIsDropdownOpen(false);
                setHighlightedIndex(-1);
                break;
            case "Backspace":
                if (!inputValue && selectedOptions.length > 0) {
                    handleRemove(selectedOptions[selectedOptions.length - 1]);
                }
                break;
        }
    };

    const availableOptions = predefinedOptions.filter(
        (option) =>
            !selectedOptions.includes(option) &&
            option.toLowerCase().includes(inputValue.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative mb-4" ref={dropdownRef}>
            <div className="min-h-[2.5rem] p-2 border border-violet-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-300 transition-all duration-200">
                <div className="flex flex-wrap gap-1 mb-2">
                    {selectedOptions.map((option) => (
                        <Badge
                            key={option}
                            variant="secondary"
                            className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-violet-100 text-violet-800 hover:from-blue-200 hover:to-violet-200 transition-colors duration-150"
                        >
                            <span className="text-xs">{option}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemove(option)}
                                className="h-4 w-4 p-0 hover:bg-violet-300 rounded-full"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <Input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsDropdownOpen(true)}
                        placeholder={
                            selectedOptions.length === 0
                                ? "Vpišite ali izberite možnosti..."
                                : "Dodajte več..."
                        }
                        className="border-0 shadow-none focus-visible:ring-0 p-0 h-6 text-sm"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="h-6 w-6 p-0 hover:bg-violet-100 rounded"
                    >
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 text-slate-500 transition-transform duration-200",
                                isDropdownOpen && "rotate-180"
                            )}
                        />
                    </Button>
                </div>
            </div>

            {isDropdownOpen && (
                <div className="absolute z-[9999] w-full mt-1 bg-white border border-violet-200 rounded-lg shadow-xl max-h-60 overflow-auto">
                    {availableOptions.length > 0 ? (
                        availableOptions.map((option, index) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => handleSelect(option)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                className={cn(
                                    "w-full px-3 py-2 text-left text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-violet-50 transition-colors duration-150 flex items-center gap-2",
                                    index === highlightedIndex &&
                                        "bg-gradient-to-r from-blue-50 to-violet-50"
                                )}
                            >
                                <Plus className="h-4 w-4 text-violet-400" />
                                <span>{option}</span>
                            </button>
                        ))
                    ) : inputValue.trim() &&
                      !selectedOptions.includes(inputValue.trim()) ? (
                        <button
                            type="button"
                            onClick={() => handleSelect(inputValue.trim())}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors duration-150 flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4 text-slate-400" />
                            <span>Dodaj "{inputValue.trim()}"</span>
                        </button>
                    ) : (
                        <div className="px-3 py-2 text-sm text-slate-500">
                            Ni razpoložljivih možnosti
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

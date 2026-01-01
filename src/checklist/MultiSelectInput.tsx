"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSelectedOptions(value);
    }, [value]);

    // Update dropdown position when opening
    useEffect(() => {
        if (isDropdownOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    }, [isDropdownOpen]);

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
                !dropdownRef.current.contains(event.target as Node) &&
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const dropdownContent = isDropdownOpen && (
        <div 
            ref={dropdownRef}
            className="fixed bg-white border border-ocean-frost rounded-md shadow-2xl max-h-60 overflow-auto"
            style={{ 
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                zIndex: 99999,
            }}
        >
            {availableOptions.length > 0 ? (
                availableOptions.map((option, index) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => handleSelect(option)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={cn(
                            "w-full px-3 py-2 text-left text-sm hover:bg-gradient-to-r hover:from-ocean-light hover:to-ocean-frost transition-colors duration-150 flex items-center gap-2",
                            index === highlightedIndex &&
                                "bg-gradient-to-r from-ocean-light to-ocean-frost"
                        )}
                    >
                        <Plus className="h-4 w-4 text-ocean-surf" />
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
    );

    return (
        <div className="relative pb-2" ref={containerRef}>
            <div className="min-h-[2.5rem] p-2 border border-ocean-frost rounded-md bg-white focus-within:ring-2 focus-within:ring-ocean-surf/20 focus-within:border-ocean-surf transition-all duration-200">
                <div className="flex flex-wrap gap-1 mb-2">
                    {selectedOptions.map((option) => (
                        <Badge
                            key={option}
                            variant="secondary"
                            className="flex items-center gap-1 bg-gradient-to-r from-ocean-light to-ocean-frost text-ocean-deep hover:from-ocean-frost hover:to-ocean-surf/30 transition-colors duration-150"
                        >
                            <span className="text-xs">{option}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemove(option)}
                                className="h-4 w-4 p-0 hover:bg-ocean-surf/50 rounded-full"
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
                        className="h-6 w-6 p-0 hover:bg-ocean-light rounded"
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

            {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
        </div>
    );
}

"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SingleSelectInputProps {
    predefinedOptions: string[];
    value: string | null;
    onChange: (value: string | null) => void;
}

export default function SingleSelectInput({
    predefinedOptions,
    value,
    onChange,
}: SingleSelectInputProps) {
    const [inputValue, setInputValue] = useState(value || "");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInputValue(value || "");
    }, [value]);

    const updateDropdownPosition = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: 'fixed',
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width,
                zIndex: 99999,
            });
        }
    };

    const openDropdown = () => {
        updateDropdownPosition();
        setIsDropdownOpen(true);
    };

    const handleSelect = (option: string) => {
        setInputValue(option);
        onChange(option);
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);
        if (!isDropdownOpen) {
            openDropdown();
        }
    };

    const filteredOptions = predefinedOptions.filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase())
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isDropdownOpen) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex]);
                }
                break;
            case "Escape":
                setIsDropdownOpen(false);
                setHighlightedIndex(-1);
                break;
        }
    };

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

        const handleScroll = () => {
            if (isDropdownOpen && containerRef.current) {
                updateDropdownPosition();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll, true);
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [isDropdownOpen]);

    return (
        <div className="relative" ref={containerRef}>
            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <Input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={openDropdown}
                        placeholder="Vpišite ali izberite možnost..."
                        className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-ocean-surf/20 focus:border-ocean-surf border-ocean-frost"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (isDropdownOpen) {
                                setIsDropdownOpen(false);
                            } else {
                                openDropdown();
                            }
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-ocean-light"
                    >
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 text-ocean-surf transition-transform duration-200",
                                isDropdownOpen && "rotate-180"
                            )}
                        />
                    </Button>
                </div>
            </div>

            {isDropdownOpen && createPortal(
                <div 
                    ref={dropdownRef}
                    className="bg-white border border-ocean-frost rounded-md shadow-lg max-h-60 overflow-auto"
                    style={dropdownStyle}
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => handleSelect(option)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                className={cn(
                                    "w-full px-3 py-2 text-left text-sm hover:bg-gradient-to-r hover:from-ocean-light hover:to-ocean-frost transition-colors duration-150 flex items-center justify-between",
                                    index === highlightedIndex &&
                                        "bg-gradient-to-r from-ocean-light to-ocean-frost",
                                    option === value &&
                                        "bg-gradient-to-r from-ocean-frost to-ocean-surf/30 text-ocean-deep"
                                )}
                            >
                                <span>{option}</span>
                                {option === value && (
                                    <Check className="h-4 w-4 text-ocean-teal" />
                                )}
                            </button>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-sm text-slate-500">
                            Ni razpoložljivih možnosti
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
}

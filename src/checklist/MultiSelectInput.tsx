import React, {
	useState,
	useRef,
	useEffect,
	KeyboardEvent,
	FocusEvent,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, ChevronDown } from "lucide-react";

interface MultiSelectInputProps {
	predefinedOptions: string[];
	value: string[];
	onChange: (value: string[]) => void;
}

function MultiSelectInput({
	predefinedOptions,
	value,
	onChange,
}: MultiSelectInputProps) {
	const [selectedOptions, setSelectedOptions] = useState<string[]>(value);
	const [inputValue, setInputValue] = useState("");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);

	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLUListElement>(null);

	useEffect(() => {
		setSelectedOptions(value); // Sync initial value with state
	}, [value]);

	const filteredOptions = predefinedOptions.filter(
		(option) =>
			!selectedOptions.includes(option) &&
			option.toLowerCase().includes(inputValue.toLowerCase())
	);

	const handleSelect = (option: string) => {
		const updatedOptions = [...selectedOptions, option];
		setSelectedOptions(updatedOptions);
		onChange(updatedOptions);
		setInputValue("");
		setIsDropdownOpen(false);
		setHighlightedIndex(-1);
		inputRef.current?.focus();
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
		setHighlightedIndex(-1);
	};

	const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		switch (e.key) {
			case "Enter":
				e.preventDefault();
				if (
					highlightedIndex >= 0 &&
					filteredOptions[highlightedIndex]
				) {
					handleSelect(filteredOptions[highlightedIndex]);
				} else if (inputValue.trim() !== "") {
					if (!selectedOptions.includes(inputValue.trim())) {
						handleSelect(inputValue.trim());
					}
				}
				break;
			case "ArrowDown":
				e.preventDefault();
				setHighlightedIndex((prevIndex) =>
					Math.min(prevIndex + 1, filteredOptions.length - 1)
				);
				break;
			case "ArrowUp":
				e.preventDefault();
				setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
				break;
			case "Escape":
				setIsDropdownOpen(false);
				setHighlightedIndex(-1);
				break;
		}
	};

	const handleInputBlur = (_e: FocusEvent<HTMLInputElement>) => {
		setTimeout(() => {
			if (!dropdownRef.current?.contains(document.activeElement)) {
				setIsDropdownOpen(false);
			}
		}, 150);
	};

	const handleInputFocus = () => {
		if (inputValue.trim() !== "") {
			setIsDropdownOpen(true);
		}
	};

	const toggleDropdown = () => {
		setIsDropdownOpen((prev) => !prev);
		inputRef.current?.focus();
	};

	const handleOutsideClick = (e: globalThis.MouseEvent) => {
		if (
			!dropdownRef.current?.contains(e.target as Node) &&
			!inputRef.current?.contains(e.target as Node)
		) {
			setIsDropdownOpen(false);
		}
	};

	useEffect(() => {
		if (isDropdownOpen) {
			document.addEventListener("mousedown", handleOutsideClick);
		} else {
			document.removeEventListener("mousedown", handleOutsideClick);
		}
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
		};
	}, [isDropdownOpen]);

	return (
		<div className="relative w-full max-w-md mx-auto pt-4 pb-4">
			<div className="border rounded-md p-2">
				<div className="flex flex-wrap gap-2 mb-2">
					{selectedOptions.map((option) => (
						<span
							key={option}
							className="flex items-center bg-primary text-primary-foreground px-2 py-1 rounded-full text-sm">
							{option}
							<Button
								variant="ghost"
								size="sm"
								className="ml-1 h-4 w-4 p-0"
								onClick={() => handleRemove(option)}>
								<X className="h-3 w-3" />
							</Button>
						</span>
					))}
				</div>
				<div className="flex items-center">
					<Input
						ref={inputRef}
						type="text"
						value={inputValue}
						onChange={handleInputChange}
						onKeyDown={handleInputKeyDown}
						onBlur={handleInputBlur}
						onFocus={handleInputFocus}
						className="placeholder_fix flex-grow border-none shadow-none focus-visible:ring-0"
						placeholder="Type or select an option..."
					/>
					<Button
						variant="outline"
						onClick={toggleDropdown}
						className="ml-2">
						<ChevronDown className="h-4 w-4" />
					</Button>
				</div>
				{isDropdownOpen && filteredOptions.length > 0 && (
					<ul
						ref={dropdownRef}
						className="absolute z-10 bg-white border rounded-md shadow-lg max-h-60 overflow-auto mt-1 w-full">
						{filteredOptions.map((option, index) => (
							<li
								key={option}
								className={`px-4 py-2 cursor-pointer ${
									index === highlightedIndex
										? "bg-accent"
										: ""
								}`}
								onMouseEnter={() => setHighlightedIndex(index)}
								onClick={() => handleSelect(option)}>
								{option}
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}

export default MultiSelectInput;

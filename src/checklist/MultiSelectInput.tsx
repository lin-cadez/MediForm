import React, {
	useState,
	useRef,
	KeyboardEvent,
	FocusEvent,
	MouseEvent,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, ChevronDown } from "lucide-react";

interface MultiSelectInputProps {
	predefinedOptions: string[];
	value: any;
	onChange: (value: any) => void;
}

function MultiSelectInput({ predefinedOptions }: MultiSelectInputProps) {
	const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const dropdownRef = useRef<HTMLUListElement>(null);

	const filteredOptions = predefinedOptions.filter(
		(option) =>
			!selectedOptions.includes(option) &&
			option.toLowerCase().includes(inputValue.toLowerCase())
	);

	const handleSelect = (option: string) => {
		setSelectedOptions([...selectedOptions, option]);
		setInputValue("");
		setIsDropdownOpen(false);
		inputRef.current?.focus();
	};

	const handleRemove = (option: string) => {
		setSelectedOptions(selectedOptions.filter((item) => item !== option));
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
		setIsDropdownOpen(true);
	};

	const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && inputValue.trim() !== "") {
			e.preventDefault();
			if (!selectedOptions.includes(inputValue.trim())) {
				setSelectedOptions([...selectedOptions, inputValue.trim()]);
			}
			setInputValue("");
			setIsDropdownOpen(false);
		}
	};

	const handleInputBlur = (_e: FocusEvent<HTMLInputElement>) => {
		setTimeout(() => {
			if (
				document.activeElement !== inputRef.current &&
				!dropdownRef.current?.contains(document.activeElement)
			) {
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

	return (
		<div className="w-full max-w-md mx-auto pt-4 pb-4">
			<div className="border rounded-md p-2" ref={containerRef}>
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
						className="flex-grow border-none shadow-none focus-visible:ring-0"
						placeholder="Type or select options..."
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
						className="absolute z-10 bg-white border rounded-md shadow-lg max-h-60 overflow-auto mt-1"
						style={{
							width: containerRef.current?.offsetWidth || "100%",
						}}
						onMouseDown={(e: MouseEvent) => e.preventDefault()} // Prevent dropdown from closing on click
					>
						{filteredOptions.map((option) => (
							<li
								key={option}
								className="px-4 py-2 hover:bg-accent cursor-pointer"
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

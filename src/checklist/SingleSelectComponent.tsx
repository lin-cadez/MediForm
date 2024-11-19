import React, {
	useState,
	useRef,
	useEffect,
	KeyboardEvent,
	FocusEvent,
	MouseEvent,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface SingleSelectInputProps {
	predefinedOptions: string[];
	value: string | null; // Initial selected value
	onChange: (value: string | null) => void;
}

function SingleSelectInput({
	predefinedOptions,
	value,
	onChange,
}: SingleSelectInputProps) {
	const [selectedOption, setSelectedOption] = useState<string | null>(value);
	const [inputValue, setInputValue] = useState(value || "");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const dropdownRef = useRef<HTMLUListElement>(null);

	useEffect(() => {
		// Sync external `value` prop with internal state
		setSelectedOption(value);
		setInputValue(value || "");
	}, [value]);

	const handleSelect = (option: string) => {
		setSelectedOption(option);
		setInputValue(option);
		onChange(option); // Notify parent
		setIsDropdownOpen(false);
		inputRef.current?.focus();
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setInputValue(newValue);
		setSelectedOption(null); // Clear selection when manually entering text
		onChange(null); // Notify parent that no predefined option is selected
		setIsDropdownOpen(false);
	};

	const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && inputValue.trim() !== "") {
			e.preventDefault();
			if (predefinedOptions.includes(inputValue.trim())) {
				handleSelect(inputValue.trim());
			}
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

	const toggleDropdown = () => {
		setIsDropdownOpen((prev) => !prev);
		inputRef.current?.focus();
	};

	return (
		<div className="w-full max-w-md mx-auto pt-4 pb-4">
			<div className="border rounded-md p-2 w-full" ref={containerRef}>
				<div className="flex items-center w-full">
					<Input
						ref={inputRef}
						type="text"
						value={inputValue}
						onChange={handleInputChange}
						onKeyDown={handleInputKeyDown}
						onBlur={handleInputBlur}
						className="placeholder_fix flex-grow w-full border-none shadow-none focus-visible:ring-0"
						placeholder="Piši ali izberi med možnostimi..."
					/>
					<Button
						variant="outline"
						onClick={toggleDropdown}
						className="ml-2">
						<ChevronDown className="h-4 w-4" />
					</Button>
				</div>
				{isDropdownOpen && (
					<ul
						ref={dropdownRef}
						className="absolute z-10 border rounded-md shadow-lg max-h-60 overflow-auto mt-1 bg-white w-full"
						style={{
							width: containerRef.current?.offsetWidth || "100%",
						}}
						onMouseDown={(e: MouseEvent) => e.preventDefault()}
					>
						{predefinedOptions.map((option) => (
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

export default SingleSelectInput;

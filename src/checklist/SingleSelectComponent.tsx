import React, {
	useState,
	useRef,
	KeyboardEvent,
	FocusEvent,
	MouseEvent,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface SingleSelectInputProps {
	predefinedOptions: string[];
	value: any;
	onChange: (value: any) => void;
}

function SingleSelectInput({ predefinedOptions }: SingleSelectInputProps) {
	const [, setSelectedOption] = useState<string | null>(null);
	const [inputValue, setInputValue] = useState("");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const dropdownRef = useRef<HTMLUListElement>(null);

	const handleSelect = (option: string) => {
		setSelectedOption(option);
		setInputValue(option);
		setIsDropdownOpen(false);
		inputRef.current?.focus();
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setInputValue(value);
		setSelectedOption(value); // Set the manually entered value as the selected option
		setIsDropdownOpen(false); // Close the dropdown when typing starts
	};

	const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && inputValue.trim() !== "") {
			e.preventDefault();
			handleSelect(inputValue.trim());
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

	// Remove dropdown opening when focusing on the input
	const handleInputFocus = () => {
		// Do nothing when the input is focused to prevent dropdown from opening
	};

	const toggleDropdown = () => {
		setIsDropdownOpen((prev) => !prev);
		inputRef.current?.focus();
	};

	return (
		<div className="w-full max-w-md mx-auto p-4">
			<div className="border rounded-md p-2" ref={containerRef}>
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
						placeholder="Type or select an option..."
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
						className="absolute z-10 border rounded-md shadow-lg max-h-60 overflow-auto mt-1 bg-white"
						style={{
							width: containerRef.current?.offsetWidth || "100%",
						}}
						onMouseDown={(e: MouseEvent) => e.preventDefault()} // Prevent dropdown from closing on click
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

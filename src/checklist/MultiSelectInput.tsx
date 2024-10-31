import { useState } from 'react';
import './MultiSelectInput.css';

// Define the type for the props
interface MultiSelectInputProps {
    options: string[];
}

const MultiSelectInput: React.FC<MultiSelectInputProps> = ({ options }) => {
    const [inputValue, setInputValue] = useState('');
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    // Handle selecting an option from dropdown
    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        if (value && !selectedOptions.includes(value)) {
            setSelectedOptions([...selectedOptions, value]);
        }
        setInputValue('');  // Reset input value after adding
    };

    // Handle adding custom input as a new option
    const handleAddOption = (event: React.FormEvent) => {
        event.preventDefault();
        if (inputValue && !selectedOptions.includes(inputValue)) {
            setSelectedOptions([...selectedOptions, inputValue]);
        }
        setInputValue('');  // Reset input value after adding
    };

    // Handle removing a selected option
    const handleRemoveOption = (optionToRemove: string) => {
        setSelectedOptions(selectedOptions.filter(option => option !== optionToRemove));
    };

    return (
        <div className="multi-select-input">
            <div className="selected-options">
                {selectedOptions.map((option, index) => (
                    <span key={index} className="option-bubble">
                        {option}
                        <button onClick={() => handleRemoveOption(option)}>&times;</button>
                    </span>
                ))}
            </div>

            <div className="input-wrapper">
                <select onChange={handleSelect} value="">
                    <option value="" disabled>Select an option</option>
                    {options.map((option, index) => (
                        <option key={index} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    placeholder="Type your own option"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddOption(e)}
                />

                <button onClick={handleAddOption}>Add</button>
            </div>
        </div>
    );
};

export default MultiSelectInput;

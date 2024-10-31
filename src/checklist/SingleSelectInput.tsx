import { useState } from 'react';
import './SingleSelectInput.css';

// Define the type for the props
interface SingleSelectInputProps {
    options: string[];
}

const SingleSelectInput: React.FC<SingleSelectInputProps> = ({ options }) => {
    const [inputValue, setInputValue] = useState('');
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    // Handle selecting an option from dropdown
    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setSelectedOption(value);
        setInputValue('');  // Reset input field
    };

    // Handle adding custom input as a single option
    const handleAddOption = (event: React.FormEvent) => {
        event.preventDefault();
        if (inputValue) {
            setSelectedOption(inputValue);
            setInputValue('');  // Reset input field after adding
        }
    };

    return (
        <div className="single-select-input">
            <div className="input-wrapper">
                <select onChange={handleSelect} value={selectedOption || ""}>
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
            {selectedOption && <p className="selected-display">Selected: {selectedOption}</p>}
        </div>
    );
};

export default SingleSelectInput;

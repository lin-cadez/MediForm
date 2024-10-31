import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import MultiSelectInput from "./MultiSelectInput";
import SingleSelectInput from "./SingleSelectInput";
import ExportSVG from "../export.svg";
import Pdf from "../pdf.svg";
import Excel from "../excel.svg";
import "./checklist.css";

const jsonUrl =
    "https://raw.githubusercontent.com/jakecernet/checklist-helper/refs/heads/main/form_data/test1.json?token=GHSAT0AAAAAACV6NSKVAZQ4LAP7A34KE2OOZZECS4A";

// Define interfaces for JSON structure
interface Element {
    title: string;
    unit?: string | null;
    value?: string | boolean | null | string[];
    hint?: string;
    type: "str" | "bool";
    options?: string[];
    option_type?: "one" | "multiple";
}

interface Subcategory {
    title: string;
    description?: string | null;
    elements: { [key: string]: Element };
}

interface Category {
    title: string;
    description?: string;
    subcategories: { [key: string]: Subcategory };
}

interface ChecklistData {
    categories: { [key: string]: Category };
}

export default function Checklist() {
    const [data, setData] = useState<ChecklistData | null>(null);
    const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const savedData = localStorage.getItem("checklistData");
                if (savedData) {
                    setData(JSON.parse(savedData));
                } else {
                    const response = await fetch(jsonUrl);
                    const jsonData: ChecklistData = await response.json();
                    setData(jsonData);
                    localStorage.setItem("checklistData", JSON.stringify(jsonData));
                }
            } catch (error) {
                console.error("Failed to fetch JSON data:", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (data) {
            localStorage.setItem("checklistData", JSON.stringify(data));
        }
    }, [data]);

    const toggleCategory = (categoryId: string) => {
        setOpenCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));
    };

    const handleChange = (
        categoryId: string,
        subcategoryId: string,
        elementId: string,
        value: string | boolean | string[]
    ) => {
        setData((prevData) => {
            if (!prevData) return prevData;

            const updatedData = { ...prevData };
            updatedData.categories[categoryId].subcategories[subcategoryId].elements[elementId].value = value;
            return updatedData;
        });
    };

    if (!data) return <div>Loading...</div>;

    return (
        <div className="checklist-page">
            <Drawer>
                <nav>
                    <NavLink to="/" end>
                        <button>
                            <ArrowLeft />
                        </button>
                    </NavLink>
                    <DrawerTrigger>
                        <img src={ExportSVG} alt="export" />
                    </DrawerTrigger>
                </nav>
                <div className="vsebina">
                    {Object.entries(data.categories).map(([categoryId, category]) => (
                        <div key={categoryId} className="category">
                            <button onClick={() => toggleCategory(categoryId)}>{category.title}</button>
                            {openCategories[categoryId] && (
                                <div className="subcategory-container">
                                    {Object.entries(category.subcategories).map(([subcategoryId, subcategory]) => (
                                        <div key={subcategoryId} className="subcategory">
                                            <h3>{subcategory.title}</h3>
                                            <div className="elements">
                                                {Object.entries(subcategory.elements).map(([elementId, element]) => (
                                                    <div key={elementId} className="element">
                                                        <label>
                                                            {element.title}
                                                            {element.type === "str" && element.option_type === "one" && (
                                                                <SingleSelectInput
                                                                    options={element.options || []}
                                                                    value={element.value as string || ""}
                                                                    onChange={(value) =>
                                                                        handleChange(categoryId, subcategoryId, elementId, value)
                                                                    }
                                                                />
                                                            )}
                                                            {element.type === "str" && element.option_type === "multiple" && (
                                                                <MultiSelectInput
                                                                    options={element.options || []}
                                                                    value={element.value as string[] || []}
                                                                    onChange={(values) =>
                                                                        handleChange(categoryId, subcategoryId, elementId, values)
                                                                    }
                                                                />
                                                            )}
                                                            {element.type === "bool" && (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={element.value as boolean || false}
                                                                    onChange={(e) =>
                                                                        handleChange(categoryId, subcategoryId, elementId, e.target.checked)
                                                                    }
                                                                />
                                                            )}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <DrawerContent className="drawer-content">
                    <div aria-hidden className="drawer-close" />
                    <DrawerHeader>
                        <DrawerTitle>Izvozi seznam</DrawerTitle>
                    </DrawerHeader>
                    <div className="export-page">
                        <DrawerDescription>
                            Izberi format datoteke, v katerem želiš izvoziti svoj seznam.
                        </DrawerDescription>
                        <div className="export-buttons">
                            <button>
                                Izvozi kot PDF <img src={Pdf} alt="pdf" />
                            </button>
                            <button>
                                Izvozi kot Excel <img src={Excel} alt="excel" />
                            </button>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}

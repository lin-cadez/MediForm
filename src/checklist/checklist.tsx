"use client";

import { useEffect, useState } from "react";
import { generatePdfFromJson } from "./pdfGenerator";
import { NavLink } from "react-router-dom";
import {
    ArrowLeft,
    ChevronRight,
    Download,
    FileText,
    CheckCircle2,
    Loader2,
    AlertCircle,
    X,
    Plus,
    Trash2,
    Cloud,
    CloudOff,
    RefreshCw,
    Upload,
    FileJson
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";

import { Alert, AlertDescription } from "@/components/ui/alert";
import SingleSelectInput from "./SingleSelectComponent";
import MultiSelectInput from "./MultiSelectInput";
import { motion, AnimatePresence } from "framer-motion";
import { getFormById } from "@/lib/firebase";
import { DatePicker } from "@/components/ui/date-picker";
import { 
    checkUserSession, 
    loadSavedSubmission, 
    scheduleAutoSave, 
    cancelAutoSave 
} from "@/lib/userAuth";
import React from "react";
import UserLogin from "@/components/UserLogin";

interface UserInfo {
    ime: string;
    priimek: string;
    razred: string;
    sola?: string;
    podrocje?: string;
}

interface JsonData {
    title: string;
    description: string;
    categories: Record<
        string,
        {
            title: string;
            description: string;
            subcategories: Record<
                string,
                {
                    title: string;
                    description: string | null;
                    elements: Record<
                        string,
                        {
                            title: string;
                            unit: string | null;
                            value: string | boolean | string[] | null;
                            hint: string | null;
                        }
                    >;
                }
            >;
        }
    >;
}

interface Element {
    title: string;
    unit: string | null;
    value: string | number | boolean | string[] | null;
    hint: string | null;
    type: string;
    options?: string[];
    option_type?: "one" | "multiple";
    defaultValue?: string | boolean | string[] | number | null;
    required?: boolean;
}

interface TableColumn {
    key: string;
    title: string;
    hint?: string;
}

interface TableRow {
    [key: string]: string | null;
}

interface TableElement {
    title: string;
    type: "table";
    columns: TableColumn[];
    rows: TableRow[];
}

interface Subcategory {
    title: string;
    description: string | null;
    elements: Record<string, Element | TableElement>;
}

interface Category {
    title: string;
    description: string;
    url: string;
    subcategories: Record<string, Subcategory>;
}

interface PatientData {
    datum_obravnave: string;
    starost: string;
    spol: string;
    pogovorni_jezik: string;
    razlog_obravnave: string;
    alergija: string;
    medicinsko_potrjena_alergija: string;
    sum_na_alergijo: string;
}

interface List {
    title: string;
    description: string;
    url: string;
    predmet?: string;
    patient_data?: PatientData;
    categories: Record<string, Category>;
}

interface ChecklistProps {
    userInfo: UserInfo;
}

// Helper function to sort object entries by numeric key (e.g., "1.2" before "2.1", "10" after "9")
const sortEntries = <T,>(entries: [string, T][]): [string, T][] => {
    return entries.sort(([a], [b]) => {
        const partsA = a.split('.').map(Number);
        const partsB = b.split('.').map(Number);
        for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
            const numA = partsA[i] ?? 0;
            const numB = partsB[i] ?? 0;
            if (numA !== numB) return numA - numB;
        }
        return 0;
    });
};

export default function Checklist({ userInfo }: ChecklistProps) {
    const [list, setList] = useState<List | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [openCategories, setOpenCategories] = useState<
        Record<string, boolean>
    >({});
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [missingFields, setMissingFields] = useState<string[]>([]);
    const [isPatientSectionOpen, setIsPatientSectionOpen] = useState(true);
    
    // User session and auto-save state
    const [authStatus, setAuthStatus] = useState<'guest' | 'email' | 'loading'>('loading');
    const [hasUserSession, setHasUserSession] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [importError, setImportError] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);


    // Handle patient data changes
    const handlePatientDataChange = (field: keyof PatientData, value: string) => {
        setList((prevList) => {
            if (!prevList || !prevList.patient_data) return prevList;
            const newList = {
                ...prevList,
                patient_data: {
                    ...prevList.patient_data,
                    [field]: value,
                },
            };
            updateLocalStorage(newList);
            return newList;
        });
    };

    const updateLocalStorage = (newList: List) => {
        const formId = getFormId();
        if (formId) {
            localStorage.setItem(`checklist_${formId}`, JSON.stringify(newList));
        }
    };

    const castToArray = (value: any): string[] => {
        return Array.isArray(value) ? value : [];
    };

    const fetchData = async () => {
        setIsLoading(true);
        const urlSegment = window.location.pathname.split("/form/")[1];
        
        // Decode URL segment in case it's encoded
        const decodedUrlSegment = decodeURIComponent(urlSegment);
        console.log("Fetching form with ID:", decodedUrlSegment);
        
        // First check localStorage for any saved progress
        const storedData = localStorage.getItem(`checklist_${decodedUrlSegment}`);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData) {
                Object.values(parsedData.categories).forEach((category) => {
                    Object.values((category as Category).subcategories).forEach(
                        (subcategory) => {
                            Object.entries(subcategory.elements).forEach(
                                ([, element]) => {
                                    // Skip table elements
                                    if ((element as TableElement).type === "table") return;
                                    const el = element as Element;
                                    if (el.option_type === "multiple") {
                                        el.value = castToArray(
                                            el.value
                                        );
                                    }
                                }
                            );
                        }
                    );
                });
                setList(parsedData);
                // Expand first category by default
                const categoryIds = Object.keys(parsedData.categories);
                if (categoryIds.length > 0) {
                    setOpenCategories({ [categoryIds[0]]: true });
                }
                setIsLoading(false);
                return;
            }
        }

        // If no saved progress, fetch from Firebase
        try {
            const formData = await getFormById(decodedUrlSegment) as List | null;
            console.log("Firebase response:", formData);
            if (formData) {
                Object.values(formData.categories || {}).forEach((category: any) => {
                    Object.values(category.subcategories || {}).forEach(
                        (subcategory: any) => {
                            Object.entries(subcategory.elements || {}).forEach(
                                ([, element]: [string, any]) => {
                                    if (element.option_type === "multiple") {
                                        element.value = castToArray(
                                            element.value
                                        );
                                    }
                                }
                            );
                        }
                    );
                });
                setList(formData);
                // Expand first category by default
                const categoryIds = Object.keys(formData.categories || {});
                if (categoryIds.length > 0) {
                    setOpenCategories({ [categoryIds[0]]: true });
                }
            } else {
                console.error("Form not found in Firebase. Looking for ID:", decodedUrlSegment);
            }
        } catch (error) {
            console.error("Error fetching form from Firebase:", error);
        }
        
        setIsLoading(false);
    };

    const handleInputChange = (
        categoryId: string,
        subcategoryId: string,
        elementId: string,
        value: any
    ) => {
        setFormData((prevData) => {
            const newFormData = {
                ...prevData,
                [categoryId]: {
                    ...prevData[categoryId],
                    [subcategoryId]: {
                        ...prevData[categoryId]?.[subcategoryId],
                        [elementId]: value,
                    },
                },
            };

            setList((prevList) => {
                if (!prevList) return null;
                const newList = {
                    ...prevList,
                    categories: {
                        ...prevList.categories,
                        [categoryId]: {
                            ...prevList.categories[categoryId],
                            subcategories: {
                                ...prevList.categories[categoryId]
                                    .subcategories,
                                [subcategoryId]: {
                                    ...prevList.categories[categoryId]
                                        .subcategories[subcategoryId],
                                    elements: {
                                        ...prevList.categories[categoryId]
                                            .subcategories[subcategoryId]
                                            .elements,
                                        [elementId]: {
                                            ...prevList.categories[categoryId]
                                                .subcategories[subcategoryId]
                                                .elements[elementId],
                                            value: value,
                                        },
                                    },
                                },
                            },
                        },
                    },
                };

                if (authStatus === 'guest') {
                    updateLocalStorage(newList);
                }
                return newList;
            });

            return newFormData;
        });
    };

    // Get form ID from URL
    const getFormId = () => {
        const path = window.location.pathname;
        const match = path.match(/form\/(.+)/);
        return match ? decodeURIComponent(match[1]) : "";
    };

    // Check user session on mount
    useEffect(() => {
        const status = localStorage.getItem("authStatus");
        if (status === 'guest') {
            setAuthStatus('guest');
            setIsCheckingSession(false);
        } else {
            setAuthStatus('email');
            const checkSession = async () => {
                setIsCheckingSession(true);
                try {
                    const result = await checkUserSession();
                    if (result.success && result.email) {
                        setHasUserSession(true);
                        setUserEmail(result.email);
                    } else {
                        setHasUserSession(false);
                        setUserEmail('');
                    }
                } catch (error) {
                    console.error("Error checking user session:", error);
                    setHasUserSession(false);
                    setUserEmail('');
                } finally {
                    setIsCheckingSession(false);
                }
            };
            checkSession();
        }
    }, []);

    // Load saved submission when session is verified
    useEffect(() => {
        const loadSaved = async () => {
            if (!hasUserSession) return;
            
            const formId = getFormId();
            if (!formId) return;

            try {
                const result = await loadSavedSubmission(formId);
                if (result.success && result.data && !result.data.isCompleted) {
                    // Apply saved data to the list
                    if (result.data.data && list) {
                        const savedFormData = result.data.data;
                        // Apply saved values to list elements
                        setList((prevList) => {
                            if (!prevList) return null;
                            const newList = { ...prevList };
                            
                            Object.entries(savedFormData).forEach(([catId, catData]: [string, any]) => {
                                if (newList.categories[catId]) {
                                    Object.entries(catData).forEach(([subId, subData]: [string, any]) => {
                                        if (newList.categories[catId].subcategories[subId]) {
                                            Object.entries(subData).forEach(([elemId, value]: [string, any]) => {
                                                const elem = newList.categories[catId].subcategories[subId].elements[elemId];
                                                if (elem) {
                                                    // Handle both regular elements and table elements
                                                    if ((elem as TableElement).type === "table") {
                                                        (elem as TableElement).rows = value;
                                                    } else {
                                                        (elem as Element).value = value;
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                            

                            return newList;
                        });
                        setFormData(savedFormData);
                        console.log("✅ Loaded saved submission from server");
                    }
                }
            } catch (error) {
                console.error("Error loading saved submission:", error);
            }
        };

        if (hasUserSession && list) {
            loadSaved();
        }
    }, [hasUserSession, list?.url]);

    // Auto-save when formData changes (with debounce)
    useEffect(() => {
        // Guest users are saved to localStorage on every change via `updateLocalStorage`
        if (authStatus !== 'email' || !hasUserSession || Object.keys(formData).length === 0) return;
        
        const formId = getFormId();
        if (!formId) return;

        // Schedule auto-save with 1 second delay
        scheduleAutoSave(
            formId,
            formData,
            1000, // 3 second debounce
            () => setAutoSaveStatus('saving'),
            (success) => {
                setAutoSaveStatus(success ? 'saved' : 'error');
                if (success) {
                    setLastSaved(new Date());
                }
                // Reset status after 1 seconds
                setTimeout(() => setAutoSaveStatus('idle'), 1000);
            }
        );

        // Cleanup - cancel pending auto-save on unmount
        return () => cancelAutoSave();
    }, [formData, hasUserSession, authStatus]);

    useEffect(() => {
        fetchData();
    }, []);

    const toggleCategory = (categoryId: string) => {
        setOpenCategories((prevState) => ({
            ...prevState,
            [categoryId]: !prevState[categoryId],
        }));
    };

    const handleExportJson = () => {
        if (!list) return;
        const jsonString = JSON.stringify(list, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${list.title.replace(/\s/g, '_')}_export.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const validateImportedData = (importedData: any, originalForm: List): boolean => {
        if (!importedData || typeof importedData !== 'object') return false;
        if (importedData.url !== originalForm.url) return false;

        for (const catId in originalForm.categories) {
            if (!importedData.categories?.[catId]) return false;
            for (const subId in originalForm.categories[catId].subcategories) {
                if (!importedData.categories[catId].subcategories?.[subId]) return false;
                for (const elemId in originalForm.categories[catId].subcategories[subId].elements) {
                    if (!importedData.categories[catId].subcategories[subId].elements?.[elemId]) return false;
                }
            }
        }
        return true;
    };

    const handleImportJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImportError(null);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("Failed to read file.");
                }
                const importedData = JSON.parse(text);

                // Fetch original form for validation
                const formId = getFormId();
                const originalForm = await getFormById(formId) as List | null;

                if (!originalForm) {
                    throw new Error("Could not load original form to validate against.");
                }

                // Validate
                if (!validateImportedData(importedData, originalForm)) {
                    throw new Error("JSON file does not match the structure of this form.");
                }

                // If valid, update the state
                setList(importedData);
                updateLocalStorage(importedData); // Save to local storage immediately
                
                // Also re-create the formData object for auto-saving if online
                const newFormData: Record<string, any> = {};
                Object.entries(importedData.categories).forEach(([catId, category]: [string, any]) => {
                    Object.entries(category.subcategories).forEach(([subId, subcategory]: [string, any]) => {
                        Object.entries(subcategory.elements).forEach(([elemId, element]: [string, any]) => {
                            if (element.value !== null && element.value !== undefined) {
                                if (!newFormData[catId]) newFormData[catId] = {};
                                if (!newFormData[catId][subId]) newFormData[catId][subId] = {};
                                newFormData[catId][subId][elemId] = element.value;
                            }
                        });
                    });
                });
                setFormData(newFormData);


            } catch (error: any) {
                setImportError(error.message || "Invalid JSON file.");
                console.error("Import error:", error);
            } finally {
                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        };
        reader.readAsText(file);
    };


    // Table row management functions
    const addTableRow = (categoryId: string, subcategoryId: string, elementId: string, columns: TableColumn[]) => {
        const newRow: TableRow = {};
        columns.forEach(col => {
            newRow[col.key] = null;
        });
        
        setList((prevList) => {
            if (!prevList) return prevList;
            const newList = JSON.parse(JSON.stringify(prevList));
            const element = newList.categories[categoryId]?.subcategories[subcategoryId]?.elements[elementId] as TableElement;
            if (element && element.type === "table") {
                if (!element.rows) element.rows = [];
                element.rows.push(newRow);
            }
            return newList;
        });

        // Also update formData
        setFormData((prev) => {
            const currentRows = prev[categoryId]?.[subcategoryId]?.[elementId] as TableRow[] || [];
            return {
                ...prev,
                [categoryId]: {
                    ...prev[categoryId],
                    [subcategoryId]: {
                        ...prev[categoryId]?.[subcategoryId],
                        [elementId]: [...currentRows, newRow]
                    }
                }
            };
        });
    }
    
    const removeTableRow = (categoryId: string, subcategoryId: string, elementId: string, rowIndex: number) => {
        setList((prevList) => {
            if (!prevList) return prevList;
            const newList = JSON.parse(JSON.stringify(prevList));
            const element = newList.categories[categoryId]?.subcategories[subcategoryId]?.elements[elementId] as TableElement;
            if (element && element.type === "table" && element.rows) {
                element.rows.splice(rowIndex, 1);
            }
            return newList;
        });

        setFormData((prev) => {
            const currentRows = [...(prev[categoryId]?.[subcategoryId]?.[elementId] as TableRow[] || [])];
            currentRows.splice(rowIndex, 1);
            return {
                ...prev,
                [categoryId]: {
                    ...prev[categoryId],
                    [subcategoryId]: {
                        ...prev[categoryId]?.[subcategoryId],
                        [elementId]: currentRows
                    }
                }
            };
        });
    };

    const updateTableCell = (
        categoryId: string, 
        subcategoryId: string, 
        elementId: string, 
        rowIndex: number, 
        columnKey: string, 
        value: string
    ) => {
        setList((prevList) => {
            if (!prevList) return prevList;
            const newList = JSON.parse(JSON.stringify(prevList));
            const element = newList.categories[categoryId]?.subcategories[subcategoryId]?.elements[elementId] as TableElement;
            if (element && element.type === "table" && element.rows && element.rows[rowIndex]) {
                element.rows[rowIndex][columnKey] = value;
            }
            return newList;
        });

        setFormData((prev) => {
            const currentRows = [...(prev[categoryId]?.[subcategoryId]?.[elementId] as TableRow[] || [])];
            if (currentRows[rowIndex]) {
                currentRows[rowIndex] = { ...currentRows[rowIndex], [columnKey]: value };
            }
            return {
                ...prev,
                [categoryId]: {
                    ...prev[categoryId],
                    [subcategoryId]: {
                        ...prev[categoryId]?.[subcategoryId],
                        [elementId]: currentRows
                    }
                }
            };
        });
    };

    const renderTableElement = (
        categoryId: string,
        subcategoryId: string,
        elementId: string,
        element: TableElement
    ) => {
        const rows = element.rows || [];
        
        return (
            <div className="space-y-4">
                {/* Table with horizontal scroll */}
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {element.columns.map((col) => (
                                    <th 
                                        key={col.key}
                                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                        style={{ minWidth: '120px' }}
                                    >
                                        {col.title}
                                    </th>
                                ))}
                                <th className="px-3 py-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rows.length === 0 ? (
                                <tr>
                                    <td 
                                        colSpan={element.columns.length + 1} 
                                        className="px-3 py-4 text-center text-sm text-gray-500"
                                    >
                                        Ni vnosov. Kliknite "Dodaj vrstico" za dodajanje.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-gray-50">
                                        {element.columns.map((col) => (
                                            <td key={col.key} className="px-2 py-1">
                                                <Input
                                                    type="text"
                                                    value={row[col.key] || ""}
                                                    onChange={(e) => updateTableCell(
                                                        categoryId,
                                                        subcategoryId,
                                                        elementId,
                                                        rowIndex,
                                                        col.key,
                                                        e.target.value
                                                    )}
                                                    placeholder={col.hint || ""}
                                                    className="text-sm h-8"
                                                />
                                            </td>
                                        ))}
                                        <td className="px-2 py-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeTableRow(categoryId, subcategoryId, elementId, rowIndex)}
                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Add row button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTableRow(categoryId, subcategoryId, elementId, element.columns)}
                    className="w-full border-dashed"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj vrstico
                </Button>
            </div>
        );
    };

    const renderElement = (
        categoryId: string,
        subcategoryId: string,
        elementId: string,
        element: Element
    ) => {
        // For date fields with defaultValue "danes", use today's date
        let defaultVal = element.value;
        if (element.type === "date" && element.defaultValue === "danes") {
            defaultVal = new Date().toLocaleDateString("sl-SI");
        }
        
        const commonValue =
            formData[categoryId]?.[subcategoryId]?.[elementId] ?? defaultVal;

        switch (element.type) {
            case "str":
                if (element.options && element.option_type === "one") {
                    return (
                        <SingleSelectInput
                            predefinedOptions={element.options}
                            value={commonValue ?? ""}
                            onChange={(value) =>
                                handleInputChange(
                                    categoryId,
                                    subcategoryId,
                                    elementId,
                                    value
                                )
                            }
                        />
                    );
                } else if (
                    element.options &&
                    element.option_type === "multiple"
                ) {
                    return (
                        <MultiSelectInput
                            predefinedOptions={element.options}
                            value={
                                Array.isArray(element.value)
                                    ? element.value
                                    : []
                            }
                            onChange={(value) =>
                                handleInputChange(
                                    categoryId,
                                    subcategoryId,
                                    elementId,
                                    value
                                )
                            }
                        />
                    );
                } else {
                    return (
                        <div className="space-y-2">
                            <Input
                                type="text"
                                value={commonValue ?? ""}
                                onChange={(e) =>
                                    handleInputChange(
                                        categoryId,
                                        subcategoryId,
                                        elementId,
                                        e.target.value
                                    )
                                }
                                placeholder={element.hint || "Enter value..."}
                                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    );
                }
            case "bool":
                return (
                    <div className="flex items-center space-x-3 py-2">
                        <Checkbox
                            checked={commonValue ?? false}
                            onCheckedChange={(checked) =>
                                handleInputChange(
                                    categoryId,
                                    subcategoryId,
                                    elementId,
                                    checked
                                )
                            }
                            className="h-5 w-5 transition-all duration-200"
                        />
                        <span className="text-sm text-muted-foreground">
                            {commonValue ? "Da" : "Ne"}
                        </span>
                    </div>
                );
            case "num":
                return (
                    <div className="space-y-2">
                        <Input
                            type="text"
                            inputMode="decimal"
                            value={commonValue ?? ""}
                            onChange={(e) => {
                                // Allow numbers, decimal point, comma, and minus sign
                                const val = e.target.value;
                                // Replace comma with dot for standardization
                                const normalized = val.replace(",", ".");
                                // Only allow valid number characters
                                if (val === "" || val === "-" || val === "." || val === "," || /^-?\d*[.,]?\d*$/.test(val)) {
                                    handleInputChange(
                                        categoryId,
                                        subcategoryId,
                                        elementId,
                                        normalized
                                    );
                                }
                            }}
                            placeholder={element.hint || "Vnesite številko..."}
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                );
            case "date":
                return (
                    <div className="space-y-2">
                        <DatePicker
                            value={commonValue as string | null}
                            onChange={(value) =>
                                handleInputChange(
                                    categoryId,
                                    subcategoryId,
                                    elementId,
                                    value
                                )
                            }
                            placeholder={element.hint || "Izberite datum..."}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    const validateRequiredFields = (): { isValid: boolean; missingFields: string[] } => {
        if (!list) return { isValid: false, missingFields: [] };
        
        const missing: string[] = [];
        
        Object.values(list.categories).forEach((category) => {
            Object.values(category.subcategories).forEach((subcategory) => {
                Object.values(subcategory.elements).forEach((element) => {
                    // Skip table elements in validation
                    if ((element as TableElement).type === "table") return;
                    const el = element as Element;
                    if (el.required) {
                        const hasValue = el.type === "bool" 
                            ? el.value === true
                            : Array.isArray(el.value) 
                                ? el.value.length > 0
                                : el.value !== null && el.value !== undefined && el.value !== "";
                        
                        if (!hasValue) {
                            missing.push(el.title);
                        }
                    }
                });
            });
        });
        
        return { isValid: missing.length === 0, missingFields: missing };
    };

    const exportPdf = async () => {
        // Validate required fields first
        const { isValid, missingFields: missing } = validateRequiredFields();
        
        if (!isValid) {
            setMissingFields(missing);
            setValidationError(`Izpolnite vsa obvezna polja (${missing.length})`);
            setIsExportOpen(false);
            setTimeout(() => setValidationError(null), 5000);
            return;
        }
        
        setIsExporting(true);
        setIsExportOpen(false);

        try {
            // Get user info from localStorage
            const storedUserInfo = localStorage.getItem("userInfo");
            const userInfoForPdf = storedUserInfo ? JSON.parse(storedUserInfo) : userInfo;
            
            const pdfBlob = await generatePdfFromJson(list as JsonData, userInfoForPdf);
            const link = document.createElement("a");
            link.href = URL.createObjectURL(pdfBlob);
            link.download = `${list?.title || "checklist"}_${userInfo.ime}_${
                userInfo.priimek
            }.pdf`;
            link.click();

            setShowSuccess(true);
            const urlSegment = window.location.pathname.split("/checklist/")[1];
            localStorage.removeItem(urlSegment);

            setTimeout(() => setShowSuccess(false), 4000);
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };

    // Helper function to calculate completion stats (unused but kept for future use)
    const _getCompletionStats = () => {
        if (!list) return { completed: 0, total: 0, percentage: 0 };

        let completed = 0;
        let total = 0;

        Object.values(list.categories).forEach((category) => {
            Object.values(category.subcategories).forEach((subcategory) => {
                Object.values(subcategory.elements).forEach((element) => {
                    // Skip table elements in completion stats
                    if ((element as TableElement).type === "table") return;
                    const el = element as Element;
                    total++;
                    // For boolean fields, any explicit value (true or false) counts as answered
                    if (el.type === "bool") {
                        if (el.value === true || el.value === false) {
                            completed++;
                        }
                    } else if (Array.isArray(el.value)) {
                        // For multi-select, count as completed if array has items
                        if (el.value.length > 0) {
                            completed++;
                        }
                    } else {
                        // For other types, check for non-null, non-empty values
                        if (
                            el.value !== null &&
                            el.value !== undefined &&
                            el.value !== ""
                        ) {
                            completed++;
                        }
                    }
                });
            });
        });

        return {
            completed,
            total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    };
    void _getCompletionStats; // Prevent unused warning

    // Check if a table has been modified from its default state
    const isTableModified = (tableElement: TableElement): boolean => {
        const rows = tableElement.rows || [];
        
        // No rows means empty/not modified
        if (rows.length === 0) return false;
        
        // More than one row means user added data
        if (rows.length > 1) return true;
        
        // Check if the single row has any real data (not just "/" or null/empty)
        const firstRow = rows[0];
        return Object.values(firstRow).some(value => {
            if (value === null || value === undefined || value === "") return false;
            if (value === "/") return false;
            return true;
        });
    };

    // Check if a subcategory is fully completed (all questions answered)
    const isSubcategoryComplete = (categoryId: string, subcategoryId: string): boolean => {
        if (!list) return false;
        
        const subcategory = list.categories[categoryId]?.subcategories[subcategoryId];
        if (!subcategory) return false;

        const elements = Object.values(subcategory.elements);
        if (elements.length === 0) return false;

        return elements.every((element) => {
            // For table elements, check if modified from default
            if ((element as TableElement).type === "table") {
                return isTableModified(element as TableElement);
            }
            
            const el = element as Element;
            
            // For boolean fields, any explicit value (true or false) counts as answered
            if (el.type === "bool") {
                return el.value === true || el.value === false;
            }
            
            // For multi-select, check if array has items
            if (Array.isArray(el.value)) {
                return el.value.length > 0;
            }
            
            // For other types, check for non-null, non-empty values
            return el.value !== null && el.value !== undefined && el.value !== "";
        });
    };

    // Check if entire category is fully completed (all subcategories complete)
    const isCategoryComplete = (categoryId: string): boolean => {
        if (!list) return false;
        
        const category = list.categories[categoryId];
        if (!category) return false;

        const subcategories = Object.keys(category.subcategories);
        if (subcategories.length === 0) return false;

        return subcategories.every(subcategoryId => 
            isSubcategoryComplete(categoryId, subcategoryId)
        );
    };

    // Show loading while checking session
    if (isCheckingSession) {
        return (
            <div className="min-h-screen bg-sky-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-ocean-teal" />
                    <p className="text-slate-600 font-medium">
                        Preverjanje dostopa...
                    </p>
                </div>
            </div>
        );
    }

    // Show login form if no user session
    if (!hasUserSession) {
        const formId = getFormId();
        return (
            <UserLogin 
                formId={formId} 
            />
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-sky-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-ocean-teal" />
                    <p className="text-slate-600 font-medium">
                        Nalaganje kontrolnega seznama...
                    </p>
                </div>
            </div>
        );
    }

    if (!list) {
        return (
            <div className="min-h-screen bg-sky-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <FileText className="h-12 w-12 mx-auto text-ocean-surf" />
                    <h2 className="text-xl font-semibold text-slate-900">Obrazec ni bil najden</h2>
                    <p className="text-slate-600">
                        Kontrolni seznam ni na voljo ali pa je bil izbrisan.
                    </p>
                    <NavLink to="/">
                        <Button className="mt-4 bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf">
                            Nazaj na domačo stran
                        </Button>
                    </NavLink>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-sky-50 overflow-x-hidden">
            {/* Fixed Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-ocean-frost shadow-sm">
                <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 max-w-4xl mx-auto">
                    <NavLink
                        to="/"
                        className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-slate-100 transition-colors duration-200 flex-shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </NavLink>

                    <div className="flex-1 text-center px-2 sm:px-4 min-w-0">
                        <h1
                            className="text-sm sm:text-lg font-semibold text-slate-900 truncate"
                            title={list!.title}
                        >
                            {list!.title}
                        </h1>
                        {userEmail && (
                            <div className="flex items-center justify-center gap-1.5">
                                <p className="text-[10px] sm:text-xs text-slate-500 truncate">{userEmail}</p>
                                {/* Auto-save status indicator */}
                                {hasUserSession && (
                                    <>
                                        {autoSaveStatus === 'saving' && (
                                            <RefreshCw className="h-3 w-3 text-ocean-teal animate-spin flex-shrink-0" />
                                        )}
                                        {autoSaveStatus === 'saved' && (
                                            <Cloud className="h-3 w-3 text-green-500 flex-shrink-0" />
                                        )}
                                        {autoSaveStatus === 'error' && (
                                            <CloudOff className="h-3 w-3 text-red-500 flex-shrink-0" />
                                        )}
                                        {autoSaveStatus === 'idle' && lastSaved && (
                                            <Cloud className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                        <Drawer
                            open={isExportOpen}
                            onOpenChange={setIsExportOpen}
                        >
                            <DrawerTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2 hover:bg-slate-50 transition-colors duration-200 bg-transparent"
                                    disabled={isExporting}
                                >
                                    {isExporting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                </Button>
                            </DrawerTrigger>

                            <DrawerContent className="max-w-md mx-auto">
                                <DrawerHeader className="text-center">
                                    <DrawerTitle className="flex items-center justify-center gap-2">
                                        <Download className="h-5 w-5" />
                                        Možnosti izvoza
                                    </DrawerTitle>
                                    <DrawerDescription>
                                        Izvozi svoje poročilo kot PDF
                                    </DrawerDescription>
                                </DrawerHeader>

                                <div className="p-6">
                                    <Button
                                        onClick={exportPdf}
                                        className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf"
                                        disabled={isExporting}
                                    >
                                        <FileText className="h-5 w-5" />
                                        Izvozi kot PDF
                                    </Button>
                                </div>

                                <div className="mt-4 border-t pt-4">
                                    <h3 className="text-center text-sm font-medium text-slate-700 mb-2">
                                        Ali pa
                                    </h3>
                                    <Button
                                        onClick={handleExportJson}
                                        variant="outline"
                                        className="w-full justify-start gap-3 h-12"
                                    >
                                        <FileJson className="h-5 w-5" />
                                        Izvozi kot JSON
                                    </Button>
                                </div>

                                <div className="mt-4 border-t pt-4">
                                    <h3 className="text-center text-sm font-medium text-slate-700 mb-2">
                                        Uvozi
                                    </h3>
                                    <Button
                                        onClick={handleImportClick}
                                        variant="outline"
                                        className="w-full justify-start gap-3 h-12"
                                    >
                                        <Upload className="h-5 w-5" />
                                        Uvozi iz JSON
                                    </Button>
                                    <input 
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImportJson}
                                        className="hidden"
                                        accept="application/json"
                                    />
                                    {importError && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{importError}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 mb-8">
                {/* Description */}
                {list!.description && (
                    <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm border border-ocean-light">
                        <CardContent className="p-4 sm:p-6">
                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                {list!.description}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Mobile Download Button */}
                <div className="md:hidden">
                    <Button
                        onClick={exportPdf}
                        className="w-full h-12 bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf shadow-md"
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                            <Download className="h-5 w-5 mr-2" />
                        )}
                        Izvozi kot PDF
                    </Button>
                </div>

                {/* Patient Data Section */}
                {list!.patient_data && (
                    <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border border-blue-200">
                        <CardHeader
                            className="cursor-pointer select-none hover:bg-blue-100/50 transition-colors duration-200 rounded-t-lg"
                            onClick={() => setIsPatientSectionOpen(!isPatientSectionOpen)}
                        >
                            <CardTitle className="flex items-center gap-3 text-slate-900">
                                <motion.div
                                    animate={{ rotate: isPatientSectionOpen ? 90 : 0 }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                    className="flex-shrink-0"
                                >
                                    <ChevronRight className="h-5 w-5 text-blue-600" />
                                </motion.div>
                                <span className="font-semibold text-blue-900">Podatki o pacientu</span>
                            </CardTitle>
                        </CardHeader>

                        <AnimatePresence>
                            {isPatientSectionOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    style={{ overflow: "visible" }}
                                >
                                    <CardContent className="pt-0 pb-4 sm:pb-6">
                                        <div className="bg-white/70 rounded-lg p-3 sm:p-5 space-y-4 border border-blue-100">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Datum obravnave */}
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">
                                                        Datum obravnave
                                                    </Label>
                                                    <Input
                                                        type="date"
                                                        value={list!.patient_data?.datum_obravnave || ""}
                                                        onChange={(e) => handlePatientDataChange("datum_obravnave", e.target.value)}
                                                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                                                    />
                                                </div>

                                                {/* Starost */}
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">
                                                        Starost pacienta
                                                    </Label>
                                                    <Input
                                                        type="text"
                                                        value={list!.patient_data?.starost || ""}
                                                        onChange={(e) => handlePatientDataChange("starost", e.target.value)}
                                                        placeholder="npr. 45 let"
                                                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                                                    />
                                                </div>

                                                {/* Spol */}
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">
                                                        Spol
                                                    </Label>
                                                    <SingleSelectInput
                                                        predefinedOptions={["moški", "ženski"]}
                                                        value={list!.patient_data?.spol || ""}
                                                        onChange={(value) => handlePatientDataChange("spol", value || "")}
                                                    />
                                                </div>

                                                {/* Pogovorni jezik */}
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">
                                                        Pogovorni jezik
                                                    </Label>
                                                    <Input
                                                        type="text"
                                                        value={list!.patient_data?.pogovorni_jezik || ""}
                                                        onChange={(e) => handlePatientDataChange("pogovorni_jezik", e.target.value)}
                                                        placeholder="npr. slovenščina"
                                                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                                                    />
                                                </div>

                                                {/* Razlog obravnave */}
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label className="text-sm font-medium text-slate-700">
                                                        Razlog obravnave / diagnoza
                                                    </Label>
                                                    <Input
                                                        type="text"
                                                        value={list!.patient_data?.razlog_obravnave || ""}
                                                        onChange={(e) => handlePatientDataChange("razlog_obravnave", e.target.value)}
                                                        placeholder="npr. pljučnica, diabetes tip 2..."
                                                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                                                    />
                                                </div>

                                                {/* Alergija */}
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">
                                                        Alergija
                                                    </Label>
                                                    <SingleSelectInput
                                                        predefinedOptions={["DA", "NE", "neznano"]}
                                                        value={list!.patient_data?.alergija || ""}
                                                        onChange={(value) => handlePatientDataChange("alergija", value || "")}
                                                    />
                                                </div>

                                                {/* Medicinsko potrjena alergija */}
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">
                                                        Medicinsko potrjena alergija
                                                    </Label>
                                                    <Input
                                                        type="text"
                                                        value={list!.patient_data?.medicinsko_potrjena_alergija || ""}
                                                        onChange={(e) => handlePatientDataChange("medicinsko_potrjena_alergija", e.target.value)}
                                                        placeholder="npr. penicilin, / če ni"
                                                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                                                    />
                                                </div>

                                                {/* Sum na alergijo */}
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label className="text-sm font-medium text-slate-700">
                                                        Sum na alergijo
                                                    </Label>
                                                    <Input
                                                        type="text"
                                                        value={list!.patient_data?.sum_na_alergijo || ""}
                                                        onChange={(e) => handlePatientDataChange("sum_na_alergijo", e.target.value)}
                                                        placeholder="npr. lateks, / če ni"
                                                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                )}

                {/* Categories */}
                <div className="space-y-4 overflow-hidden">
                    {sortEntries(Object.entries(list!.categories)).map(
                        ([categoryId, category]) => (
                            <Card
                                key={categoryId}
                                className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-lg hover:bg-white/90 transition-all duration-300 border border-ocean-frost overflow-hidden"
                            >
                                <CardHeader
                                    className="cursor-pointer select-none hover:bg-gradient-to-r hover:from-ocean-light/50 hover:to-ocean-frost/50 transition-colors duration-200 rounded-t-lg p-3 sm:p-6"
                                    onClick={() => toggleCategory(categoryId)}
                                >
                                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-slate-900">
                                        <motion.div
                                            animate={{
                                                rotate: openCategories[
                                                    categoryId
                                                ]
                                                    ? 90
                                                    : 0,
                                            }}
                                            transition={{
                                                duration: 0.2,
                                                ease: "easeInOut",
                                            }}
                                            className="flex-shrink-0"
                                        >
                                            <ChevronRight className="h-5 w-5 text-slate-500" />
                                        </motion.div>
                                        <span className="font-semibold flex-1 text-sm sm:text-base">
                                            {category.title}
                                        </span>
                                        {isCategoryComplete(categoryId) && (
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                        )}
                                    </CardTitle>
                                    {category.description && (
                                        <p className="text-xs sm:text-sm text-slate-500 ml-7 sm:ml-8 mt-1">
                                            {category.description}
                                        </p>
                                    )}
                                </CardHeader>

                                <AnimatePresence>
                                    {openCategories[categoryId] && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{
                                                height: "auto",
                                                opacity: 1,
                                            }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{
                                                duration: 0.3,
                                                ease: "easeInOut",
                                            }}
                                            style={{ overflow: "visible" }}
                                        >
                                            <CardContent className="pt-0 space-y-4 sm:space-y-6 pb-4 sm:pb-6 px-3 sm:px-6">
                                                {sortEntries(Object.entries(
                                                    category.subcategories
                                                )).map(
                                                    ([
                                                        subcategoryId,
                                                        subcategory,
                                                    ]) => (
                                                        <motion.div
                                                            key={subcategoryId}
                                                            initial={{
                                                                opacity: 0,
                                                                y: 10,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.3,
                                                                delay: 0.1,
                                                            }}
                                                            className="bg-gradient-to-r from-ocean-light/30 to-ocean-frost/30 rounded-lg p-3 sm:p-5 space-y-3 sm:space-y-4 border border-ocean-frost/50"
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2 text-sm sm:text-base">
                                                                        <span className="truncate">{subcategory.title}</span>
                                                                        {isSubcategoryComplete(categoryId, subcategoryId) && (
                                                                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                                        )}
                                                                    </h3>
                                                                    {subcategory.description && (
                                                                        <p className="text-sm text-slate-600">
                                                                            {subcategory.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                                {sortEntries(Object.entries(
                                                                    subcategory.elements
                                                                )).map(
                                                                    ([
                                                                        elementId,
                                                                        element,
                                                                    ]) => {
                                                                        // Check if this is a table element
                                                                        if ((element as TableElement).type === "table") {
                                                                            return (
                                                                                <div key={elementId} className="space-y-2">
                                                                                    {renderTableElement(
                                                                                        categoryId,
                                                                                        subcategoryId,
                                                                                        elementId,
                                                                                        element as TableElement
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        }

                                                                        const regularElement = element as Element;

                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    elementId
                                                                                }
                                                                                className="space-y-2"
                                                                            >
                                                                                <Label
                                                                                    htmlFor={
                                                                                        elementId
                                                                                    }
                                                                                    className="text-sm font-medium text-slate-700 flex items-center gap-2"
                                                                                >
                                                                                    {
                                                                                        regularElement.title
                                                                                    }
                                                                                    {regularElement.unit && (
                                                                                        <Badge
                                                                                            variant="outline"
                                                                                            className="text-xs"
                                                                                        >
                                                                                            {
                                                                                                regularElement.unit
                                                                                            }
                                                                                        </Badge>
                                                                                    )}
                                                                                </Label>
                                                                                {renderElement(
                                                                                    categoryId,
                                                                                    subcategoryId,
                                                                                    elementId,
                                                                                    regularElement
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )
                                                )}
                                            </CardContent>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        )
                    )}
                </div>
            </main>

            {/* Success Notification */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
                    >
                        <Alert className="bg-gradient-to-r from-ocean-light to-ocean-frost border-ocean-frost shadow-lg">
                            <CheckCircle2 className="h-4 w-4 text-ocean-teal" />
                            <AlertDescription className="text-ocean-teal font-medium">
                                Poročilo je bilo uspešno izvoženo!
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Validation Error Notification */}
            <AnimatePresence>
                {validationError && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
                    >
                        <Alert className="bg-red-50 border-red-200 shadow-lg">
                            <div className="flex items-start justify-between w-full">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                    <div>
                                        <AlertDescription className="text-red-700 font-medium">
                                            {validationError}
                                        </AlertDescription>
                                        {missingFields.length > 0 && missingFields.length <= 5 && (
                                            <ul className="text-red-600 text-sm mt-2 list-disc list-inside">
                                                {missingFields.map((field, index) => (
                                                    <li key={index}>{field}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setValidationError(null)}
                                    className="text-red-400 hover:text-red-600 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}

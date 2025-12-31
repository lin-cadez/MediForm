"use client";

import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
    ArrowLeft,
    Plus,
    FolderOpen,
    Save,
    Trash2,
    ChevronRight,
    ChevronDown,
    FileText,
    Loader2,
    X,
    GripVertical,
    Settings,
    Palette,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
// Select component imports removed - not currently used
import { motion, AnimatePresence } from "framer-motion";
import { getAllForms, saveForm, deleteForm } from "@/lib/firebase";
import { logout as firebaseLogout, checkSession } from "@/lib/firebaseAuth";
import AdminLogin from "./AdminLogin";
import MultiSelectInput from "@/checklist/MultiSelectInput";
import SingleSelectInput from "@/checklist/SingleSelectComponent";
import "./form_builder.css";

// Types
interface Element {
    title: string;
    unit: string | null;
    value: string | boolean | string[] | number | null;
    hint: string | null;
    type: "str" | "bool" | "num" | "date";
    options?: string[];
    option_type?: "one" | "multiple";
    required?: boolean;
    defaultValue?: string | boolean | string[] | number | null;
}

interface Subcategory {
    title: string;
    description: string | null;
    elements: Record<string, Element>;
}

interface Category {
    title: string;
    description: string;
    url: string;
    subcategories: Record<string, Subcategory>;
}

interface FormData {
    id?: string;
    title: string;
    description: string;
    url: string;
    headerColor?: string;
    categories: Record<string, Category>;
    createdAt?: number;
    updatedAt?: number;
}

// Empty form template
const createEmptyForm = (): FormData => ({
    title: "Nov obrazec",
    description: "",
    url: "",
    headerColor: "#0891b2", // Default ocean-teal
    categories: {},
});

const createEmptyCategory = (id: string): Category => ({
    title: "Nova kategorija",
    description: "",
    url: `kategorija-${id}`,
    subcategories: {},
});

const createEmptySubcategory = (): Subcategory => ({
    title: "Nova podkategorija",
    description: null,
    elements: {},
});

const createEmptyElement = (): Element => ({
    title: "Novo polje",
    unit: null,
    value: null,
    hint: null,
    type: "str",
    required: false,
    defaultValue: null,
});

export default function FormBuilder() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [existingForms, setExistingForms] = useState<FormData[]>([]);
    const [currentForm, setCurrentForm] = useState<FormData | null>(null);
    const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({});
    const [selectedElement, setSelectedElement] = useState<{
        categoryId: string;
        subcategoryId: string;
        elementId: string;
        element: Element;
    } | null>(null);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    // Check authentication on mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const session = await checkSession();
                if (session.success) {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                setIsAuthenticated(false);
            }
            setIsLoading(false);
        };

        checkAuthStatus();
    }, []);

    // Load existing forms
    useEffect(() => {
        if (isAuthenticated) {
            loadForms();
        }
    }, [isAuthenticated]);

    const loadForms = async () => {
        setIsLoading(true);
        const forms = await getAllForms();
        setExistingForms(forms as FormData[]);
        setIsLoading(false);
    };

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = async () => {
        await firebaseLogout();
        setIsAuthenticated(false);
        setCurrentForm(null);
        window.location.href = "/";
    };

    const handleNewForm = () => {
        setCurrentForm(createEmptyForm());
        setSelectedElement(null);
        setExpandedCategories({});
        setExpandedSubcategories({});
    };

    const handleOpenForm = (form: FormData) => {
        setCurrentForm(form);
        setIsOpenDialogOpen(false);
        setSelectedElement(null);
        
        // Expand all categories and subcategories
        const allCategoriesExpanded: Record<string, boolean> = {};
        const allSubcategoriesExpanded: Record<string, boolean> = {};
        Object.keys(form.categories).forEach(catId => {
            allCategoriesExpanded[catId] = true;
            Object.keys(form.categories[catId].subcategories).forEach(subId => {
                allSubcategoriesExpanded[`${catId}_${subId}`] = true;
            });
        });
        setExpandedCategories(allCategoriesExpanded);
        setExpandedSubcategories(allSubcategoriesExpanded);
    };

    const handleSaveForm = async () => {
        if (!currentForm) return;

        setIsSaving(true);
        
        // Use URL as the unique identifier
        let formId = currentForm.url || currentForm.id || `${currentForm.title.replace(/\s+/g, "_").toLowerCase()}`;
        
        // Check for duplicate URLs (only for new forms without existing id)
        if (!currentForm.id) {
            const existingWithSameUrl = existingForms.find(f => f.url === formId || f.id === formId);
            if (existingWithSameUrl) {
                // Add timestamp suffix to make it unique
                formId = `${formId}_${Date.now()}`;
                setSaveMessage("URL že obstaja, dodan je unikaten pripis.");
            }
        }
        
        const formData = {
            ...currentForm,
            id: currentForm.id || formId, // Keep existing ID if updating
            url: currentForm.id ? currentForm.url : formId, // Update URL only for new forms
            updatedAt: Date.now(),
            createdAt: currentForm.createdAt || Date.now(),
        };

        const result = await saveForm(formData.id, formData);
        if (result.success) {
            setCurrentForm(formData);
            setSaveMessage("Obrazec uspešno shranjen!");
            setTimeout(() => setSaveMessage(null), 3000);
            await loadForms();
        } else {
            setSaveMessage("Napaka pri shranjevanju!");
            setTimeout(() => setSaveMessage(null), 3000);
        }
        setIsSaving(false);
    };

    const handleDeleteForm = async (formId: string) => {
        if (confirm("Ali ste prepričani, da želite izbrisati ta obrazec?")) {
            await deleteForm(formId);
            await loadForms();
            if (currentForm?.id === formId) {
                setCurrentForm(null);
            }
        }
    };

    // Form structure manipulation
    const addCategory = () => {
        if (!currentForm) return;
        const newId = `cat_${Date.now()}`;
        setCurrentForm({
            ...currentForm,
            categories: {
                ...currentForm.categories,
                [newId]: createEmptyCategory(newId),
            },
        });
        setExpandedCategories((prev) => ({ ...prev, [newId]: true }));
    };

    const addSubcategory = (categoryId: string) => {
        if (!currentForm) return;
        const newId = `subcat_${Date.now()}`;
        setCurrentForm({
            ...currentForm,
            categories: {
                ...currentForm.categories,
                [categoryId]: {
                    ...currentForm.categories[categoryId],
                    subcategories: {
                        ...currentForm.categories[categoryId].subcategories,
                        [newId]: createEmptySubcategory(),
                    },
                },
            },
        });
        setExpandedSubcategories((prev) => ({ ...prev, [`${categoryId}_${newId}`]: true }));
    };

    const addElement = (categoryId: string, subcategoryId: string) => {
        if (!currentForm) return;
        const newId = `elem_${Date.now()}`;
        const newElement = createEmptyElement();
        setCurrentForm({
            ...currentForm,
            categories: {
                ...currentForm.categories,
                [categoryId]: {
                    ...currentForm.categories[categoryId],
                    subcategories: {
                        ...currentForm.categories[categoryId].subcategories,
                        [subcategoryId]: {
                            ...currentForm.categories[categoryId].subcategories[subcategoryId],
                            elements: {
                                ...currentForm.categories[categoryId].subcategories[subcategoryId]
                                    .elements,
                                [newId]: newElement,
                            },
                        },
                    },
                },
            },
        });
        setSelectedElement({
            categoryId,
            subcategoryId,
            elementId: newId,
            element: newElement,
        });
    };

    const deleteCategory = (categoryId: string) => {
        if (!currentForm) return;
        const { [categoryId]: _, ...rest } = currentForm.categories;
        setCurrentForm({ ...currentForm, categories: rest });
        if (selectedElement?.categoryId === categoryId) {
            setSelectedElement(null);
        }
    };

    const deleteSubcategory = (categoryId: string, subcategoryId: string) => {
        if (!currentForm) return;
        const { [subcategoryId]: _, ...rest } = currentForm.categories[categoryId].subcategories;
        setCurrentForm({
            ...currentForm,
            categories: {
                ...currentForm.categories,
                [categoryId]: {
                    ...currentForm.categories[categoryId],
                    subcategories: rest,
                },
            },
        });
        if (selectedElement?.subcategoryId === subcategoryId) {
            setSelectedElement(null);
        }
    };

    const deleteElement = (categoryId: string, subcategoryId: string, elementId: string) => {
        if (!currentForm) return;
        const { [elementId]: _, ...rest } =
            currentForm.categories[categoryId].subcategories[subcategoryId].elements;
        setCurrentForm({
            ...currentForm,
            categories: {
                ...currentForm.categories,
                [categoryId]: {
                    ...currentForm.categories[categoryId],
                    subcategories: {
                        ...currentForm.categories[categoryId].subcategories,
                        [subcategoryId]: {
                            ...currentForm.categories[categoryId].subcategories[subcategoryId],
                            elements: rest,
                        },
                    },
                },
            },
        });
        if (selectedElement?.elementId === elementId) {
            setSelectedElement(null);
        }
    };

    const updateCategory = (categoryId: string, updates: Partial<Category>) => {
        if (!currentForm) return;
        setCurrentForm({
            ...currentForm,
            categories: {
                ...currentForm.categories,
                [categoryId]: {
                    ...currentForm.categories[categoryId],
                    ...updates,
                },
            },
        });
    };

    const updateSubcategory = (
        categoryId: string,
        subcategoryId: string,
        updates: Partial<Subcategory>
    ) => {
        if (!currentForm) return;
        setCurrentForm({
            ...currentForm,
            categories: {
                ...currentForm.categories,
                [categoryId]: {
                    ...currentForm.categories[categoryId],
                    subcategories: {
                        ...currentForm.categories[categoryId].subcategories,
                        [subcategoryId]: {
                            ...currentForm.categories[categoryId].subcategories[subcategoryId],
                            ...updates,
                        },
                    },
                },
            },
        });
    };

    const updateElement = (
        categoryId: string,
        subcategoryId: string,
        elementId: string,
        updates: Partial<Element>
    ) => {
        if (!currentForm) return;
        const updatedElement = {
            ...currentForm.categories[categoryId].subcategories[subcategoryId].elements[elementId],
            ...updates,
        };
        setCurrentForm({
            ...currentForm,
            categories: {
                ...currentForm.categories,
                [categoryId]: {
                    ...currentForm.categories[categoryId],
                    subcategories: {
                        ...currentForm.categories[categoryId].subcategories,
                        [subcategoryId]: {
                            ...currentForm.categories[categoryId].subcategories[subcategoryId],
                            elements: {
                                ...currentForm.categories[categoryId].subcategories[subcategoryId]
                                    .elements,
                                [elementId]: updatedElement,
                            },
                        },
                    },
                },
            },
        });
        if (selectedElement?.elementId === elementId) {
            setSelectedElement({
                ...selectedElement,
                element: updatedElement,
            });
        }
    };

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));
    };

    const toggleSubcategory = (categoryId: string, subcategoryId: string) => {
        const key = `${categoryId}_${subcategoryId}`;
        setExpandedSubcategories((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    // Render element preview
    const renderElementPreview = (element: Element) => {
        switch (element.type) {
            case "str":
                if (element.options && element.option_type === "one") {
                    return (
                        <SingleSelectInput
                            predefinedOptions={element.options}
                            value={element.value as string}
                            onChange={() => {}}
                        />
                    );
                } else if (element.options && element.option_type === "multiple") {
                    return (
                        <MultiSelectInput
                            predefinedOptions={element.options}
                            value={Array.isArray(element.value) ? element.value : []}
                            onChange={() => {}}
                        />
                    );
                } else {
                    return (
                        <Input
                            type="text"
                            placeholder={element.hint || "Vnesite vrednost..."}
                            disabled
                            className="bg-gray-50"
                        />
                    );
                }
            case "num":
                return (
                    <Input
                        type="text"
                        inputMode="decimal"
                        placeholder={element.hint || "Vnesite številko..."}
                        disabled
                        className="bg-gray-50"
                    />
                );
            case "bool":
                return (
                    <div className="flex items-center space-x-3 py-2">
                        <Checkbox disabled className="h-5 w-5" />
                        <span className="text-sm text-muted-foreground">Da / Ne</span>
                    </div>
                );
            case "date":
                return (
                    <div className="flex items-center gap-2 py-2">
                        <Input
                            type="text"
                            value={new Date().toLocaleDateString("sl-SI")}
                            disabled
                            className="bg-gray-50 w-auto"
                        />
                        <span className="text-xs text-muted-foreground">(danes)</span>
                    </div>
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-sky-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-ocean-teal" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="min-h-screen bg-sky-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-ocean-frost shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 max-w-full mx-auto">
                    <div className="flex items-center gap-3">
                        {currentForm && (
                            <NavLink
                                to="/"
                                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors duration-200"
                            >
                                <ArrowLeft className="h-5 w-5 text-slate-600" />
                            </NavLink>
                        )}
                        <h1 className="text-lg font-semibold text-slate-900">
                            Urejevalnik obrazcev
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">

                       


                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNewForm}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Novo
                        </Button>

                        
                        <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <FolderOpen className="h-4 w-4" />
                                    Odpri
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                                <DialogHeader>
                                    <DialogTitle>Odpri obrazec</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-2 mt-4">
                                    {existingForms.length === 0 ? (
                                        <p className="text-center text-slate-500 py-8">
                                            Ni shranjenih obrazcev
                                        </p>
                                    ) : (
                                        existingForms.map((form) => (
                                            <div
                                                key={form.id}
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                                                onClick={() => handleOpenForm(form)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-ocean-teal" />
                                                    <div>
                                                        <p className="font-medium">{form.title}</p>
                                                        <p className="text-sm text-slate-500">
                                                            {form.description || "Brez opisa"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteForm(form.id!);
                                                    }}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>

                         <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            className="border-ocean-frost text-ocean-teal hover:bg-ocean-light"
                        >
                            Odjava (admin)
                        </Button>

                        {currentForm && (
                            <Button
                                size="sm"
                                onClick={handleSaveForm}
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                Shrani
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Save message */}
            <AnimatePresence>
                {saveMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg"
                    >
                        {saveMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            {currentForm ? (
                <div className="flex h-[calc(100vh-64px)]">
                    {/* Form Editor - Left 2/3 */}
                    <div className="flex-1 overflow-auto p-6">
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Form Header */}
                            <Card className="border-0 shadow-sm bg-white/80">
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label>Naslov obrazca</Label>
                                        <Input
                                            value={currentForm.title}
                                            onChange={(e) => {
                                                const newTitle = e.target.value;
                                                const newUrl = newTitle
                                                    .toLowerCase()
                                                    .normalize("NFD")
                                                    .replace(/[\u0300-\u036f]/g, "")
                                                    .replace(/[^a-z0-9\s-]/g, "")
                                                    .replace(/\s+/g, "-")
                                                    .replace(/-+/g, "-")
                                                    .trim();
                                                setCurrentForm({
                                                    ...currentForm,
                                                    title: newTitle,
                                                    url: newUrl,
                                                });
                                            }}
                                            placeholder="Vnesite naslov obrazca"
                                            className="text-lg font-semibold border-ocean-frost"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Opis</Label>
                                        <Input
                                            value={currentForm.description}
                                            onChange={(e) =>
                                                setCurrentForm({
                                                    ...currentForm,
                                                    description: e.target.value,
                                                })
                                            }
                                            placeholder="Vnesite opis obrazca"
                                            className="border-ocean-frost"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Palette className="h-4 w-4" />
                                            Barva glave
                                        </Label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={currentForm.headerColor || "#0891b2"}
                                                onChange={(e) =>
                                                    setCurrentForm({
                                                        ...currentForm,
                                                        headerColor: e.target.value,
                                                    })
                                                }
                                                className="w-12 h-10 rounded cursor-pointer border border-ocean-frost"
                                            />
                                            <Input
                                                value={currentForm.headerColor || "#0891b2"}
                                                onChange={(e) =>
                                                    setCurrentForm({
                                                        ...currentForm,
                                                        headerColor: e.target.value,
                                                    })
                                                }
                                                placeholder="#0891b2"
                                                className="border-ocean-frost w-32"
                                            />
                                            <div 
                                                className="flex-1 h-10 rounded-md"
                                                style={{ backgroundColor: currentForm.headerColor || "#0891b2" }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Categories */}
                            <div className="space-y-4">
                                {Object.entries(currentForm.categories).map(
                                    ([categoryId, category]) => (
                                        <Card
                                            key={categoryId}
                                            className="border-0 shadow-sm bg-white/80 overflow-hidden"
                                        >
                                            <CardHeader
                                                className="cursor-pointer select-none hover:opacity-90 transition-opacity"
                                                style={{ backgroundColor: currentForm.headerColor || "#0891b2" }}
                                                onClick={() => toggleCategory(categoryId)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="flex items-center gap-2 text-lg text-white">
                                                        {expandedCategories[categoryId] ? (
                                                            <ChevronDown className="h-5 w-5" />
                                                        ) : (
                                                            <ChevronRight className="h-5 w-5" />
                                                        )}
                                                        <Input
                                                            value={category.title}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) =>
                                                                updateCategory(categoryId, {
                                                                    title: e.target.value,
                                                                })
                                                            }
                                                            className="border-0 bg-transparent font-semibold text-white placeholder:text-white/70 focus:bg-white/20 focus:border-white/30"
                                                        />
                                                    </CardTitle>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteCategory(categoryId);
                                                        }}
                                                        className="text-white/80 hover:text-white hover:bg-white/20"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <Input
                                                    value={category.description}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) =>
                                                        updateCategory(categoryId, {
                                                            description: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Opis kategorije"
                                                    className="border-0 bg-transparent text-sm text-white/80 placeholder:text-white/50 focus:bg-white/20 focus:border-white/30 ml-7"
                                                />
                                            </CardHeader>

                                            <AnimatePresence>
                                                {expandedCategories[categoryId] && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <CardContent className="pt-0 pb-4 space-y-4">
                                                            {/* Subcategories */}
                                                            {Object.entries(
                                                                category.subcategories
                                                            ).map(
                                                                ([
                                                                    subcategoryId,
                                                                    subcategory,
                                                                ]) => (
                                                                    <div
                                                                        key={subcategoryId}
                                                                        className="ml-4 border-l-2 border-ocean-frost pl-4"
                                                                    >
                                                                        <div
                                                                            className="flex items-center justify-between cursor-pointer py-2"
                                                                            onClick={() =>
                                                                                toggleSubcategory(
                                                                                    categoryId,
                                                                                    subcategoryId
                                                                                )
                                                                            }
                                                                        >
                                                                            <div className="flex items-center gap-2 flex-1">
                                                                                {expandedSubcategories[
                                                                                    `${categoryId}_${subcategoryId}`
                                                                                ] ? (
                                                                                    <ChevronDown className="h-4 w-4" />
                                                                                ) : (
                                                                                    <ChevronRight className="h-4 w-4" />
                                                                                )}
                                                                                <Input
                                                                                    value={
                                                                                        subcategory.title
                                                                                    }
                                                                                    onClick={(e) =>
                                                                                        e.stopPropagation()
                                                                                    }
                                                                                    onChange={(e) =>
                                                                                        updateSubcategory(
                                                                                            categoryId,
                                                                                            subcategoryId,
                                                                                            {
                                                                                                title: e
                                                                                                    .target
                                                                                                    .value,
                                                                                            }
                                                                                        )
                                                                                    }
                                                                                    className="border-0 bg-transparent font-medium focus:bg-white focus:border-ocean-frost"
                                                                                />
                                                                            </div>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    deleteSubcategory(
                                                                                        categoryId,
                                                                                        subcategoryId
                                                                                    );
                                                                                }}
                                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>

                                                                        <AnimatePresence>
                                                                            {expandedSubcategories[
                                                                                `${categoryId}_${subcategoryId}`
                                                                            ] && (
                                                                                <motion.div
                                                                                    initial={{
                                                                                        height: 0,
                                                                                        opacity: 0,
                                                                                    }}
                                                                                    animate={{
                                                                                        height: "auto",
                                                                                        opacity: 1,
                                                                                    }}
                                                                                    exit={{
                                                                                        height: 0,
                                                                                        opacity: 0,
                                                                                    }}
                                                                                    className="overflow-hidden"
                                                                                >
                                                                                    <div className="space-y-3 py-2">
                                                                                        {/* Elements */}
                                                                                        {Object.entries(
                                                                                            subcategory.elements
                                                                                        ).map(
                                                                                            ([
                                                                                                elementId,
                                                                                                element,
                                                                                            ]) => (
                                                                                                <div
                                                                                                    key={
                                                                                                        elementId
                                                                                                    }
                                                                                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                                                                                        selectedElement?.elementId ===
                                                                                                        elementId
                                                                                                            ? "border-ocean-surf bg-ocean-light"
                                                                                                            : "border-slate-200 hover:border-ocean-surf"
                                                                                                    }`}
                                                                                                    onClick={() =>
                                                                                                        setSelectedElement(
                                                                                                            {
                                                                                                                categoryId,
                                                                                                                subcategoryId,
                                                                                                                elementId,
                                                                                                                element,
                                                                                                            }
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    <div className="flex items-center justify-between mb-2">
                                                                                                        <div className="flex items-center gap-2">
                                                                                                            <GripVertical className="h-4 w-4 text-slate-400" />
                                                                                                            <span className="font-medium text-sm">
                                                                                                                {
                                                                                                                    element.title
                                                                                                                }
                                                                                                            </span>
                                                                                                            {element.required && (
                                                                                                                <span className="text-red-500 text-xs">
                                                                                                                    *
                                                                                                                </span>
                                                                                                            )}
                                                                                                        </div>
                                                                                                        <div className="flex items-center gap-1">
                                                                                                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                                                                                {
                                                                                                                    element.type
                                                                                                                }
                                                                                                            </span>
                                                                                                            <Button
                                                                                                                variant="ghost"
                                                                                                                size="sm"
                                                                                                                onClick={(
                                                                                                                    e
                                                                                                                ) => {
                                                                                                                    e.stopPropagation();
                                                                                                                    deleteElement(
                                                                                                                        categoryId,
                                                                                                                        subcategoryId,
                                                                                                                        elementId
                                                                                                                    );
                                                                                                                }}
                                                                                                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                                                            >
                                                                                                                <X className="h-3 w-3" />
                                                                                                            </Button>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="pointer-events-none">
                                                                                                        {renderElementPreview(
                                                                                                            element
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            )
                                                                                        )}

                                                                                        <Button
                                                                                            variant="outline"
                                                                                            size="sm"
                                                                                            onClick={() =>
                                                                                                addElement(
                                                                                                    categoryId,
                                                                                                    subcategoryId
                                                                                                )
                                                                                            }
                                                                                            className="w-full border-dashed"
                                                                                        >
                                                                                            <Plus className="h-4 w-4 mr-2" />
                                                                                            Dodaj polje
                                                                                        </Button>
                                                                                    </div>
                                                                                </motion.div>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                )
                                                            )}

                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    addSubcategory(categoryId)
                                                                }
                                                                className="ml-4 border-dashed"
                                                            >
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Dodaj podkategorijo
                                                            </Button>
                                                        </CardContent>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </Card>
                                    )
                                )}

                                <Button
                                    variant="outline"
                                    onClick={addCategory}
                                    className="w-full border-dashed h-16"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Dodaj kategorijo
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Properties Panel - Right 1/3 */}
                    <div className="w-96 bg-white border-l border-slate-200 overflow-auto">
                        <div className="p-4 border-b border-slate-200">
                            <h2 className="font-semibold flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Lastnosti polja
                            </h2>
                        </div>

                        {selectedElement ? (
                            <div className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <Label>Naslov</Label>
                                    <Input
                                        value={selectedElement.element.title}
                                        onChange={(e) =>
                                            updateElement(
                                                selectedElement.categoryId,
                                                selectedElement.subcategoryId,
                                                selectedElement.elementId,
                                                { title: e.target.value }
                                            )
                                        }
                                        className="border-ocean-frost"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Tip polja</Label>
                                    <select
                                        value={
                                            selectedElement.element.type === "bool" 
                                                ? "bool" 
                                                : selectedElement.element.type === "num" 
                                                    ? "num" 
                                                    : selectedElement.element.type === "date"
                                                        ? "date"
                                                        : selectedElement.element.option_type === "one" 
                                                            ? "str_one" 
                                                            : selectedElement.element.option_type === "multiple" 
                                                                ? "str_multiple" 
                                                                : "str"
                                        }
                                        onChange={(e) => {
                                            const value = e.target.value as "str" | "str_one" | "str_multiple" | "num" | "bool" | "date";
                                            let updates: Partial<Element> = {};
                                            switch (value) {
                                                case "str":
                                                    updates = { type: "str", options: undefined, option_type: undefined };
                                                    break;
                                                case "str_one":
                                                    updates = { type: "str", option_type: "one", options: selectedElement.element.options || [] };
                                                    break;
                                                case "str_multiple":
                                                    updates = { type: "str", option_type: "multiple", options: selectedElement.element.options || [] };
                                                    break;
                                                case "num":
                                                    updates = { type: "num", options: undefined, option_type: undefined };
                                                    break;
                                                case "bool":
                                                    updates = { type: "bool", options: undefined, option_type: undefined, defaultValue: false };
                                                    break;
                                                case "date":
                                                    updates = { type: "date", options: undefined, option_type: undefined, unit: null, defaultValue: "danes" };
                                                    break;
                                            }
                                            updateElement(
                                                selectedElement.categoryId,
                                                selectedElement.subcategoryId,
                                                selectedElement.elementId,
                                                updates
                                            );
                                        }}
                                        className="flex h-9 w-full rounded-md border border-ocean-frost bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-surf/20 focus:border-ocean-surf"
                                    >
                                        <option value="str">Prosto besedilo</option>
                                        <option value="str_one">Besedilo z eno izbiro</option>
                                        <option value="str_multiple">Besedilo z več izbirami</option>
                                        <option value="num">Številka</option>
                                        <option value="bool">Da/Ne</option>
                                        <option value="date">Datum</option>
                                    </select>
                                </div>

                                {selectedElement.element.option_type && (
                                    <div className="space-y-2">
                                        <Label>Možnosti (vsaka v svoji vrstici)</Label>
                                        <textarea
                                            value={
                                                selectedElement.element.options?.join(
                                                    "\n"
                                                ) || ""
                                            }
                                            onChange={(e) =>
                                                updateElement(
                                                    selectedElement.categoryId,
                                                    selectedElement.subcategoryId,
                                                    selectedElement.elementId,
                                                    {
                                                        options: e.target.value.split("\n"),
                                                    }
                                                )
                                            }
                                            onBlur={(e) =>
                                                updateElement(
                                                    selectedElement.categoryId,
                                                    selectedElement.subcategoryId,
                                                    selectedElement.elementId,
                                                    {
                                                        options: e.target.value
                                                            .split("\n")
                                                            .filter((o) => o.trim()),
                                                    }
                                                )
                                            }
                                            className="w-full h-32 p-2 border border-ocean-frost rounded-md text-sm resize-none"
                                            placeholder="Možnost 1&#10;Možnost 2&#10;Možnost 3"
                                        />
                                    </div>
                                )}

                                {selectedElement.element.type !== "date" && (
                                    <div className="space-y-2">
                                        <Label>Enota</Label>
                                        <Input
                                            value={selectedElement.element.unit || ""}
                                            onChange={(e) =>
                                                updateElement(
                                                    selectedElement.categoryId,
                                                    selectedElement.subcategoryId,
                                                    selectedElement.elementId,
                                                    { unit: e.target.value || null }
                                                )
                                            }
                                            placeholder="npr. kg, cm, %"
                                            className="border-ocean-frost"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Namig (placeholder)</Label>
                                    <Input
                                        value={selectedElement.element.hint || ""}
                                        onChange={(e) =>
                                            updateElement(
                                                selectedElement.categoryId,
                                                selectedElement.subcategoryId,
                                                selectedElement.elementId,
                                                { hint: e.target.value || null }
                                            )
                                        }
                                        placeholder="Primer vrednosti"
                                        className="border-ocean-frost"
                                    />
                                </div>

                                {selectedElement.element.type !== "date" && (
                                    <div className="space-y-2">
                                        <Label>Privzeta vrednost</Label>
                                        {selectedElement.element.type === "bool" ? (
                                            <select
                                                value={selectedElement.element.defaultValue === true ? "da" : "ne"}
                                                onChange={(e) =>
                                                    updateElement(
                                                        selectedElement.categoryId,
                                                        selectedElement.subcategoryId,
                                                        selectedElement.elementId,
                                                        { defaultValue: e.target.value === "da" }
                                                    )
                                                }
                                                className="flex h-9 w-full rounded-md border border-ocean-frost bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-surf/20 focus:border-ocean-surf"
                                            >
                                                <option value="ne">Ne</option>
                                                <option value="da">Da</option>
                                            </select>
                                        ) : (
                                            <Input
                                                value={
                                                    (selectedElement.element.defaultValue as string) ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    updateElement(
                                                        selectedElement.categoryId,
                                                        selectedElement.subcategoryId,
                                                        selectedElement.elementId,
                                                        { defaultValue: e.target.value || null }
                                                    )
                                                }
                                                placeholder="Privzeta vrednost"
                                                className="border-ocean-frost"
                                            />
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-2 pt-2">
                                    <Checkbox
                                        checked={selectedElement.element.required || false}
                                        onCheckedChange={(checked) =>
                                            updateElement(
                                                selectedElement.categoryId,
                                                selectedElement.subcategoryId,
                                                selectedElement.elementId,
                                                { required: checked === true }
                                            )
                                        }
                                    />
                                    <Label className="cursor-pointer">Obvezno polje</Label>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-500">
                                <Settings className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                <p>Izberite polje za urejanje lastnosti</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="text-center space-y-4">
                        <FileText className="h-16 w-16 mx-auto text-ocean-surf" />
                        <h2 className="text-xl font-semibold text-slate-700">
                            Izberite ali ustvarite obrazec
                        </h2>
                        <p className="text-slate-500">
                            Kliknite "Novo" za nov obrazec ali "Odpri" za obstoječega
                        </p>
                        <div className="flex gap-3 justify-center pt-4">
                            <Button
                                variant="outline"
                                onClick={handleNewForm}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Nov obrazec
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsOpenDialogOpen(true)}
                                className="flex items-center gap-2"
                            >
                                <FolderOpen className="h-4 w-4" />
                                Odpri obstoječega
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

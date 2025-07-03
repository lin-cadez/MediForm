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

interface UserInfo {
    ime: string;
    priimek: string;
    razred: string;
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

interface List {
    title: string;
    description: string;
    url: string;
    categories: Record<string, Category>;
}

interface ChecklistProps {
    userInfo: UserInfo;
}

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

    const updateLocalStorage = (newList: List) => {
        const path = window.location.pathname;
        const urlSegment = path.split("/checklist/")[1];
        localStorage.setItem(urlSegment, JSON.stringify(newList));
    };

    const castToArray = (value: any): string[] => {
        return Array.isArray(value) ? value : [];
    };

    const fetchData = async () => {
        setIsLoading(true);
        const urlSegment = window.location.pathname.split("/checklist/")[1];
        const storedData = localStorage.getItem(urlSegment);

        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData) {
                Object.values(parsedData.categories).forEach((category) => {
                    Object.values((category as Category).subcategories).forEach(
                        (subcategory) => {
                            Object.entries(subcategory.elements).forEach(
                                ([, element]) => {
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
                setList(parsedData);
                setIsLoading(false);
                return;
            }
        }

        console.error("No data found in localStorage.");
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

                updateLocalStorage(newList);
                return newList;
            });

            return newFormData;
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleCategory = (categoryId: string) => {
        setOpenCategories((prevState) => ({
            ...prevState,
            [categoryId]: !prevState[categoryId],
        }));
    };

    const renderElement = (
        categoryId: string,
        subcategoryId: string,
        elementId: string,
        element: Element
    ) => {
        const commonValue =
            formData[categoryId]?.[subcategoryId]?.[elementId] ?? element.value;

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
            default:
                return null;
        }
    };

    const exportPdf = async () => {
        setIsExporting(true);
        setIsExportOpen(false);

        try {
            const pdfBlob = await generatePdfFromJson(list as JsonData);
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

    const getCompletionStats = () => {
        if (!list) return { completed: 0, total: 0, percentage: 0 };

        let completed = 0;
        let total = 0;

        Object.values(list.categories).forEach((category) => {
            Object.values(category.subcategories).forEach((subcategory) => {
                Object.values(subcategory.elements).forEach((element) => {
                    total++;
                    if (
                        element.value !== null &&
                        element.value !== "" &&
                        element.value !== false
                    ) {
                        completed++;
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-violet-600" />
                    <p className="text-slate-600 font-medium">
                        Loading checklist...
                    </p>
                </div>
            </div>
        );
    }

    if (!list) {
        window.location.href = "/";
    }

    const stats = getCompletionStats();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-indigo-100">
            {/* Fixed Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-violet-200 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
                    <NavLink
                        to="/"
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors duration-200"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </NavLink>

                    <div className="flex-1 text-center px-4">
                        <h1
                            className="text-lg font-semibold text-slate-900 truncate"
                            title={list!.title}
                        >
                            {list!.title}
                        </h1>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <div className="w-16 h-1.5 bg-violet-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-violet-600 transition-all duration-500"
                                    style={{ width: `${stats.percentage}%` }}
                                />
                            </div>
                            <span className="text-xs text-slate-500 font-medium">
                                {stats.percentage}%
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
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
                                        Export Options
                                    </DrawerTitle>
                                    <DrawerDescription>
                                        Export your completed checklist as PDF
                                    </DrawerDescription>
                                </DrawerHeader>

                                <div className="p-6">
                                    <Button
                                        onClick={exportPdf}
                                        className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
                                        disabled={isExporting}
                                    >
                                        <FileText className="h-5 w-5" />
                                        Izvozi kot PDF
                                    </Button>
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 mb-8">
                {/* Description */}
                {list!.description && (
                    <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm border border-violet-100">
                        <CardContent className="p-6">
                            <p className="text-slate-600 leading-relaxed">
                                {list!.description}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Categories */}
                <div className="space-y-4">
                    {Object.entries(list!.categories).map(
                        ([categoryId, category]) => (
                            <Card
                                key={categoryId}
                                className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-lg hover:bg-white/90 transition-all duration-300 border border-blue-100"
                            >
                                <CardHeader
                                    className="cursor-pointer select-none hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-violet-50/50 transition-colors duration-200 rounded-t-lg"
                                    onClick={() => toggleCategory(categoryId)}
                                >
                                    <CardTitle className="flex items-center gap-3 text-slate-900">
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
                                        <span className="font-semibold">
                                            {category.title}
                                        </span>
                                    </CardTitle>
                                    {category.description && (
                                        <p className="text-sm text-slate-500 ml-8 mt-1">
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
                                            className="overflow-hidden"
                                        >
                                            <CardContent className="pt-0 pb-6 space-y-6">
                                                {Object.entries(
                                                    category.subcategories
                                                ).map(
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
                                                            className="bg-gradient-to-r from-blue-50/30 to-violet-50/30 rounded-lg p-5 space-y-4 border border-blue-100/50"
                                                        >
                                                            <div>
                                                                <h3 className="font-semibold text-slate-900 mb-1">
                                                                    {
                                                                        subcategory.title
                                                                    }
                                                                </h3>
                                                                {subcategory.description && (
                                                                    <p className="text-sm text-slate-600">
                                                                        {
                                                                            subcategory.description
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="space-y-4">
                                                                {Object.entries(
                                                                    subcategory.elements
                                                                ).map(
                                                                    ([
                                                                        elementId,
                                                                        element,
                                                                    ]) => {
                                                                        const allElements =
                                                                            Object.values(
                                                                                list!
                                                                                    .categories
                                                                            )
                                                                                .flatMap(
                                                                                    (
                                                                                        cat
                                                                                    ) =>
                                                                                        Object.values(
                                                                                            cat.subcategories
                                                                                        )
                                                                                )
                                                                                .flatMap(
                                                                                    (
                                                                                        sub
                                                                                    ) =>
                                                                                        Object.entries(
                                                                                            sub.elements
                                                                                        )
                                                                                );

                                                                        const lastMultipleChoiceKey =
                                                                            allElements
                                                                                .reverse()
                                                                                .find(
                                                                                    ([
                                                                                        ,
                                                                                        el,
                                                                                    ]) =>
                                                                                        el.option_type ===
                                                                                        "multiple"
                                                                                )?.[0];

                                                                        const isLastMultipleChoice =
                                                                            element.option_type ===
                                                                                "multiple" &&
                                                                            elementId ===
                                                                                lastMultipleChoiceKey;

                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    elementId
                                                                                }
                                                                                className={`space-y-2 ${
                                                                                    isLastMultipleChoice
                                                                                        ? "mb-[150px]"
                                                                                        : ""
                                                                                }`}
                                                                            >
                                                                                <Label
                                                                                    htmlFor={
                                                                                        elementId
                                                                                    }
                                                                                    className="text-sm font-medium text-slate-700 flex items-center gap-2"
                                                                                >
                                                                                    {
                                                                                        element.title
                                                                                    }
                                                                                    {element.unit && (
                                                                                        <Badge
                                                                                            variant="outline"
                                                                                            className="text-xs"
                                                                                        >
                                                                                            {
                                                                                                element.unit
                                                                                            }
                                                                                        </Badge>
                                                                                    )}
                                                                                </Label>
                                                                                {renderElement(
                                                                                    categoryId,
                                                                                    subcategoryId,
                                                                                    elementId,
                                                                                    element
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
                        <Alert className="bg-gradient-to-r from-blue-50 to-violet-50 border-violet-200 shadow-lg">
                            <CheckCircle2 className="h-4 w-4 text-violet-600" />
                            <AlertDescription className="text-violet-800 font-medium">
                                Poročilo je bilo uspešno izvoženo!
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

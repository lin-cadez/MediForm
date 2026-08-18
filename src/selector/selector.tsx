"use client";

import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
    User,
    Loader2,
    AlertCircle,
    FileText,
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    FolderOpen,
    FileEdit,
    Clock,
    Upload,
    School,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { getAllForms, getFormById } from "@/lib/formsCache";
import PWAInstallButton from "@/components/PWAInstallButton";

import "./selector.css";

interface FormTemplate {
    id: string;
    title: string;
    description: string | null;
    schoolId: string;
    schoolName: string;
    schoolAddress?: string;
    professorName?: string;
    subject?: string;
}

interface UserDocument {
    id: string;
    templateId: string;
    templateTitle: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

// Helper to generate unique IDs
const generateId = () => `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Load user documents from localStorage
const loadUserDocuments = (): UserDocument[] => {
    try {
        const docs = localStorage.getItem("userDocuments");
        return docs ? JSON.parse(docs) : [];
    } catch {
        return [];
    }
};

// Save user documents to localStorage
const saveUserDocuments = (docs: UserDocument[]) => {
    localStorage.setItem("userDocuments", JSON.stringify(docs));
};

const LAST_TEMPLATE_KEY = "lastSelectedTemplateId";
const DEFAULT_SCHOOL = {
    id: "szslj",
    name: "Srednja zdravstvena šola Ljubljana",
    address: "Poljanska cesta 61, 1000 Ljubljana",
};

const isRecord = (value: unknown): value is Record<string, any> => {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
};

const sortedEntries = (value: Record<string, any>) => {
    return Object.entries(value).sort(([a], [b]) => a.localeCompare(b, "sl"));
};

const getElementSchema = (element: any) => {
    const base = {
        type: element?.type || null,
        title: element?.title || null,
        unit: element?.unit || null,
        optionType: element?.option_type || null,
        options: Array.isArray(element?.options) ? [...element.options].sort() : [],
    };

    if (element?.type === "table") {
        return {
            ...base,
            columns: Array.isArray(element?.columns)
                ? element.columns.map((column: any) => ({
                    key: column?.key || null,
                    title: column?.title || null,
                    hint: column?.hint || null,
                }))
                : [],
        };
    }

    return base;
};

const getFormSchemaSignature = (formData: any): string | null => {
    if (!isRecord(formData?.categories)) return null;

    const categories = sortedEntries(formData.categories).map(([categoryId, category]) => {
        const categoryRecord = isRecord(category) ? category : {};
        const subcategories = isRecord(categoryRecord.subcategories)
            ? sortedEntries(categoryRecord.subcategories).map(([subcategoryId, subcategory]) => {
                const subcategoryRecord = isRecord(subcategory) ? subcategory : {};
                const elements = isRecord(subcategoryRecord.elements)
                    ? sortedEntries(subcategoryRecord.elements).map(([elementId, element]) => ({
                        id: elementId,
                        schema: getElementSchema(element),
                    }))
                    : [];

                return {
                    id: subcategoryId,
                    title: subcategoryRecord.title || null,
                    elements,
                };
            })
            : [];

        return {
            id: categoryId,
            title: categoryRecord.title || null,
            subcategories,
        };
    });

    return JSON.stringify({ categories });
};

const findTemplateMatchingImportedSchema = async (
    importedData: any,
    templates: FormTemplate[]
): Promise<FormTemplate | null> => {
    const importedSignature = getFormSchemaSignature(importedData);
    if (!importedSignature) return null;

    for (const template of templates) {
        const templateData = await getFormById(template.id);
        const templateSignature = getFormSchemaSignature(templateData);

        if (templateSignature && templateSignature === importedSignature) {
            return template;
        }
    }

    return null;
};

export default function Selector() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<FormTemplate[]>([]);
    const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
    const [reloadTrigger, setReloadTrigger] = useState(0); // Trigger to force reload
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("");
    
    // New document dialog state
    const [showNewDocDialog, setShowNewDocDialog] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
        return localStorage.getItem(LAST_TEMPLATE_KEY) || "";
    });
    const [newDocName, setNewDocName] = useState("");
    const [duplicateNameError, setDuplicateNameError] = useState(false);
    
    // Delete confirmation dialog
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [docToDelete, setDocToDelete] = useState<UserDocument | null>(null);
    
    // Import JSON dialog
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [importDocName, setImportDocName] = useState("");
    const [importFileData, setImportFileData] = useState<any>(null);
    const [importError, setImportError] = useState<string | null>(null);
    const templateCarouselRef = useRef<HTMLDivElement | null>(null);

    // Load user name from localStorage
    useEffect(() => {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
            const parsed = JSON.parse(userInfo);
            setUserName(parsed.ime || "");
        }
    }, []);

    // Load user documents from localStorage
    useEffect(() => {
        const docs = loadUserDocuments();
        setUserDocuments(docs);
    }, [reloadTrigger]);

    // Reload documents when returning to this page
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                setReloadTrigger(prev => prev + 1);
            }
        };

        const handleFocus = () => {
            setReloadTrigger(prev => prev + 1);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    // Fetch templates on mount
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setIsLoading(true);
                
                console.log("Fetching templates from cached forms...");
                const fetchedForms = await getAllForms();

                const templateItems: FormTemplate[] = fetchedForms.map((form: any) => ({
                    id: form.id,
                    title: form.title || "Brez naslova",
                    description: form.description || null,
                    schoolId: form.schoolId || DEFAULT_SCHOOL.id,
                    schoolName: form.schoolName || DEFAULT_SCHOOL.name,
                    schoolAddress: form.schoolAddress || DEFAULT_SCHOOL.address,
                    professorName: form.professorName || form.teacherName || form.createdBy || undefined,
                    subject: form.subject || form.predmet || null,
                }));

                setTemplates(templateItems);
                setSelectedTemplateId(current => {
                    const remembered = current || localStorage.getItem(LAST_TEMPLATE_KEY) || "";
                    if (templateItems.some(template => template.id === remembered)) {
                        return remembered;
                    }
                    return templateItems[0]?.id || "";
                });
                console.log("Loaded templates from cache");
            } catch (err) {
                console.error("Error fetching templates:", err);
                setError("Napaka pri nalaganju predlog. Preverite internetno povezavo.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    const handleCreateDocument = (template: FormTemplate) => {
        setSelectedTemplate(template);
        setSelectedTemplateId(template.id);
        localStorage.setItem(LAST_TEMPLATE_KEY, template.id);
        setNewDocName("");
        setDuplicateNameError(false);
        setShowNewDocDialog(true);
    };

    const confirmCreateDocument = async () => {
        const templateToUse = templates.find(template => template.id === selectedTemplateId) || selectedTemplate;
        if (!templateToUse || !newDocName.trim()) return;
        
        // Check if document name already exists
        const nameExists = userDocuments.some(
            doc => doc.name.toLowerCase() === newDocName.trim().toLowerCase()
        );
        
        if (nameExists) {
            setDuplicateNameError(true);
            return;
        }
        
        const newDoc: UserDocument = {
            id: generateId(),
            templateId: templateToUse.id,
            templateTitle: templateToUse.title,
            name: newDocName.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        
        const updatedDocs = [...userDocuments, newDoc];
        setUserDocuments(updatedDocs);
        saveUserDocuments(updatedDocs);
        
        setShowNewDocDialog(false);
        setSelectedTemplate(templateToUse);
        setSelectedTemplateId(templateToUse.id);
        localStorage.setItem(LAST_TEMPLATE_KEY, templateToUse.id);
        setNewDocName("");
        setDuplicateNameError(false);
        
        // Navigate to the new document
        navigate(`/obrazec/${templateToUse.id}?doc=${newDoc.id}`);
    };

    const handleDeleteDocument = (doc: UserDocument, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDocToDelete(doc);
        setShowDeleteDialog(true);
    };

    const confirmDeleteDocument = () => {
        if (!docToDelete) return;
        
        const updatedDocs = userDocuments.filter(d => d.id !== docToDelete.id);
        setUserDocuments(updatedDocs);
        saveUserDocuments(updatedDocs);
        
        // Also remove the document data from localStorage
        localStorage.removeItem(`doc_${docToDelete.id}`);
        
        setShowDeleteDialog(false);
        setDocToDelete(null);
    };

    const handleImportJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    setImportError("Napaka pri branju datoteke.");
                    setShowImportDialog(true);
                    return;
                }
                const importedData = JSON.parse(text);

                // Validate basic structure
                if (!importedData.categories) {
                    setImportError("Neveljavna JSON struktura. Datoteka ne vsebuje podatkov obrazca.");
                    setShowImportDialog(true);
                    return;
                }

                const matchingTemplate = await findTemplateMatchingImportedSchema(importedData, templates);
                if (!matchingTemplate) {
                    setImportError("Uvoženi JSON se ne ujema z nobeno znano šolsko predlogo. Uvoz je dovoljen samo za vnaprej pripravljene sheme.");
                    setShowImportDialog(true);
                    return;
                }

                // Store data and show dialog for name input
                setImportFileData({ data: importedData, template: matchingTemplate });
                setSelectedTemplateId(matchingTemplate.id);
                localStorage.setItem(LAST_TEMPLATE_KEY, matchingTemplate.id);
                setImportDocName("");
                setImportError(null);
                setShowImportDialog(true);

            } catch (error: any) {
                console.error("Import error:", error);
                setImportError("Napaka pri uvozu: " + (error.message || "Neveljavna JSON datoteka."));
                setShowImportDialog(true);
            } finally {
                // Reset file input
                event.target.value = '';
            }
        };

        reader.readAsText(file);
    };

    const confirmImport = async () => {
        if (!importFileData || !importDocName.trim()) {
            setImportError("Ime dokumenta je obvezno.");
            return;
        }

        // Check if name already exists
        const nameExists = userDocuments.some(
            doc => doc.name.toLowerCase() === importDocName.trim().toLowerCase()
        );
        
        if (nameExists) {
            setImportError("Dokument s tem imenom že obstaja. Prosim izberite drugo ime.");
            return;
        }

        // Create new document
        const newDoc: UserDocument = {
            id: generateId(),
            templateId: importFileData.template.id,
            templateTitle: importFileData.template.title,
            name: importDocName.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Save document data to localStorage
        localStorage.setItem(`doc_${newDoc.id}`, JSON.stringify(importFileData.data));

        // Add to documents list
        const updatedDocs = [...userDocuments, newDoc];
        setUserDocuments(updatedDocs);
        saveUserDocuments(updatedDocs);

        // Close dialog and reset
        setShowImportDialog(false);
        setImportFileData(null);
        setImportDocName("");
        setImportError(null);

        // Navigate to the imported document
        navigate(`/obrazec/${importFileData.template.id}?doc=${newDoc.id}`);
    };

    const openDocument = (doc: UserDocument) => {
        navigate(`/obrazec/${doc.templateId}?doc=${doc.id}`);
    };

    const retryFetch = () => {
        setError(null);
        setIsLoading(true);
        window.location.reload();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('sl-SI', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const orderedTemplates = [...templates].sort((a, b) => {
        const aIsMediForm = a.professorName?.trim().toLowerCase() === "mediform";
        const bIsMediForm = b.professorName?.trim().toLowerCase() === "mediform";

        if (aIsMediForm === bIsMediForm) return 0;
        return aIsMediForm ? 1 : -1;
    });
    const useTemplateCarousel = templates.length > 3;

    useEffect(() => {
        templateCarouselRef.current?.scrollTo({ left: 0 });
    }, [orderedTemplates.length]);

    const scrollTemplateCarousel = (direction: "left" | "right") => {
        const carousel = templateCarouselRef.current;
        if (!carousel) return;

        carousel.scrollBy({
            left: direction === "left" ? -320 : 320,
            behavior: "smooth",
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-sky-50">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-ocean-teal" />
                        <p className="text-slate-600 font-medium">
                            Nalaganje...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-sky-50">
                <div className="flex items-center justify-center min-h-screen p-4">
                    <Alert className="max-w-md">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="mb-4">
                            {error}
                        </AlertDescription>
                        <Button
                            onClick={retryFetch}
                            className="w-full bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf"
                        >
                            Poskusi znova
                        </Button>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="header">
                <div className="header-content">
                    <NavLink to="/" className="flex items-center space-x-3">
                        <div className="logo">
                             <img
                                src="/logo_only.png"
                                alt="MediForm logo"
                                className="w-full max-h-16 object-contain block"
                            />
                        </div>
                        <span className="font-semibold text-slate-900 hidden sm:block">
                            MediForm
                        </span>
                    </NavLink>
                    <div className="flex items-center gap-2">
                        <PWAInstallButton compact />
                        <NavLink to="/profil">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 hover:bg-slate-50 transition-colors duration-200 bg-transparent"
                            >
                                <User className="h-4 w-4" />
                                <span className="user-name-responsive">
                                    {userName || "Profil"}
                                </span>
                            </Button>
                        </NavLink>
                    </div>
                </div>
            </header>
            
            <main className="main">
                {/* Templates Carousel Section */}
                <div className="section-heading">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-ocean-teal" />
                                <h2 className="text-xl font-bold text-slate-900">
                                    Predloge obrazcev
                                </h2>
                            </div>
                            <Button
                                onClick={() => document.getElementById('importJsonInput')?.click()}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 border-slate-300 bg-white text-slate-700 hover:border-cyan-700 hover:bg-cyan-50 hover:text-cyan-900"
                            >
                                <Upload className="h-4 w-4" />
                                <span>Uvozi JSON</span>
                            </Button>
                            <input
                                id="importJsonInput"
                                type="file"
                                accept="application/json"
                                className="hidden"
                                onChange={handleImportJson}
                            />
                        </div>
                   
                    </motion.div>
                </div>

                {/* Template Selection */}
                {templates.length > 0 ? (
                    <div className={useTemplateCarousel ? "template-carousel-shell mb-12" : "mb-12"}>
                        {useTemplateCarousel && (
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="template-carousel-arrow template-carousel-arrow-left"
                                onClick={() => scrollTemplateCarousel("left")}
                                aria-label="Pomakni predloge levo"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <div
                            ref={useTemplateCarousel ? templateCarouselRef : undefined}
                            className={
                                useTemplateCarousel
                                    ? "template-carousel flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
                                    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                            }
                        >
                            {orderedTemplates.map((template, index) => (
                                <motion.div
                                    key={template.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.04 }}
                                    className={useTemplateCarousel ? "template-card-wrap w-[17rem] sm:w-[18rem] flex-none snap-start" : "template-card-wrap"}
                                >
                                    <Card
                                        className="template-card border border-slate-200 bg-white shadow-sm transition-shadow hover:border-cyan-300 hover:shadow-lg"
                                    >
                                        <CardHeader className="pb-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-cyan-200 bg-cyan-50">
                                                    <FileText className="h-5 w-5 text-cyan-700" />
                                                </div>
                                                <CardTitle className="text-lg font-bold leading-snug text-slate-900">
                                                    {template.title}
                                                </CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="template-card-content space-y-4">
                                            <div className="template-card-meta space-y-3 text-sm leading-relaxed text-slate-700">
                                                <div className="flex items-start gap-3">
                                                    <School className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                                                    <span className="template-school-name">{template.schoolName}</span>
                                                </div>
                                                {template.professorName && (
                                                    <div className="flex items-start gap-3">
                                                        <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                                                        <span>{template.professorName}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="border-t border-slate-200 pt-4">
                                                <Button
                                                    onClick={() => handleCreateDocument(template)}
                                                    variant="outline"
                                                    className="w-full border-cyan-700 bg-white text-cyan-800 hover:bg-cyan-50 hover:text-cyan-900"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Uporabi
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                        {useTemplateCarousel && (
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="template-carousel-arrow template-carousel-arrow-right"
                                onClick={() => scrollTemplateCarousel("right")}
                                aria-label="Pomakni predloge desno"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ) : !isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 empty-lists"
                    >
                        <div className="empty-icon">
                            <FileText className="h-8 w-8 text-ocean-teal" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Ni razpoložljivih predlog
                        </h3>
                        <p className="text-slate-600">
                            Preverite znova pozneje.
                        </p>
                    </motion.div>
                )}

                {/* User Documents Section */}
                {userDocuments.length > 0 && (
                    <div className="mb-8">
                        <div className="section-heading">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <FolderOpen className="h-5 w-5 text-ocean-teal" />
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Moji dokumenti
                                    </h2>
                                </div>
              
                            </motion.div>
                        </div>
                        <div className="list-spacing">
                            <AnimatePresence>
                                {userDocuments.map((doc, index) => (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: 0.2 + index * 0.05,
                                        }}
                                    >
                                        <Card 
                                            className="list-card cursor-pointer hover:shadow-md transition-shadow"
                                            onClick={() => openDocument(doc)}
                                        >
                                            <CardHeader className="pb-2">
                                                <CardTitle className="card-title">
                                                    <div className="flex items-center gap-3">
                                                        <div className="title-icon bg-ocean-light">
                                                            <FileEdit className="h-4 w-4 text-ocean-teal" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-slate-900">
                                                                {doc.name}
                                                            </span>
                                                            <span className="text-xs text-slate-500">
                                                                {doc.templateTitle}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => handleDeleteDocument(doc, e)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                        <ChevronRight className="chevron" />
                                                    </div>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Zadnja sprememba: {formatDate(doc.updatedAt)}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </main>

            {/* New Document Dialog */}
            <Dialog open={showNewDocDialog} onOpenChange={setShowNewDocDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nov dokument</DialogTitle>
                        <DialogDescription>
                            Ustvarite nov dokument iz predloge "{selectedTemplate?.title}"
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="docName">Ime dokumenta</Label>
                        <Input
                            id="docName"
                            value={newDocName}
                            onChange={(e) => {
                                setNewDocName(e.target.value);
                                setDuplicateNameError(false);
                            }}
                            placeholder="npr. Pacient UKC 01"
                            className={`mt-2 ${duplicateNameError ? 'border-red-500' : ''}`}
                            autoFocus
                        />
                        {duplicateNameError && (
                            <p className="text-sm text-red-500 mt-2">
                                Dokument s tem imenom že obstaja. Izberite drugo ime.
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewDocDialog(false)}>
                            Prekliči
                        </Button>
                        <Button 
                            onClick={confirmCreateDocument}
                            disabled={!newDocName.trim() || !selectedTemplateId}
                            className="bg-cyan-700 text-white hover:bg-cyan-800"
                        >
                            Ustvari
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Izbriši dokument</DialogTitle>
                        <DialogDescription>
                            Ali ste prepričani, da želite izbrisati dokument "{docToDelete?.name}"?
                            Ta dejanje je trajno.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Prekliči
                        </Button>
                        <Button 
                            onClick={confirmDeleteDocument}
                            variant="destructive"
                        >
                            Izbriši
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import JSON Dialog */}
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Uvozi dokument</DialogTitle>
                        <DialogDescription>
                            {importError ? "Napaka pri uvozu" : "Vnesite ime za uvoženi dokument"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {importError ? (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{importError}</AlertDescription>
                            </Alert>
                        ) : (
                            <>
                                <Label htmlFor="importDocName">Ime dokumenta</Label>
                                <Input
                                    id="importDocName"
                                    value={importDocName}
                                    onChange={(e) => {
                                        setImportDocName(e.target.value);
                                        setImportError(null);
                                    }}
                                    placeholder="npr. Pacient UKC 01"
                                    className="mt-2"
                                    autoFocus
                                />
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setShowImportDialog(false);
                                setImportFileData(null);
                                setImportDocName("");
                                setImportError(null);
                            }}
                        >
                            {importError ? "Zapri" : "Prekliči"}
                        </Button>
                        {!importError && (
                            <Button 
                                onClick={confirmImport}
                                disabled={!importDocName.trim()}
                                className="bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf"
                            >
                                Uvozi
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

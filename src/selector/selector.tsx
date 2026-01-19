"use client";

import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    User,
    Loader2,
    AlertCircle,
    FileText,
    ChevronRight,
    Plus,
    Trash2,
    FolderOpen,
    FileEdit,
    Clock,
    Upload,
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
import { getAllForms } from "@/lib/firebase";
import { checkUserSession, loadAllUserSubmissions, autoSaveForm } from "@/lib/userAuth";

import "./selector.css";

interface FormTemplate {
    id: string;
    title: string;
    description: string | null;
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

export default function Selector() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<FormTemplate[]>([]);
    const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
    const [reloadTrigger, setReloadTrigger] = useState(0); // Trigger to force reload
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("");
    const [hasUserSession, setHasUserSession] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [authStatus, setAuthStatus] = useState<string | null>(null);
    
    // New document dialog state
    const [showNewDocDialog, setShowNewDocDialog] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
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

    // Check user session on mount
    useEffect(() => {
        const checkSession = async () => {
            setIsCheckingSession(true);
            
            // Check if user is a guest/anonymous first
            const status = localStorage.getItem("authStatus");
            setAuthStatus(status);
            
            if (status === "guest" || status === "anonymous") {
                setHasUserSession(true);
                setIsCheckingSession(false);
                return;
            }
            
            // If no authStatus, don't even try to check server - just fail fast
            if (!status) {
                console.log("No authStatus found, skipping session check");
                setHasUserSession(false);
                setIsCheckingSession(false);
                return;
            }
            
            // Only check server session if we have an authStatus
            try {
                const result = await checkUserSession();
                if (result.success && result.email) {
                    setHasUserSession(true);
                } else {
                    setHasUserSession(false);
                }
            } catch (error: any) {
                console.error("Error checking user session:", error);
                
                // If 429 error, disable online mode and force offline
                if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
                    console.log("429 error detected - forcing offline mode");
                    // Clear online auth status and redirect to login
                    localStorage.removeItem("authStatus");
                    localStorage.removeItem("mediform_session_token");
                    localStorage.removeItem("emailForSignIn");
                    // Set flag to disable online mode
                    localStorage.setItem("online_disabled", "true");
                    setHasUserSession(false);
                } else {
                    // On other errors, treat as no session
                    setHasUserSession(false);
                }
            } finally {
                setIsCheckingSession(false);
            }
        };

        checkSession();
    }, []);

    useEffect(() => {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
            const parsed = JSON.parse(userInfo);
            setUserName(parsed.ime || "");
        }
    }, []);

    // Load user documents - from backend for email users, from localStorage for anonymous
    useEffect(() => {
        const loadDocuments = async () => {
            const status = localStorage.getItem("authStatus");
            console.log("📚 Loading documents - authStatus:", status);
            
            if (status === "email") {
                // Try to load from backend first
                console.log("🌐 Attempting to load from backend...");
                try {
                    const result = await loadAllUserSubmissions();
                    console.log("📥 Backend response:", result);
                    console.log("📥 Backend response success:", result.success);
                    console.log("📥 Backend response documents:", result.documents);
                    console.log("📥 Backend response documents length:", result.documents?.length);
                    
                    if (result.success && result.documents) {
                        if (result.documents.length === 0) {
                            console.log("ℹ️ Backend returned 0 documents");
                            setUserDocuments([]);
                            return;
                        }
                        
                        // Convert backend documents to our format and sync with localStorage
                        const backendDocs: UserDocument[] = result.documents.map(doc => ({
                            id: doc.documentId || doc.id,
                            templateId: doc.templateId,
                            templateTitle: doc.templateTitle,
                            name: doc.name,
                            createdAt: doc.createdAt,
                            updatedAt: doc.updatedAt,
                        }))
                        // Sort by updatedAt descending (most recent first)
                        .sort((a, b) => {
                            const timeA = typeof a.updatedAt === 'number' ? a.updatedAt : new Date(a.updatedAt).getTime();
                            const timeB = typeof b.updatedAt === 'number' ? b.updatedAt : new Date(b.updatedAt).getTime();
                            return timeB - timeA;
                        });
                        
                        console.log("📄 Converted & sorted documents:", backendDocs);
                        
                        // Merge with local documents (keep local ones that aren't on backend yet)
                        const localDocs = loadUserDocuments();
                        console.log("💾 Local documents:", localDocs);
                        
                        const backendDocIds = new Set(backendDocs.map(d => d.id));
                        const mergedDocs = [
                            ...backendDocs,
                            ...localDocs.filter(d => !backendDocIds.has(d.id))
                        ];
                        
                        console.log("🔀 Merged documents:", mergedDocs);
                        
                        setUserDocuments(mergedDocs);
                        saveUserDocuments(mergedDocs);
                        
                        // Also store the form data from backend to localStorage
                        result.documents.forEach(doc => {
                            const docId = doc.documentId || doc.id;
                            if (doc.data) {
                                localStorage.setItem(`doc_${docId}`, JSON.stringify(doc.data));
                                console.log("💾 Stored data for document:", docId);
                            }
                        });
                        
                        console.log("✅ Loaded", backendDocs.length, "documents from backend");
                        return;
                    } else {
                        console.log("ℹ️ No documents from backend or request failed");
                    }
                } catch (error) {
                    console.error("❌ Error loading from backend, falling back to localStorage:", error);
                }
            }
            
            // Fall back to localStorage (for anonymous users or if backend fails)
            console.log("💾 Loading from localStorage");
            const localDocs = loadUserDocuments();
            console.log("💾 Found", localDocs.length, "local documents");
            setUserDocuments(localDocs);
        };
        
        if (!isCheckingSession && hasUserSession) {
            console.log("🚀 Triggering document load - isCheckingSession:", isCheckingSession, "hasUserSession:", hasUserSession);
            loadDocuments();
        } else {
            console.log("⏳ Waiting for session check - isCheckingSession:", isCheckingSession, "hasUserSession:", hasUserSession);
        }
    }, [isCheckingSession, hasUserSession, reloadTrigger]);

    // Reload documents when returning to this page (e.g., after editing)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && hasUserSession) {
                console.log("👁️ Page became visible, reloading documents...");
                setReloadTrigger(prev => prev + 1);
            }
        };

        const handleFocus = () => {
            if (hasUserSession) {
                console.log("🔄 Window focused, reloading documents...");
                setReloadTrigger(prev => prev + 1);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [hasUserSession]);

    useEffect(() => {
        // Fetch templates when session check is complete and user has access
        if (isCheckingSession || !hasUserSession) return;
        
        const fetchTemplates = async () => {
            try {
                setIsLoading(true);
                const fetchedForms = await getAllForms();
                
                // Map Firebase forms to our format
                const templateItems: FormTemplate[] = fetchedForms.map((form: any) => ({
                    id: form.id,
                    title: form.title || "Brez naslova",
                    description: form.description || null,
                }));
                
                setTemplates(templateItems);
            } catch (err) {
                console.error("Error fetching templates:", err);
                setError("Napaka pri nalaganju predlog. Poskusite znova.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTemplates();
    }, [hasUserSession, isCheckingSession]);

    // Redirect to main login if no user session
    useEffect(() => {
        if (!isCheckingSession && !hasUserSession) {
            // Clear invalid data
            localStorage.removeItem("authStatus");
            localStorage.removeItem("mediform_session_token");
            
            // Navigate back to root using React Router
            navigate('/', { replace: true });
        }
    }, [isCheckingSession, hasUserSession, navigate]);

    const handleCreateDocument = (template: FormTemplate) => {
        setSelectedTemplate(template);
        setNewDocName("");
        setDuplicateNameError(false);
        setShowNewDocDialog(true);
    };

    const confirmCreateDocument = async () => {
        if (!selectedTemplate || !newDocName.trim()) return;
        
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
            templateId: selectedTemplate.id,
            templateTitle: selectedTemplate.title,
            name: newDocName.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        
        const updatedDocs = [...userDocuments, newDoc];
        setUserDocuments(updatedDocs);
        saveUserDocuments(updatedDocs);

        // Save to backend for email users (initial empty document)
        const currentAuthStatus = localStorage.getItem("authStatus");
        if (currentAuthStatus === "email") {
            try {
                await autoSaveForm(newDoc.id, {}, {
                    templateId: newDoc.templateId,
                    templateTitle: newDoc.templateTitle,
                    name: newDoc.name
                });
                console.log("✅ Document metadata saved to backend");
            } catch (error) {
                console.error("Failed to save document to backend:", error);
            }
        }
        
        setShowNewDocDialog(false);
        setSelectedTemplate(null);
        setNewDocName("");
        setDuplicateNameError(false);
        
        // Navigate to the new document
        navigate(`/obrazec/${selectedTemplate.id}?doc=${newDoc.id}`);
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
                if (!importedData.title || !importedData.categories) {
                    setImportError("Neveljavna JSON struktura. Datoteka ne vsebuje podatkov obrazca.");
                    setShowImportDialog(true);
                    return;
                }

                // Find matching template by title
                const matchingTemplate = templates.find(t => t.title === importedData.title);
                if (!matchingTemplate) {
                    setImportError(`Predloga "${importedData.title}" ni bilo mogoče najti. Poskrbite, da predloga obstaja.`);
                    setShowImportDialog(true);
                    return;
                }

                // Store data and show dialog for name input
                setImportFileData({ data: importedData, template: matchingTemplate });
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

        // Save to backend for email users (with imported data)
        const currentAuthStatus = localStorage.getItem("authStatus");
        if (currentAuthStatus === "email") {
            try {
                await autoSaveForm(newDoc.id, importFileData.data, {
                    templateId: newDoc.templateId,
                    templateTitle: newDoc.templateTitle,
                    name: newDoc.name
                });
                console.log("✅ Imported document saved to backend");
            } catch (error) {
                console.error("Failed to save imported document to backend:", error);
            }
        }

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

    // Show nothing while redirecting (navigation handled in useEffect above)
    if (!hasUserSession) {
        return null;
    }

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
                        {authStatus === 'anonymous' && (
                            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                Offline
                            </span>
                        )}
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
                                className="flex items-center gap-2 border-ocean-teal text-ocean-teal hover:bg-ocean-light"
                            >
                                <Upload className="h-4 w-4" />
                                <span className="hidden sm:inline">Uvozi JSON</span>
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

                {/* Horizontal Carousel for Templates */}
                {templates.length > 0 ? (
                    <div className="relative mb-12 px-8">
                        <div className="overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <style>{`
                                .scrollbar-hide::-webkit-scrollbar {
                                    display: none;
                                }
                            `}</style>
                            <div className={`flex gap-4 pb-4 ${templates.length <= 3 ? 'justify-center' : ''}`}>
                                {templates.map((template, index) => (
                                    <motion.div
                                        key={template.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: index * 0.05,
                                        }}
                                        className="flex-shrink-0"
                                        style={{ width: '320px' }}
                                    >
                                        <Card className="h-full hover:shadow-lg transition-shadow border-2 border-slate-200 hover:border-ocean-teal">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-lg font-bold text-slate-900 mb-2 flex items-start gap-2">
                                                    <FileText className="h-5 w-5 text-ocean-teal flex-shrink-0 mt-0.5" />
                                                    <span>{template.title}</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {template.description && (
                                                    <p className="text-sm text-slate-600 leading-relaxed min-h-[60px]">
                                                        {template.description}
                                                    </p>
                                                )}
                                                <Button
                                                    onClick={() => handleCreateDocument(template)}
                                                    className="w-full bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf text-white"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Ustvari dokument
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
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
                            placeholder="npr. Pacient Janez Novak"
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
                            disabled={!newDocName.trim()}
                            className="bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf"
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
                                    placeholder="npr. Pacient Janez Novak"
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

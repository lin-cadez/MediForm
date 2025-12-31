"use client";

import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    User,
    Loader2,
    AlertCircle,
    FileText,
    ChevronRight,
    Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { getAllForms } from "@/lib/firebase";

import "./selector.css";

interface FormItem {
    id: string;
    title: string;
    description: string | null;
    url: string;
}

export default function Selector() {
    const [forms, setForms] = useState<FormItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("");
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
            const parsed = JSON.parse(userInfo);
            setUserName(parsed.ime || "");
        }
        
        // Check if user is admin
        const adminLoggedIn = sessionStorage.getItem("adminLoggedIn");
        setIsAdmin(adminLoggedIn === "true");
    }, []);

    useEffect(() => {
        const fetchForms = async () => {
            try {
                setIsLoading(true);
                const fetchedForms = await getAllForms();
                
                // Map Firebase forms to our format
                const formItems: FormItem[] = fetchedForms.map((form: any) => ({
                    id: form.id,
                    title: form.title || "Brez naslova",
                    description: form.description || null,
                    url: form.url || form.id,
                }));
                
                setForms(formItems);
            } catch (err) {
                console.error("Error fetching forms:", err);
                setError("Napaka pri nalaganju seznamov. Poskusite znova.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchForms();
    }, []);

    const openForm = (form: FormItem) => {
        // Store the form ID for later retrieval in checklist
        localStorage.setItem("currentFormId", form.id);
    };

    const retryFetch = () => {
        setError(null);
        setIsLoading(true);
        window.location.reload();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-sky-50">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-ocean-teal" />
                        <p className="text-slate-600 font-medium">
                            Nalagnje seznamov...
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
                            Kontrolni seznami
                        </span>
                    </NavLink>
                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <NavLink to="/form_builder">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2 hover:bg-slate-50 transition-colors duration-200 bg-transparent border-ocean-frost text-ocean-teal"
                                >
                                    <Settings className="h-4 w-4" />
                                    <span className="hidden sm:inline">Urejevalnik</span>
                                </Button>
                            </NavLink>
                        )}
                        <NavLink to="/profil">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 hover:bg-slate-50 transition-colors duration-200 bg-transparent"
                            >
                                <User className="h-4 w-4" />
                                <span className="user-name-responsive">
                                    {userName || (isAdmin ? "Admin" : "")}
                                </span>
                            </Button>
                        </NavLink>
                    </div>
                </div>
            </header>
            <main className="main">
                <div className="section-heading">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            Izberite kontrolni seznam
                        </h2>
                        <p className="text-slate-600 text-lg">
                            Izberite seznam, ki ga želite izpolniti.
                        </p>
                    </motion.div>
                </div>
                <div className="list-spacing">
                    <AnimatePresence>
                        {forms.map((form, index) => (
                                <motion.div
                                    key={form.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: index * 0.1,
                                    }}
                                >
                                    <NavLink
                                        to={`/checklist/${form.id}`}
                                        onClick={() => openForm(form)}
                                        className="block group"
                                    >
                                        <Card className="list-card">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="card-title">
                                                    <div className="flex items-center gap-3">
                                                        <div className="title-icon">
                                                            <FileText className="h-4 w-4 text-ocean-teal" />
                                                        </div>
                                                        <span className="font-semibold">
                                                            {form.title}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <ChevronRight className="chevron" />
                                                    </div>
                                                </CardTitle>
                                            </CardHeader>
                                            {form.description && (
                                                <CardContent className="pt-0">
                                                    <p className="text-slate-600 leading-relaxed">
                                                        {form.description}
                                                    </p>
                                                </CardContent>
                                            )}
                                        </Card>
                                    </NavLink>
                                </motion.div>
                            ))}
                    </AnimatePresence>
                </div>
                {forms.length === 0 && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 empty-lists"
                    >
                        <div className="empty-icon">
                            <FileText className="h-8 w-8 text-ocean-teal" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Ni razpoložljivih seznamov
                        </h3>
                        <p className="text-slate-600">
                            Preverite znova pozneje.
                        </p>
                    </motion.div>
                )}
            </main>
        </div>
    );



}

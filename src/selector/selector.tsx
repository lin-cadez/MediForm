"use client";

import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    Info,
    Loader2,
    AlertCircle,
    FileText,
    ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

import "./selector.css";

interface List {
    title: string;
    description: string | null;
    url: string;
}

const STORAGE_KEY = "fetchedData";

export default function Selector() {
    const [lists, setLists] = useState<{ [key: string]: List } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const allLists = [
        "https://raw.githubusercontent.com/jakecernet/zd-json/refs/heads/main/test1.json",
        "https://raw.githubusercontent.com/jakecernet/zd-json/refs/heads/main/test2.json",
    ];

    useEffect(() => {
        const fetchLists = async () => {
            try {
                setIsLoading(true);
                const storedData = localStorage.getItem(STORAGE_KEY);
                let fetchedLists: { [key: string]: List } = storedData
                    ? JSON.parse(storedData)
                    : {};

                for (const url of allLists) {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(
                            `Napaka pri nalaganju seznama iz ${url}`
                        );
                    }
                    const fetchedData = await response.json();
                    fetchedLists = { ...fetchedLists, ...fetchedData };
                }

                localStorage.setItem(STORAGE_KEY, JSON.stringify(fetchedLists));
                setLists(fetchedLists);

                // Check if no lists were fetched and redirect to home
                if (Object.keys(fetchedLists).length === 0) {
                    return;
                }
            } catch (err) {
                setError("Napaka pri nalaganju seznamov. Poskusite znova.");
                // Redirect to home on error
                setTimeout(() => {
                    window.location.href = "/";
                }, 3000);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLists();
    }, []);

    const openList = (url: string) => {
        if (lists?.[url]) {
            localStorage.setItem(url, JSON.stringify(lists[url]));
        }
    };

    const retryFetch = () => {
        setError(null);
        setIsLoading(true);
        window.location.reload();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-indigo-100">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-violet-600" />
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-indigo-100">
                <div className="flex items-center justify-center min-h-screen p-4">
                    <Alert className="max-w-md">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="mb-4">
                            {error}
                        </AlertDescription>
                        <Button
                            onClick={retryFetch}
                            className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
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
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-semibold text-slate-900 hidden sm:block">
                            Kontrolni seznami
                        </span>
                    </NavLink>
                    <NavLink to="/about">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 hover:bg-slate-50 transition-colors duration-200 bg-transparent"
                        >
                            <Info className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                O aplikaciji
                            </span>
                        </Button>
                    </NavLink>
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
                        {lists &&
                            Object.entries(lists).map(([key, list], index) => (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: index * 0.1,
                                    }}
                                >
                                    <NavLink
                                        to={`/checklist/${list.url}`}
                                        onClick={() => openList(list.url)}
                                        className="block group"
                                    >
                                        <Card className="list-card">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="card-title">
                                                    <div className="flex items-center gap-3">
                                                        <div className="title-icon">
                                                            <FileText className="h-4 w-4 text-violet-600" />
                                                        </div>
                                                        <span className="font-semibold">
                                                            {list.title}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <ChevronRight className="chevron" />
                                                    </div>
                                                </CardTitle>
                                            </CardHeader>
                                            {list.description && (
                                                <CardContent className="pt-0">
                                                    <p className="text-slate-600 leading-relaxed">
                                                        {list.description}
                                                    </p>
                                                </CardContent>
                                            )}
                                        </Card>
                                    </NavLink>
                                </motion.div>
                            ))}
                    </AnimatePresence>
                </div>
                {lists && Object.keys(lists).length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 empty-lists"
                    >
                        <div className="empty-icon">
                            <FileText className="h-8 w-8 text-violet-600" />
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

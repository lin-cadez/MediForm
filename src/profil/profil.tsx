"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { ArrowLeft, User, GraduationCap, Save, Check, School, LogOut, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// Select component imports removed - not currently used
import { motion } from "framer-motion";
import "./about.css";

interface UserInfo {
    ime: string;
    priimek: string;
    razred: string;
    sola: string;
    podrocje: string;
}

export default function Profil() {
    const [userInfo, setUserInfo] = useState<UserInfo>({
        ime: "",
        priimek: "",
        razred: "",
        sola: "Srednja zdravstvena šola Ljubljana, Poljanska cesta 61, 1000 Ljubljana",
        podrocje: "",
    });
    const [errors, setErrors] = useState<Partial<UserInfo>>({});
    const [saved, setSaved] = useState(false);
    const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const savedUserInfo = localStorage.getItem("userInfo");
        if (savedUserInfo) {
            setUserInfo(JSON.parse(savedUserInfo));
        }
    }, []);

    const handleInputChange = (field: keyof UserInfo, value: string) => {
        const updatedInfo = { ...userInfo, [field]: value };
        setUserInfo(updatedInfo);
        
        // Clear existing timeout
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        
        // Set new timeout to auto-save after 1 second (silently, no indicator)
        const newTimeout = setTimeout(() => {
            localStorage.setItem("userInfo", JSON.stringify(updatedInfo));
        }, 1000);
        
        setSaveTimeout(newTimeout);
        
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Partial<UserInfo> = {};
        if (!userInfo.ime.trim()) newErrors.ime = "Ime je obvezno";
        if (!userInfo.priimek.trim()) newErrors.priimek = "Priimek je obvezen";
        if (!userInfo.razred.trim()) newErrors.razred = "Razred je obvezen";
        if (!userInfo.sola.trim()) newErrors.sola = "Šola je obvezna";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Data is already saved, just show feedback
        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 2000);
    };

    const handleLogout = async () => {
        if (confirm("Ali ste prepričani, da se želite odjaviti? Vaši podatki bodo izbrisani.")) {
            try {
                // Call backend to clear session cookie
                await fetch('https://medi-form-backend.vercel.app/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (error) {
                console.error('Error during logout:', error);
            }
            
            // Clear all local data
            localStorage.clear();
            sessionStorage.clear();
            
            // Redirect to home
            window.location.href = "/";
        }
    };


    return (
        <div className="page-container">
            <header className="header">
                <div className="header-content">
                    <NavLink to="/">
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </NavLink>
                    <div className="flex-1 text-center px-4">
                        <h1 className="text-lg font-semibold text-slate-900">
                            Moj profil
                        </h1>
                    </div>
                </div>
            </header>
            <main className="main-content">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="intro-section"
                >
                   
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="authors-card border-0 shadow-xl bg-white/90 backdrop-blur-sm border border-ocean-frost">
                        <CardHeader>
                            <CardTitle className="text-center text-slate-900 text-xl">
                                Uredi profil
                                
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="ime"
                                        className="text-sm font-medium text-slate-700 flex items-center gap-2"
                                    >
                                        <User className="h-4 w-4 text-ocean-teal" />
                                        Ime
                                    </Label>
                                    <Input
                                        id="ime"
                                        type="text"
                                        value={userInfo.ime}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "ime",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Vnesite vaše ime"
                                        className={`transition-all duration-200 focus:ring-2 focus:ring-ocean-surf/20 focus:border-ocean-surf ${
                                            errors.ime
                                                ? "border-red-300 focus:border-red-300 focus:ring-red-500/20"
                                                : "border-ocean-frost"
                                        }`}
                                    />
                                    {errors.ime && (
                                        <p className="text-sm text-red-600">
                                            {errors.ime}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="priimek"
                                        className="text-sm font-medium text-slate-700 flex items-center gap-2"
                                    >
                                        <User className="h-4 w-4 text-ocean-teal" />
                                        Priimek
                                    </Label>
                                    <Input
                                        id="priimek"
                                        type="text"
                                        value={userInfo.priimek}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "priimek",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Vnesite vaš priimek"
                                        className={`transition-all duration-200 focus:ring-2 focus:ring-ocean-surf/20 focus:border-ocean-surf ${
                                            errors.priimek
                                                ? "border-red-300 focus:border-red-300 focus:ring-red-500/20"
                                                : "border-ocean-frost"
                                        }`}
                                    />
                                    {errors.priimek && (
                                        <p className="text-sm text-red-600">
                                            {errors.priimek}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="razred"
                                        className="text-sm font-medium text-slate-700 flex items-center gap-2"
                                    >
                                        <GraduationCap className="h-4 w-4 text-ocean-teal" />
                                        Razred
                                    </Label>
                                    <Input
                                        id="razred"
                                        type="text"
                                        value={userInfo.razred}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "razred",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Vnesite vaš razred (npr. 3.A)"
                                        className={`transition-all duration-200 focus:ring-2 focus:ring-ocean-surf/20 focus:border-ocean-surf ${
                                            errors.razred
                                                ? "border-red-300 focus:border-red-300 focus:ring-red-500/20"
                                                : "border-ocean-frost"
                                        }`}
                                    />
                                    {errors.razred && (
                                        <p className="text-sm text-red-600">
                                            {errors.razred}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="sola"
                                        className="text-sm font-medium text-slate-700 flex items-center gap-2"
                                    >
                                        <School className="h-4 w-4 text-ocean-teal" />
                                        Šola
                                    </Label>
                                    <select
                                        id="sola"
                                        value={userInfo.sola}
                                        onChange={e => handleInputChange("sola", e.target.value)}
                                        className={`transition-all duration-200 focus:ring-2 focus:ring-ocean-surf/20 focus:border-ocean-surf w-full rounded-md h-10 px-3 py-2 text-sm bg-white border ${
                                            errors.sola
                                                ? "border-red-300 focus:border-red-300 focus:ring-red-500/20"
                                                : "border-ocean-frost"
                                        }`}
                                    >
                                        <option value="" disabled>Izberite šolo</option>
                                        <option value="Srednja zdravstvena šola Ljubljana, Poljanska cesta 61, 1000 Ljubljana">Srednja zdravstvena šola Ljubljana, Poljanska cesta 61, 1000 Ljubljana</option>
                                        <option value="Šolski center Nova Gorica, Gimnazija in zdravstvena šola">Šolski center Nova Gorica, Gimnazija in zdravstvena šola</option>
                                        <option value="Šolski center Novo mesto, Srednja zdravstvena in kemijska šola">Šolski center Novo mesto, Srednja zdravstvena in kemijska šola</option>
                                        <option value="Šolski center Slovenj Gradec, Srednja zdravstvena šola">Šolski center Slovenj Gradec, Srednja zdravstvena šola</option>
                                        <option value="Srednja šola za farmacijo, kozmetiko in zdravstvo">Srednja šola za farmacijo, kozmetiko in zdravstvo</option>
                                        <option value="Srednja zdravstvena in kozmetična šola Maribor">Srednja zdravstvena in kozmetična šola Maribor</option>
                                        <option value="Srednja zdravstvena šola Murska Sobota">Srednja zdravstvena šola Murska Sobota</option>
                                        <option value="Srednja zdravstvena in kozmetična šola Celje">Srednja zdravstvena in kozmetična šola Celje</option>
                                    </select>
                                    {errors.sola && (
                                        <p className="text-sm text-red-600">
                                            {errors.sola}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="podrocje"
                                        className="text-sm font-medium text-slate-700 flex items-center gap-2"
                                    >
                                        <Building2 className="h-4 w-4 text-ocean-teal" />
                                        Področje izvajanja zdravstvene nege
                                    </Label>
                                    <Input
                                        id="podrocje"
                                        type="text"
                                        value={userInfo.podrocje}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "podrocje",
                                                e.target.value
                                            )
                                        }
                                        placeholder="npr. Interna klinika, UKC Ljubljana"
                                        className="transition-all duration-200 focus:ring-2 focus:ring-ocean-surf/20 focus:border-ocean-surf border-ocean-frost"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className={`w-full py-3 text-lg font-medium transition-all duration-300 ${
                                        saved
                                            ? "bg-green-600 hover:bg-green-700"
                                            : "bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf"
                                    } text-white`}
                                >
                                    {saved ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Check className="h-5 w-5" />
                                            Shranjeno
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Save className="h-5 w-5" />
                                            Shrani spremembe
                                        </span>
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleLogout}
                                    className="w-full py-3 text-lg font-medium border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <LogOut className="h-5 w-5" />
                                        Odjava
                                    </span>
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
}

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { ArrowLeft, User, LogOut, GraduationCap, School, Building2, Check, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { saveStudentProfile } from "@/lib/api";
import "./about.css";

const SCHOOL_NAME = "Srednja zdravstvena šola Ljubljana, Poljanska cesta 61, 1000 Ljubljana";

interface UserInfo {
    ime: string;
    priimek: string;
    razred: string;
    sola: string;
    podrocje?: string;
}

interface ProfilProps {
    userInfo: UserInfo;
    onLogout?: () => void | Promise<void>;
}

export default function Profil({ userInfo: initialUserInfo }: ProfilProps) {
    const [userInfo, setUserInfo] = useState<UserInfo>({
        ime: initialUserInfo?.ime || "",
        priimek: initialUserInfo?.priimek || "",
        razred: initialUserInfo?.razred || "",
        sola: SCHOOL_NAME,
        podrocje: initialUserInfo?.podrocje || "",
    });
    const [errors, setErrors] = useState<Partial<UserInfo>>({});
    const [saved, setSaved] = useState(false);
    const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    useEffect(() => {
        const savedUserInfo = localStorage.getItem("userInfo");
        if (savedUserInfo) {
            const parsed = JSON.parse(savedUserInfo);
            const { email: _removedEmail, ...infoWithoutEmail } = parsed;
            void _removedEmail;
            setUserInfo({
                ...infoWithoutEmail,
                sola: SCHOOL_NAME,
            });
        }
    }, []);

    const handleInputChange = (field: keyof UserInfo, value: string) => {
        const updatedInfo = { ...userInfo, [field]: field === "sola" ? SCHOOL_NAME : value };
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

    const handleSubmit = async (e: React.FormEvent) => {
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

        const infoToSave = { ...userInfo, sola: SCHOOL_NAME };
        localStorage.setItem("userInfo", JSON.stringify(infoToSave));
        await saveStudentProfile(infoToSave);
        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 2000);
    };

    const handleLogoutClick = () => {
        setShowLogoutDialog(true);
    };
    
    const confirmLogout = () => {
        // Clear all localStorage
        localStorage.clear();
        
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        // Force redirect to login page
        window.location.replace('/');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
            <Card className="w-full max-w-lg shadow-lg">
                <div className="w-full flex justify-between items-center p-4 border-b">
                    <NavLink
                        to="/"
                        className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Nazaj na izbiro
                    </NavLink>
                    <Button variant="ghost" size="sm" onClick={handleLogoutClick}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Odjava
                    </Button>
                </div>
                <CardHeader className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <CardTitle className="text-2xl font-bold text-slate-900">
                            Moj profil
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                            Tukaj lahko uredite svoje podatke.
                        </p>
                    </motion.div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-6">
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
                                        <option value={SCHOOL_NAME}>{SCHOOL_NAME}</option>
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
                        </div>
                    </form>
                </CardContent>
            </Card>
            
            {/* Logout Confirmation Dialog */}
            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Odjava</DialogTitle>
                        <DialogDescription>
                            Ali ste prepričani, da se želite odjaviti?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                            Prekliči
                        </Button>
                        <Button 
                            onClick={confirmLogout}
                            variant="destructive"
                        >
                            Odjava
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

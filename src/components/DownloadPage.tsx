"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, Smartphone, Zap, Shield, FileText } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "./Footer";

export default function DownloadPage() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOSInstructions, setIsIOSInstructions] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        // Listen for beforeinstallprompt event
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOSInstructions(isIOS && !isInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            // If no prompt, show iOS instructions or inform user
            if (isIOSInstructions) {
                alert('Za namestitev na iOS: Pritisnite gumb "Deli" in izberite "Dodaj na začetni zaslon"');
            }
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            setIsInstalled(true);
        }
        
        setDeferredPrompt(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-ocean-frost shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img 
                            src="/logo_with_text.png" 
                            alt="MediForm" 
                            className="h-10 w-auto"
                        />
                    </div>
                    <a href="/" className="text-ocean-teal hover:text-ocean-deep transition-colors">
                        Nazaj na aplikacijo
                    </a>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center space-y-6"
                >
                    <div className="flex justify-center mb-6">
                        <img 
                            src="/logo_only.png" 
                            alt="MediForm Logo" 
                            className="h-32 w-32 drop-shadow-lg"
                        />
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                        MediForm
                    </h1>
                    
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Digitalna rešitev za izpolnjevanje zdravstvenih obrazcev za študente
                    </p>

                    {/* Install Button */}
                    {!isInstalled ? (
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            <Button
                                onClick={handleInstallClick}
                                size="lg"
                                className="h-16 px-8 text-lg bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                            >
                                <Download className="mr-3 h-6 w-6" />
                                {isIOSInstructions ? "Prikaži navodila za iOS" : "Namesti aplikacijo"}
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="flex items-center justify-center gap-2 text-green-600 text-lg font-medium"
                        >
                            <CheckCircle2 className="h-6 w-6" />
                            Aplikacija je nameščena!
                        </motion.div>
                    )}

                    {isIOSInstructions && (
                        <Card className="bg-blue-50 border-blue-200 max-w-md mx-auto">
                            <CardContent className="p-6 space-y-3">
                                <p className="font-semibold text-blue-900">Navodila za iOS:</p>
                                <ol className="text-sm text-blue-800 space-y-2 text-left list-decimal list-inside">
                                    <li>Pritisnite gumb "Deli" (kvadrat s puščico navzgor)</li>
                                    <li>Pomaknite navzdol in izberite "Dodaj na začetni zaslon"</li>
                                    <li>Pritisnite "Dodaj"</li>
                                </ol>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-6 space-y-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-ocean-light to-ocean-frost rounded-full flex items-center justify-center">
                                    <Zap className="h-6 w-6 text-ocean-teal" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Deluje brez interneta
                                </h3>
                                <p className="text-slate-600">
                                    Vsi obrazci in podatki se hranijo lokalno na vaši napravi. Uporabite aplikacijo kadarkoli in kjerkoli, tudi brez internetne povezave.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-6 space-y-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-ocean-light to-ocean-frost rounded-full flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-ocean-teal" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Varnost podatkov
                                </h3>
                                <p className="text-slate-600">
                                    Vaši osebni podatki ostanejo na vaši napravi. Eksportirajo se samo, ko vi to želite.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-6 space-y-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-ocean-light to-ocean-frost rounded-full flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-ocean-teal" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Enostavno izpolnjevanje
                                </h3>
                                <p className="text-slate-600">
                                    Intuitivni obrazci z avtomatskim shranjevanjem. Nikoli ne izgubite svojega dela.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-6 space-y-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-ocean-light to-ocean-frost rounded-full flex items-center justify-center">
                                    <Smartphone className="h-6 w-6 text-ocean-teal" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Mobilna optimizacija
                                </h3>
                                <p className="text-slate-600">
                                    Prilagojena za telefone in tablice. Uporabite na katerikoli napravi.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* How it works */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="text-center space-y-8"
                >
                    <h2 className="text-3xl font-bold text-slate-900">
                        Kako deluje?
                    </h2>
                    
                    <div className="grid md:grid-cols-3 gap-6 text-left">
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-6 space-y-3">
                                <div className="w-10 h-10 bg-ocean-teal text-white rounded-full flex items-center justify-center font-bold text-lg">
                                    1
                                </div>
                                <h4 className="font-semibold text-lg">Namestite aplikacijo</h4>
                                <p className="text-slate-600 text-sm">
                                    Kliknite gumb "Namesti aplikacijo" in dodajte MediForm na svoj začetni zaslon.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md">
                            <CardContent className="p-6 space-y-3">
                                <div className="w-10 h-10 bg-ocean-teal text-white rounded-full flex items-center justify-center font-bold text-lg">
                                    2
                                </div>
                                <h4 className="font-semibold text-lg">Izpolnite obrazce</h4>
                                <p className="text-slate-600 text-sm">
                                    Vnesite svoje podatke in izpolnite zdravstvene obrazce preprosto in hitro.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md">
                            <CardContent className="p-6 space-y-3">
                                <div className="w-10 h-10 bg-ocean-teal text-white rounded-full flex items-center justify-center font-bold text-lg">
                                    3
                                </div>
                                <h4 className="font-semibold text-lg">Izvozite PDF</h4>
                                <p className="text-slate-600 text-sm">
                                    Ko končate, izvozite obrazec kot PDF in ga delite s svojimi mentorji.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* CTA Section */}
                {!isInstalled && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="text-center space-y-6 py-12"
                    >
                        <h2 className="text-3xl font-bold text-slate-900">
                            Pripravljen začeti?
                        </h2>
                        <Button
                            onClick={handleInstallClick}
                            size="lg"
                            className="h-16 px-8 text-lg bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                        >
                            <Download className="mr-3 h-6 w-6" />
                            {isIOSInstructions ? "Prikaži navodila za iOS" : "Namesti MediForm"}
                        </Button>
                    </motion.div>
                )}
            </main>

            <Footer />
        </div>
    );
}

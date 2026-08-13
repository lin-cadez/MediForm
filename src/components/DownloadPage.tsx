"use client";

import { NavLink } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Download, Share, Smartphone, WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import Footer from "./Footer";

export default function DownloadPage() {
    const { canInstall, install, isInstalled, isIOS } = usePwaInstall();

    const handleInstallClick = async () => {
        if (canInstall) {
            await install();
        }
    };

    return (
        <div className="min-h-screen bg-sky-50 flex flex-col">
            <header className="bg-white/95 backdrop-blur-sm border-b border-ocean-frost shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <NavLink
                        to="/"
                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Nazaj
                    </NavLink>
                    <img src="/logo_with_text.png" alt="MediForm" className="h-9 w-auto" />
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
                <section className="text-center space-y-4">
                    <img src="/logo_only.png" alt="MediForm" className="h-24 w-24 mx-auto" />
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Namesti MediForm</h1>
                        <p className="text-slate-600 mt-2">
                            Dodaj aplikacijo na začetni zaslon telefona za hitrejši dostop in uporabo brez interneta.
                        </p>
                    </div>

                    {isInstalled ? (
                        <div className="inline-flex items-center gap-2 text-green-700 font-medium">
                            <CheckCircle2 className="h-5 w-5" />
                            Aplikacija je že nameščena
                        </div>
                    ) : canInstall ? (
                        <Button
                            onClick={handleInstallClick}
                            size="lg"
                            className="bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf text-white"
                        >
                            <Download className="mr-2 h-5 w-5" />
                            Namesti aplikacijo
                        </Button>
                    ) : (
                        <p className="text-sm text-slate-500">
                            Če gumb za namestitev ni prikazan, uporabi navodila spodaj.
                        </p>
                    )}
                </section>

                <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border-ocean-frost">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Smartphone className="h-5 w-5 text-ocean-teal" />
                                Android / Chrome
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-slate-600">
                            <p>Odpri MediForm v Chromu in pritisni gumb Namesti.</p>
                            <p>Če gumba ni, odpri meni brskalnika in izberi Namesti aplikacijo ali Dodaj na začetni zaslon.</p>
                        </CardContent>
                    </Card>

                    <Card className="border-ocean-frost">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Share className="h-5 w-5 text-ocean-teal" />
                                iPhone / Safari
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-slate-600">
                            <p>Odpri MediForm v Safariju.</p>
                            <p>Pritisni Deli, nato Dodaj na začetni zaslon in potrdi z Dodaj.</p>
                            {!isIOS && (
                                <p className="text-xs text-slate-500">
                                    Ta navodila veljajo za iOS naprave.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-ocean-frost bg-white/80">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <WifiOff className="h-5 w-5 text-ocean-teal" />
                            Brez interneta
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-slate-600">
                        <p>Predloge obrazcev, shranjeni dokumenti in izvoz PDF/JSON delujejo lokalno po prvem nalaganju aplikacije.</p>
                        <p>Pošiljanje profila dijaka na API potrebuje internet; če povezave ni, obrazec vseeno ostane shranjen v brskalniku.</p>
                    </CardContent>
                </Card>
            </main>

            <Footer />
        </div>
    );
}

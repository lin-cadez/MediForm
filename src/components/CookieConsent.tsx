"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Shield } from "lucide-react";

interface CookieConsentProps {
    onAccept: () => void;
}

export default function CookieConsent({ onAccept }: CookieConsentProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookieConsent");
        if (!consent) {
            setIsOpen(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookieConsent", "accepted");
        localStorage.setItem("cookieConsentDate", new Date().toISOString());
        setIsOpen(false);
        onAccept();
    };

    const handleDecline = () => {
        // If user declines, they can't use the app
        window.location.href = "https://google.com";
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-gradient-to-br from-ocean-light to-ocean-frost rounded-full flex items-center justify-center mb-2">
                        <Shield className="h-6 w-6 text-ocean-teal" />
                    </div>
                    <DialogTitle className="text-center">Soglasje za uporabo</DialogTitle>
                    <DialogDescription className="text-center">
                        Za uporabo aplikacije MediForm morate sprejeti naše pogoje uporabe in politiko zasebnosti.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-3 py-4">
                    <p className="text-sm text-slate-600">
                        Z uporabo te aplikacije se strinjate z naslednjim:
                    </p>
                    <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                        <li>Vaši podatki se shranjujejo za delovanje aplikacije</li>
                        <li>Aplikacija uporablja piškotke za osnovno delovanje</li>
                        <li>Sprejemate naše pogoje uporabe in politiko zasebnosti</li>
                    </ul>
                    
                    <div className="flex flex-col gap-2 pt-2">
                        <a 
                            href="/pogoji-uporabe" 
                            target="_blank"
                            className="text-sm text-ocean-teal hover:underline"
                        >
                            Pogoji uporabe →
                        </a>
                        <a 
                            href="/zasebnost" 
                            target="_blank"
                            className="text-sm text-ocean-teal hover:underline"
                        >
                            Politika zasebnosti →
                        </a>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={handleDecline}
                        className="w-full sm:w-auto"
                    >
                        Zavrni
                    </Button>
                    <Button
                        onClick={handleAccept}
                        className="w-full sm:w-auto bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf text-white"
                    >
                        Sprejmi in nadaljuj
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { sendLoginEmail } from "@/lib/firebaseAuth";

interface AdminLoginProps {
    onLoginSuccess?: () => void;
}

export default function AdminLogin({ }: AdminLoginProps) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!email.trim()) {
            setError("Email je obvezen");
            setIsLoading(false);
            return;
        }

        try {
            const result = await sendLoginEmail(email);
            
            if (result.success) {
                setEmailSent(true);
            } else {
                setError(result.error || "Napaka pri pošiljanju emaila");
            }
        } catch (err) {
            setError("Napaka pri povezavi s strežnikom");
        }

        setIsLoading(false);
    };

    if (emailSent) {
        return (
            <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm border border-ocean-frost">
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-ocean-deep to-ocean-teal rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-slate-900">
                                Email poslan!
                            </CardTitle>
                            <p className="text-slate-600 mt-2">
                                Prijavna povezava je bila poslana na:
                            </p>
                            <p className="text-ocean-teal font-semibold mt-1">
                                {email}
                            </p>
                        </CardHeader>

                        <CardContent className="text-center space-y-4">
                            <p className="text-slate-600 text-sm">
                                Preveri svoj email (tudi spam mapo) in klikni na povezavo za prijavo.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEmailSent(false);
                                    setEmail("");
                                }}
                                className="border-ocean-frost text-ocean-teal hover:bg-ocean-light"
                            >
                                Pošlji znova
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm border border-ocean-frost">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-slate-900">
                            Prijava administratorja
                        </CardTitle>
                        <p className="text-slate-600 mt-2">
                            Vnesite svoj email za prijavo brez gesla.
                        </p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium text-slate-700 flex items-center gap-2"
                                >
                                    <Mail className="h-4 w-4 text-ocean-teal" />
                                    Email naslov
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@email.com"
                                    className="transition-all duration-200 focus:ring-2 focus:ring-ocean-surf/20 focus:border-ocean-surf border-ocean-frost"
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 text-center">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf text-white py-3 text-lg font-medium"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Pošiljanje...
                                    </>
                                ) : (
                                    "Pošlji prijavni link"
                                )}
                            </Button>

                            <p className="text-xs text-slate-500 text-center">
                                Na vaš email bo poslana povezava za prijavo. Geslo ni potrebno.
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

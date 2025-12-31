import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { completeEmailSignIn, isEmailSignInLink } from "@/lib/firebaseAuth";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://medi-form-backend.vercel.app/api';

// Update user profile on backend
const updateUserProfile = async (profileData: any): Promise<{ success: boolean; user?: any }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(profileData)
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false };
    }
};

export default function FinishSignIn() {
    const [status, setStatus] = useState<"loading" | "success" | "error" | "needs-email">("loading");
    const [message, setMessage] = useState("Dokončevanje prijave...");
    const [emailInput, setEmailInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const processSignIn = async (providedEmail?: string) => {
        const result = await completeEmailSignIn(providedEmail);

        if (result.needsEmail) {
            // Need email input from user
            setStatus("needs-email");
            setMessage("Prosimo, vnesite svoj email naslov za potrditev prijave");
            return;
        }

        if (result.success) {
                // Clear the URL immediately to prevent reuse of the sign-in link
                window.history.replaceState({}, document.title, window.location.pathname);
                
                setStatus("success");
                setMessage("Uspešno prijavljen!");
                
                // Check if user has a pending form to fill
                const pendingFormId = localStorage.getItem('pendingFormId');
                let targetUrl = "/";
                
                // Only set admin session if user is actually an admin
                if (result.user?.role === 'admin') {
                    sessionStorage.setItem("adminLoggedIn", "true");
                } else {
                    sessionStorage.removeItem("adminLoggedIn");
                }
                
                // Check if this is a new registration (userInfo saved locally during registration)
                const savedUserInfo = localStorage.getItem("userInfo");
                if (savedUserInfo) {
                    const localUserInfo = JSON.parse(savedUserInfo);
                    
                    // If backend doesn't have personal data but we have it locally, send it to backend
                    if (!result.user?.ime && localUserInfo.ime) {
                        setMessage("Shranjevanje podatkov...");
                        const updateResult = await updateUserProfile({
                            ime: localUserInfo.ime,
                            priimek: localUserInfo.priimek,
                            razred: localUserInfo.razred,
                            sola: localUserInfo.sola,
                            podrocje: localUserInfo.podrocje,
                        });
                        
                        // If update successful, use the updated user data
                        if (updateResult.success && updateResult.user) {
                            Object.assign(result.user, updateResult.user);
                        }
                    }
                } else if (result.user) {
                    // Returning user - save backend data to localStorage
                    const userInfo = {
                        ime: result.user.ime || '',
                        priimek: result.user.priimek || '',
                        razred: result.user.razred || '',
                        sola: result.user.sola || '',
                        podrocje: result.user.podrocje || '',
                        email: result.user.email || '',
                    };
                    // Only save if we have at least an email
                    if (userInfo.email) {
                        localStorage.setItem("userInfo", JSON.stringify(userInfo));
                    }
                }
                
                if (pendingFormId) {
                    // User was trying to access a form - redirect there
                    targetUrl = `/checklist/${pendingFormId}`;
                    localStorage.removeItem('pendingFormId');
                    setMessage("Uspešno prijavljen! Preusmerjanje na obrazec...");
                } else if (result.user?.role === 'admin') {
                    // Admin user - go to form builder
                    targetUrl = "/form_builder";
                    setMessage("Uspešno prijavljen! Preusmerjanje na urejevalnik...");
                } else {
                    // Regular user without pending form - go to selector
                    targetUrl = "/";
                    setMessage("Uspešno prijavljen! Preusmerjanje...");
                }
                
                // Clean up the sign-in process flag
                sessionStorage.removeItem('signInProcessed');
                
                // Force immediate redirect using navigate instead of window.location
                setTimeout(() => {
                    navigate(targetUrl, { replace: true });
                }, 1000);
            } else {
                setStatus("error");
                setMessage(result.error || "Napaka pri prijavi");
                // Allow retry by removing the flag
                sessionStorage.removeItem('signInProcessed');
            }
        };

    useEffect(() => {
        // Check if this is a valid email sign-in link
        if (!isEmailSignInLink()) {
            setStatus("error");
            setMessage("Neveljavna povezava za prijavo");
            return;
        }

        // Prevent multiple sign-in attempts
        const hasProcessed = sessionStorage.getItem('signInProcessed');
        if (hasProcessed === 'true') {
            // Already processed, just redirect
            navigate('/', { replace: true });
            return;
        }

        sessionStorage.setItem('signInProcessed', 'true');
        processSignIn();
        
        // Cleanup on unmount
        return () => {
            sessionStorage.removeItem('signInProcessed');
        };
    }, []);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailInput.trim()) return;
        
        setIsSubmitting(true);
        setStatus("loading");
        setMessage("Dokončevanje prijave...");
        await processSignIn(emailInput.trim());
        setIsSubmitting(false);
    };

    // Email confirmation form
    if (status === "needs-email") {
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
                                <Mail className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-slate-900">
                                Potrdite email
                            </CardTitle>
                            <p className="text-slate-600 mt-2 text-sm">
                                Prijava z druge naprave ali brskalnika.<br />
                                Prosimo, vnesite email s katerim ste se prijavili.
                            </p>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-email">Email naslov</Label>
                                    <Input
                                        id="confirm-email"
                                        type="email"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        placeholder="vas@email.com"
                                        className="border-ocean-frost"
                                        autoFocus
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !emailInput.trim()}
                                    className="w-full bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf text-white"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Preverjanje...
                                        </>
                                    ) : (
                                        "Potrdi in prijavi"
                                    )}
                                </Button>
                            </form>
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
                        {status === "loading" && (
                            <div className="w-16 h-16 bg-gradient-to-r from-ocean-deep to-ocean-teal rounded-full flex items-center justify-center mx-auto mb-4">
                                <Loader2 className="h-8 w-8 text-white animate-spin" />
                            </div>
                        )}
                        {status === "success" && (
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="h-8 w-8 text-white" />
                            </div>
                        )}
                        {status === "error" && (
                            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircle className="h-8 w-8 text-white" />
                            </div>
                        )}
                        <CardTitle className="text-2xl font-bold text-slate-900">
                            {status === "loading" && "Prijava v teku..."}
                            {status === "success" && "Prijava uspešna!"}
                            {status === "error" && "Napaka pri prijavi"}
                        </CardTitle>
                        <p className="text-slate-600 mt-2">
                            {message}
                        </p>
                    </CardHeader>

                    <CardContent className="text-center">
                        {status === "success" && (
                            <p className="text-slate-500 text-sm">
                                Preusmerjanje...
                            </p>
                        )}
                        {status === "error" && (
                            <button
                                onClick={() => navigate("/")}
                                className="text-ocean-teal hover:underline text-sm"
                            >
                                Nazaj na začetno stran
                            </button>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

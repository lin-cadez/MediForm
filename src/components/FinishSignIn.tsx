"use client"

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { completeEmailSignIn } from "@/lib/firebaseAuth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, AlertCircle, Mail } from "lucide-react"
import { motion } from "framer-motion"

export default function FinishSignIn() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'need-email'>('loading')
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const finishSignIn = async () => {
            // Get email from URL params (encoded in the link)
            const emailFromUrl = searchParams.get('email')
            
            const result = await completeEmailSignIn(emailFromUrl ? decodeURIComponent(emailFromUrl) : undefined)
            
            if (result.success) {
                // Store session info
                localStorage.setItem("authStatus", "email")
                
                // Store session token if provided
                if (result.user?.sessionToken) {
                    localStorage.setItem("mediform_session_token", result.user.sessionToken)
                }
                
                // Store user info directly from the sign-in result
                if (result.user) {
                    const userInfo = {
                        ime: result.user.ime || "",
                        priimek: result.user.priimek || "",
                        razred: result.user.razred || "",
                        sola: result.user.sola || "",
                        podrocje: result.user.podrocje || "",
                        email: result.user.email || ""
                    }
                    localStorage.setItem("userInfo", JSON.stringify(userInfo))
                    console.log("User info stored:", userInfo)
                }
                
                setStatus('success')
                
                // Redirect to main page after short delay
                setTimeout(() => {
                    navigate('/', { replace: true })
                }, 1500)
            } else if (result.needsEmail) {
                setStatus('need-email')
            } else {
                setError(result.error || "Napaka pri prijavi")
                setStatus('error')
            }
        }

        finishSignIn()
    }, [navigate, searchParams])

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return

        setIsSubmitting(true)
        const result = await completeEmailSignIn(email.trim())
        
        if (result.success) {
            localStorage.setItem("authStatus", "email")
            
            if (result.user?.sessionToken) {
                localStorage.setItem("mediform_session_token", result.user.sessionToken)
            }
            
            // Store user info directly from the sign-in result
            if (result.user) {
                const userInfo = {
                    ime: result.user.ime || "",
                    priimek: result.user.priimek || "",
                    razred: result.user.razred || "",
                    sola: result.user.sola || "",
                    podrocje: result.user.podrocje || "",
                    email: result.user.email || email.trim()
                }
                localStorage.setItem("userInfo", JSON.stringify(userInfo))
                console.log("User info stored:", userInfo)
            }
            
            setStatus('success')
            setTimeout(() => {
                navigate('/', { replace: true })
            }, 1500)
        } else {
            setError(result.error || "Napaka pri prijavi")
            setStatus('error')
        }
        
        setIsSubmitting(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full max-w-md shadow-xl border-0">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-2xl font-bold text-slate-800">
                            {status === 'loading' && "Prijava v teku..."}
                            {status === 'success' && "Prijava uspešna!"}
                            {status === 'error' && "Napaka pri prijavi"}
                            {status === 'need-email' && "Potrdite email"}
                        </CardTitle>
                        <CardDescription>
                            {status === 'loading' && "Preverjamo vašo povezavo za prijavo"}
                            {status === 'success' && "Preusmerjamo vas na glavno stran"}
                            {status === 'error' && "Prišlo je do napake"}
                            {status === 'need-email' && "Vnesite email, s katerim ste se registrirali"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                        {status === 'loading' && (
                            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                        )}
                        
                        {status === 'success' && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", duration: 0.5 }}
                            >
                                <CheckCircle2 className="h-16 w-16 text-green-500" />
                            </motion.div>
                        )}
                        
                        {status === 'error' && (
                            <div className="text-center space-y-4">
                                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                                <p className="text-sm text-red-600">{error}</p>
                                <Button 
                                    onClick={() => navigate('/', { replace: true })}
                                    variant="outline"
                                >
                                    Nazaj na prijavo
                                </Button>
                            </div>
                        )}
                        
                        {status === 'need-email' && (
                            <form onSubmit={handleEmailSubmit} className="w-full space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email naslov</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="vas@email.com"
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                                <Button 
                                    type="submit" 
                                    className="w-full"
                                    disabled={isSubmitting || !email.trim()}
                                >
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Potrdi prijavo
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

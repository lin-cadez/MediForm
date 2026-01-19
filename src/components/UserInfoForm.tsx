"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { User, Loader2, CheckCircle2, ArrowLeft, UserX, Mail, WifiOff, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { sendLoginEmail } from "@/lib/firebaseAuth"
import { pingBackend } from "@/lib/api"
import Footer from "./Footer"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserInfo {
    ime: string
    priimek: string
    razred: string
    sola: string
    podrocje: string
    email: string
}

interface UserInfoFormProps {
    onSubmit: (info: UserInfo) => void;
}

type Step = 'login' | 'user-info' | 'email-sent';

export default function UserInfoForm({ onSubmit }: UserInfoFormProps) {
  const [step, setStep] = useState<Step>('login')
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isBackendAvailable, setIsBackendAvailable] = useState(true)
  const [isCheckingBackend, setIsCheckingBackend] = useState(true)
  
  const [userInfo, setUserInfo] = useState<UserInfo>({
    ime: "",
    priimek: "",
    razred: "",
    sola: "Srednja zdravstvena šola Ljubljana, Poljanska cesta 61, 1000 Ljubljana",
    podrocje: "",
    email: "",
  });
  const [errors, setErrors] = useState<Partial<UserInfo>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [authStatus, setAuthStatus] = useState<'guest' | 'anonymous' | 'email' | null>(null)

  // Check backend availability on mount
  useEffect(() => {
    const checkBackend = async () => {
      // Skip backend check if already in anonymous mode
      const storedAuthStatus = localStorage.getItem("authStatus");
      if (storedAuthStatus === 'anonymous') {
        setIsBackendAvailable(false);
        setIsCheckingBackend(false);
        return;
      }
      
      setIsCheckingBackend(true)
      
      // Check if online mode is disabled due to 429 error
      const onlineDisabled = localStorage.getItem("online_disabled");
      if (onlineDisabled === "true") {
        setIsBackendAvailable(false);
        setIsCheckingBackend(false);
        return;
      }
      
      const available = await pingBackend()
      setIsBackendAvailable(available)
      setIsCheckingBackend(false)
    }
    checkBackend()
  }, [])

  useEffect(() => {
    const status = localStorage.getItem("authStatus");
    if (status === 'guest' || status === 'anonymous') {
      setAuthStatus(status as 'guest' | 'anonymous');
      setStep('user-info');
    } else if (status === 'email') {
      setAuthStatus('email');
      setStep('user-info');
    }

    const savedInfo = localStorage.getItem("userInfo");
    if (savedInfo) {
      setUserInfo(JSON.parse(savedInfo));
    }
  }, []);

  // Handle email login click
  const handleEmailLoginClick = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setEmailError("Email je obvezen")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Neveljaven email naslov")
      return
    }
    
    // Check if cookie consent was given
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setEmailError("Najprej sprejmite pogoje uporabe");
      return;
    }
    
    handleEmailLogin();
  }

  // Handle anonymous login click
  const handleAnonymousClick = () => {
    // Check if cookie consent was given
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      return; // CookieConsent dialog will show
    }
    
    // Anonymous mode - set flag and go to user info
    localStorage.setItem("authStatus", "anonymous")
    setAuthStatus("anonymous")
    setStep('user-info')
  }

  // Handle email login after consent check
  const handleEmailLogin = async () => {
    setIsLoading(true)
    setEmailError(null)

    try {
      const result = await sendLoginEmail(email)
      if (result.success) {
        setUserInfo(prev => ({ ...prev, email }))
        setStep('email-sent')
      } else {
        setEmailError(result.error || "Napaka pri pošiljanju emaila")
      }
    } catch (err) {
      setEmailError("Napaka pri povezavi s strežnikom")
    }
    
    setIsLoading(false)
  }

  const validate = () => {
    const newErrors: Partial<UserInfo> = {};
    if (!userInfo.ime) newErrors.ime = "Ime je obvezno.";
    if (!userInfo.priimek) newErrors.priimek = "Priimek je obvezen.";
    if (!userInfo.razred) newErrors.razred = "Razred je obvezen.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setSaveSuccess(false);

    localStorage.setItem("userInfo", JSON.stringify(userInfo));

    setIsSaving(false);
    setSaveSuccess(true);
    
    // Call onSubmit and then redirect
    onSubmit(userInfo);
    
    // Force page reload to re-initialize App with new userInfo
    setTimeout(() => {
        window.location.href = "/";
    }, 1000);
  };

  // Email sent confirmation screen
  if (step === 'email-sent') {
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
                Preveri svoj email!
              </CardTitle>
              <CardDescription className="text-slate-600 mt-2">
                Prijavna povezava je bila poslana na:
              </CardDescription>
              <p className="text-ocean-teal font-semibold mt-1">
                {email}
              </p>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <p className="text-slate-600 text-sm">
                Klikni na povezavo v emailu za dostop do aplikacije.
              </p>
              <Button
                variant="outline"
                onClick={async () => {
                  setIsLoading(true)
                  await sendLoginEmail(email)
                  setIsLoading(false)
                }}
                disabled={isLoading}
                className="border-ocean-frost text-ocean-teal hover:bg-ocean-light"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Pošlji znova
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setStep('login')
                  setEmail("")
                  setEmailError(null)
                }}
                className="text-slate-500"
              >
                Nazaj na začetek
              </Button>
            </CardContent>
          </Card>
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0">
          <Footer />
        </div>
      </div>
    )
  }

  // User info form (after login or anonymous mode)
  if (step === 'user-info') {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm border border-ocean-frost">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-ocean-light to-ocean-frost rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-ocean-teal" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Podatki o uporabniku
              </CardTitle>
              <CardDescription className="text-slate-600 mt-2">
                Prosimo, vnesite svoje podatke za nadaljevanje.
              </CardDescription>
              {authStatus === 'anonymous' && (
                <p className="mt-4 p-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 text-sm text-left">
                  <strong>Anonimni način:</strong> Vsi podatki se hranijo samo v vašem brskalniku. Nobeni podatki niso poslani na strežnik.
                </p>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ime">Ime</Label>
                    <Input
                      id="ime"
                      value={userInfo.ime}
                      onChange={(e) => setUserInfo({ ...userInfo, ime: e.target.value })}
                      className={errors.ime ? "border-red-500" : "bg-white/80"}
                    />
                    {errors.ime && <p className="text-xs text-red-600">{errors.ime}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priimek">Priimek</Label>
                    <Input
                      id="priimek"
                      value={userInfo.priimek}
                      onChange={(e) => setUserInfo({ ...userInfo, priimek: e.target.value })}
                      className={errors.priimek ? "border-red-500" : "bg-white/80"}
                    />
                    {errors.priimek && <p className="text-xs text-red-600">{errors.priimek}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="razred">Razred</Label>
                  <Input
                    id="razred"
                    value={userInfo.razred}
                    onChange={(e) => setUserInfo({ ...userInfo, razred: e.target.value })}
                    className={errors.razred ? "border-red-500" : "bg-white/80"}
                  />
                  {errors.razred && <p className="text-xs text-red-600">{errors.razred}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sola">Šola</Label>
                  <select
                    id="sola"
                    value={userInfo.sola}
                    onChange={(e) => setUserInfo({ ...userInfo, sola: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-white/80 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                   <option value="" disabled>Izberite šolo</option>
                  <option value="Srednja zdravstvena šola Ljubljana, Poljanska cesta 61, 1000 Ljubljana">Srednja zdravstvena šola Ljubljana, Poljanska cesta 61, 1000 Ljubljana</option>
                  <option value="Srednja zdravstvena šola Jesenice, Ulica bratov Rupar 2, 4270 Jesenice">Srednja zdravstvena šola Jesenice, Ulica bratov Rupar 2, 4270 Jesenice</option>
                  <option value="Šolski center Nova Gorica – Gimnazija in zdravstvena šola, Cankarjeva ulica 10, 5000 Nova Gorica">Šolski center Nova Gorica – Gimnazija in zdravstvena šola, Cankarjeva ulica 10, 5000 Nova Gorica</option>
                  <option value="Šolski center Novo mesto – Srednja zdravstvena in kemijska šola, Šegova ulica 112, 8000 Novo mesto">Šolski center Novo mesto – Srednja zdravstvena in kemijska šola, Šegova ulica 112, 8000 Novo mesto</option>
                  <option value="Srednja zdravstvena in kozmetična šola Celje, Ipavčeva ulica 10, 3000 Celje">Srednja zdravstvena in kozmetična šola Celje, Ipavčeva ulica 10, 3000 Celje</option>
                  <option value="Srednja zdravstvena in kozmetična šola Maribor, Miloša Zidanška 3, 2000 Maribor">Srednja zdravstvena in kozmetična šola Maribor, Miloša Zidanška 3, 2000 Maribor</option>
                  <option value="Srednja zdravstvena šola Murska Sobota, Ulica dr. Vrbnjaka 2, 9000 Murska Sobota">Srednja zdravstvena šola Murska Sobota, Ulica dr. Vrbnjaka 2, 9000 Murska Sobota</option>
                  <option value="Srednja zdravstvena šola Slovenj Gradec, Gosposvetska cesta 2, 2380 Slovenj Gradec">Srednja zdravstvena šola Slovenj Gradec, Gosposvetska cesta 2, 2380 Slovenj Gradec</option>
                  <option value="Srednja šola Izola, Ulica Prekomorskih brigad 7, 6310 Izola">Srednja šola Izola, Ulica Prekomorskih brigad 7, 6310 Izola</option>

                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="podrocje">Področje</Label>
                  <Input
                    id="podrocje"
                    value={userInfo.podrocje}
                    onChange={(e) => setUserInfo({ ...userInfo, podrocje: e.target.value })}
                    placeholder="Npr. Zdravstvena nega"
                    className="bg-white/80"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSaving || saveSuccess}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : saveSuccess ? (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  ) : null}
                  {saveSuccess ? "Shranjeno!" : "Shrani in nadaljuj"}
                </Button>

                {authStatus === 'anonymous' && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      localStorage.removeItem("authStatus")
                      setAuthStatus(null)
                      setStep('login')
                    }}
                    className="w-full text-slate-500"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Nazaj na prijavo
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0">
          <Footer />
        </div>
      </div>
    )
  }

  // Initial login screen
  return (
    <>
      <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm border border-ocean-frost">
            <CardHeader className="text-center pb-2">
              <div className="w-48 bg-gradient-to-r from-ocean-deep to-ocean-teal rounded-lg flex items-center justify-center mx-auto pt-4 pb-2 px-3">
                <img
                  src="/logo_with_text.png"
                  alt="MediForm logo"
                  className="w-full max-h-16 object-contain block"
                />
              </div>
              <CardDescription className="text-slate-600 text-sm mt-4">
                Vnesite svoj email za prijavo ali nadaljujte anonimno
              </CardDescription>
              
              {/* Offline mode warning */}
              {!isCheckingBackend && !isBackendAvailable && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700">
                    <WifiOff className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm font-medium text-left">
                      Dostop do računa je zaradi vzdrževanja onemogočen. Aplikacijo lahko uporabljate samo v načinu "Anonimno".
                    </p>
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent>
              <form onSubmit={handleEmailLoginClick} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-ocean-teal" />
                    Email naslov
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setEmailError(null)
                    }}
                    placeholder="vas@email.com"
                    className={`transition-all duration-200 focus:ring-2 focus:ring-ocean-surf/20 focus:border-ocean-surf ${
                      emailError ? "border-red-300 focus:border-red-300 focus:ring-red-500/20" : "border-ocean-frost"
                    }`}
                  />
                  {emailError && <p className="text-sm text-red-600">{emailError}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || isCheckingBackend || !isBackendAvailable}
                  className={`w-full py-3 text-lg font-medium ${
                    !isBackendAvailable 
                      ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf text-white'
                  }`}
                >
                  {isCheckingBackend ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preverjanje povezave...
                    </>
                  ) : isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Pošiljanje...
                    </>
                  ) : !isBackendAvailable ? (
                    <>
                      <WifiOff className="mr-2 h-4 w-4" />
                      Prijava z emailom ni na voljo
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Prijava z emailom
                    </>
                  )}
                </Button>
                
                {!isBackendAvailable && localStorage.getItem("online_disabled") === "true" && (
                  <Alert className="mt-4 bg-orange-50 border-orange-200">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-700 text-sm">
                      Online način je trenutno onemogočen zaradi preobremenitve strežnika. Prosimo uporabite anonimni način.
                    </AlertDescription>
                  </Alert>
                )}
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/90 px-2 text-muted-foreground">
                    Ali
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-ocean-frost text-ocean-teal hover:bg-ocean-light"
                onClick={handleAnonymousClick}
              >
                <UserX className="mr-2 h-4 w-4" />
                Nadaljuj anonimno
              </Button>
              
              <p className="mt-4 text-xs text-center text-gray-500">
                Anonimni način ne pošilja nobenih podatkov iz naprave. Vse ostane na napravi.
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0">
          <Footer />
        </div>
      </div>
    </>
  )
}
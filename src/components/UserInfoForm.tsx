"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { User, Loader2, CheckCircle2, Mail } from "lucide-react"
import { motion } from "framer-motion"
import Footer from "./Footer"

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

type Step = 'email' | 'user-info';

// Helper to get/set cookies
const setCookie = (name: string, value: string, days: number = 365) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
};

export default function UserInfoForm({ onSubmit }: UserInfoFormProps) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
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

  useEffect(() => {
    // Check if user already has saved info
    const savedInfo = localStorage.getItem("userInfo");
    const savedEmail = getCookie("userEmail");
    
    if (savedInfo) {
      const parsed = JSON.parse(savedInfo);
      setUserInfo(parsed);
      if (parsed.email) {
        setEmail(parsed.email);
        // User already set up, go directly to user-info for review/edit
        setStep('user-info');
      }
    } else if (savedEmail) {
      setEmail(savedEmail);
      setUserInfo(prev => ({ ...prev, email: savedEmail }));
      setStep('user-info');
    }
  }, []);

  // Handle email submission
  const handleEmailSubmit = (e: React.FormEvent) => {
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
    
    setIsLoading(true)
    
    // Save email to cookie
    setCookie("userEmail", email);
    setUserInfo(prev => ({ ...prev, email }));
    
    setTimeout(() => {
      setIsLoading(false)
      setStep('user-info')
    }, 300)
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

    // Save to localStorage (local only, no server)
    const infoToSave = { ...userInfo, email };
    localStorage.setItem("userInfo", JSON.stringify(infoToSave));
    setCookie("userEmail", email);

    setIsSaving(false);
    setSaveSuccess(true);
    
    // Call onSubmit and then redirect
    onSubmit(infoToSave);
    
    // Force page reload to re-initialize App with new userInfo
    setTimeout(() => {
        window.location.href = "/";
    }, 1000);
  };

  // User info form (after email entry)
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
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-ocean-teal" />
                    Email naslov
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-slate-100 text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-xs text-ocean-teal hover:underline"
                  >
                    Spremeni email
                  </button>
                </div>

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

                <Button type="submit" className="w-full bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf text-white" disabled={isSaving || saveSuccess}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : saveSuccess ? (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  ) : null}
                  {saveSuccess ? "Shranjeno!" : "Shrani in nadaljuj"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Initial email entry screen
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
                Vnesite svoj email za nadaljevanje
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                  disabled={isLoading}
                  className="w-full py-3 text-lg font-medium bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Nalaganje...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Nadaljuj
                    </>
                  )}
                </Button>
              </form>
              
              <p className="mt-4 text-xs text-center text-gray-500">
                Vsi podatki se hranijo lokalno na vaši napravi. Podatki se ne pošiljajo na strežnik.
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

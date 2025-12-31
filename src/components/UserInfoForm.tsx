"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { User, GraduationCap, School, Shield, Mail, Loader2, CheckCircle2, Building2, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { sendLoginEmail } from "@/lib/firebaseAuth"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://medi-form-backend.vercel.app/api';

interface UserInfo {
  ime: string
  priimek: string
  razred: string
  sola: string
  podrocje: string
  email: string
}

interface UserInfoFormProps {
  onSubmit: (userInfo: UserInfo) => void
}

// Check if user exists by email
const checkUserExists = async (email: string): Promise<{ exists: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/exists?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    if (data.success) {
      return { exists: data.exists };
    }
    return { exists: false, error: data.error || "Napaka pri preverjanju" };
  } catch (error) {
    console.error("Error checking user:", error);
    return { exists: false, error: "Napaka pri preverjanju uporabnika" };
  }
};

type Step = 'email' | 'register' | 'email-sent' | 'admin-login' | 'admin-email-sent';

export default function UserInfoForm({ onSubmit: _onSubmit }: UserInfoFormProps) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isCheckingUser, setIsCheckingUser] = useState(false)
  
  const [userInfo, setUserInfo] = useState<UserInfo>({
    ime: "",
    priimek: "",
    razred: "",
    sola: "Srednja zdravstvena šola Ljubljana, Poljanska cesta 61, 1000 Ljubljana",
    podrocje: "",
    email: "",
  })

  const [errors, setErrors] = useState<Partial<UserInfo>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Step 1: Check email
  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError(null)

    if (!email.trim()) {
      setEmailError("Email je obvezen")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Neveljaven email naslov")
      return
    }

    setIsCheckingUser(true)
    
    try {
      const result = await checkUserExists(email)
      
      if (result.exists) {
        // User exists - send login link directly
        const sendResult = await sendLoginEmail(email)
        if (sendResult.success) {
          setStep('email-sent')
        } else {
          setEmailError(sendResult.error || "Napaka pri pošiljanju emaila")
        }
      } else {
        // User doesn't exist - show registration form
        setUserInfo(prev => ({ ...prev, email }))
        setStep('register')
      }
    } catch (err) {
      setEmailError("Napaka pri povezavi s strežnikom")
    }
    
    setIsCheckingUser(false)
  }

  // Step 2: Submit registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const newErrors: Partial<UserInfo> = {}
    if (!userInfo.ime.trim()) newErrors.ime = "Ime je obvezno"
    if (!userInfo.priimek.trim()) newErrors.priimek = "Priimek je obvezen"
    if (!userInfo.razred.trim()) newErrors.razred = "Razred je obvezen"
    if (!userInfo.sola.trim()) newErrors.sola = "Šola je obvezna"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      const result = await sendLoginEmail(userInfo.email)
      if (result.success) {
        // Save user info to localStorage (will be used after login)
        localStorage.setItem("userInfo", JSON.stringify(userInfo))
        setStep('email-sent')
      } else {
        setErrors({ email: result.error || "Napaka pri pošiljanju emaila" })
      }
    } catch (err) {
      setErrors({ email: "Napaka pri povezavi s strežnikom" })
    }
    setIsLoading(false)
  }

  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Admin login handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError(null)

    if (!email.trim()) {
      setEmailError("Email je obvezen")
      return
    }

    setIsLoading(true)
    try {
      const result = await sendLoginEmail(email)
      if (result.success) {
        setStep('admin-email-sent')
      } else {
        setEmailError(result.error || "Napaka pri pošiljanju emaila")
      }
    } catch (err) {
      setEmailError("Napaka pri povezavi s strežnikom")
    }
    setIsLoading(false)
  }

  // Reset to start
  const resetToStart = () => {
    setStep('email')
    setEmail("")
    setEmailError(null)
    setUserInfo({
      ime: "",
      priimek: "",
      razred: "",
      sola: "Srednja zdravstvena šola Ljubljana, Poljanska cesta 61, 1000 Ljubljana",
      podrocje: "",
      email: "",
    })
    setErrors({})
  }

  // Email sent confirmation (for both existing users and new registrations)
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
              <p className="text-slate-600 mt-2">
                Prijavna povezava je bila poslana na:
              </p>
              <p className="text-ocean-teal font-semibold mt-1">
                {userInfo.email || email}
              </p>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <p className="text-slate-600 text-sm">
                Klikni na povezavo v emailu za dostop do aplikacije.
              </p>
              {userInfo.ime && (
                <div className="bg-ocean-light/30 rounded-lg p-3 text-left text-sm">
                  <p><strong>Ime:</strong> {userInfo.ime} {userInfo.priimek}</p>
                  <p><strong>Razred:</strong> {userInfo.razred}</p>
                </div>
              )}
              <Button
                variant="outline"
                onClick={async () => {
                  setIsLoading(true)
                  await sendLoginEmail(userInfo.email || email)
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
                onClick={resetToStart}
                className="text-slate-500"
              >
                Nazaj na začetek
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Admin email sent confirmation
  if (step === 'admin-email-sent') {
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
                onClick={resetToStart}
                className="text-slate-500"
              >
                Nazaj
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Admin login screen
  if (step === 'admin-login') {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm border border-ocean-frost">
            <CardHeader className="text-center mt-4">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Prijava administratorja
              </CardTitle>
              <p className="text-slate-600 mt-2">Vnesite svoj email za prijavo brez gesla.</p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-ocean-teal" />
                    Email naslov
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@email.com"
                    className="transition-all duration-200 focus:ring-2 focus:ring-ocean-surf/20 focus:border-ocean-surf border-ocean-frost"
                  />
                </div>

                {emailError && (
                  <p className="text-sm text-red-600 text-center">{emailError}</p>
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

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setStep('email')
                    setEmailError(null)
                  }}
                  className="w-full text-slate-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Nazaj
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Registration form (for new users)
  if (step === 'register') {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm border border-ocean-frost">
            <CardHeader className="text-center pb-1 pt-4">
              <CardTitle className="text-xl font-bold text-slate-900">
                Registracija novega uporabnika
              </CardTitle>
              <p className="text-slate-600 mt-1 text-sm">
                Email: <span className="text-ocean-teal font-medium">{userInfo.email}</span>
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ime" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-ocean-teal" />
                    Ime
                  </Label>
                  <Input
                    id="ime"
                    type="text"
                    value={userInfo.ime}
                    onChange={(e) => handleInputChange("ime", e.target.value)}
                    placeholder="Vnesite vaše ime"
                    className={`transition-all duration-200 focus:ring-2 focus:ring-ocean-surf/20 focus:border-ocean-surf ${
                      errors.ime ? "border-red-300 focus:border-red-300 focus:ring-red-500/20" : "border-ocean-frost"
                    }`}
                  />
                  {errors.ime && <p className="text-sm text-red-600">{errors.ime}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priimek" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-ocean-teal" />
                    Priimek
                  </Label>
                  <Input
                    id="priimek"
                    type="text"
                    value={userInfo.priimek}
                    onChange={(e) => handleInputChange("priimek", e.target.value)}
                    placeholder="Vnesite vaš priimek"
                    className={`transition-all duration-200 focus:ring-2 focus:ring-ocean-surf/20 focus:border-ocean-surf ${
                      errors.priimek ? "border-red-300 focus:border-red-300 focus:ring-red-500/20" : "border-ocean-frost"
                    }`}
                  />
                  {errors.priimek && <p className="text-sm text-red-600">{errors.priimek}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="razred" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-ocean-teal" />
                    Razred
                  </Label>
                  <Input
                    id="razred"
                    type="text"
                    value={userInfo.razred}
                    onChange={(e) => handleInputChange("razred", e.target.value)}
                    placeholder="Vnesite vaš razred (npr. 3.A)"
                    className={`transition-all duration-200 focus:ring-2 focus:ring-ocean-surf/20 focus:border-ocean-surf ${
                      errors.razred ? "border-red-300 focus:border-red-300 focus:ring-red-500/20" : "border-ocean-frost"
                    }`}
                  />
                  {errors.razred && <p className="text-sm text-red-600">{errors.razred}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sola" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <School className="h-4 w-4 text-ocean-teal" />
                    Šola
                  </Label>
                  <select
                    id="sola"
                    value={userInfo.sola}
                    onChange={e => handleInputChange("sola", e.target.value)}
                    className={`transition-all duration-200 focus:ring-2 focus:ring-ocean-surf/20 focus:border-ocean-surf w-full rounded-md h-10 px-3 py-2 text-sm bg-white border ${
                      errors.sola ? "border-red-300 focus:border-red-300 focus:ring-red-500/20" : "border-ocean-frost"
                    }`}
                  >
                    <option value="" disabled>Izberite šolo</option>
                    <option value="Srednja zdravstvena šola Ljubljana, Poljanska cesta 61, 1000 Ljubljana">Srednja zdravstvena šola Ljubljana</option>
                    <option value="Šolski center Nova Gorica, Gimnazija in zdravstvena šola, Cankarjeva ulica 10, 5000 Nova Gorica">ŠC Nova Gorica - Zdravstvena šola</option>
                    <option value="Šolski center Novo mesto, Srednja zdravstvena in kemijska šola, Šegova ulica 112, 8000 Novo mesto">ŠC Novo mesto - Zdravstvena šola</option>
                    <option value="Šolski center Slovenj Gradec, Srednja zdravstvena šola, Gosposvetska ulica 2, 2380 Slovenj Gradec">ŠC Slovenj Gradec - Zdravstvena šola</option>
                    <option value="Srednja šola za farmacijo, kozmetiko in zdravstvo, Zdravstvena pot 1, 1000 Ljubljana">SŠ za farmacijo, kozmetiko in zdravstvo</option>
                    <option value="Srednja zdravstvena in kozmetična šola Maribor, Trg Miloša Zidanška 3, 2000 Maribor">SZŠ Maribor</option>
                    <option value="Srednja zdravstvena šola Murska Sobota, Ulica dr. Vrbnjaka 2, 9000 Murska Sobota">SZŠ Murska Sobota</option>
                    <option value="Srednja zdravstvena in kozmetična šola Celje, Ipavčeva ulica 10, 3000 Celje">SZŠ Celje</option>

                  </select>
                  {errors.sola && <p className="text-sm text-red-600">{errors.sola}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="podrocje" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-ocean-teal" />
                    Področje izvajanja zdravstvene nege
                  </Label>
                  <Input
                    id="podrocje"
                    type="text"
                    value={userInfo.podrocje}
                    onChange={(e) => handleInputChange("podrocje", e.target.value)}
                    placeholder="npr. Interna klinika, UKC Ljubljana"
                    className="transition-all duration-200 focus:ring-2 focus:ring-ocean-surf/20 focus:border-ocean-surf border-ocean-frost"
                  />
                </div>

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
                    "Registriraj se"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetToStart}
                  className="w-full text-slate-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Nazaj
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Initial email entry step
  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm border border-ocean-frost">
          <CardHeader className="text-center pb-1 pt-2">
            <div className="w-48 bg-gradient-to-r from-ocean-deep to-ocean-teal rounded-lg flex items-center justify-center mx-auto pt-4 pb-2 px-3">
              <img
                src="/logo_with_text.png"
                alt="MediForm logo"
                className="w-full max-h-16 object-contain block"
              />
            </div>
            <p className="text-slate-600 text-sm">
              Vnesite svoj email za prijavo ali registracijo
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleEmailCheck} className="space-y-6 pt-2">
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
                disabled={isCheckingUser}
                className="w-full bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf text-white py-3 text-lg font-medium"
              >
                {isCheckingUser ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preverjanje...
                  </>
                ) : (
                  "Nadaljuj"
                )}
              </Button>


              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('admin-login')}
                className="w-full flex items-center justify-center gap-2 border-ocean-frost text-ocean-teal hover:bg-ocean-light"
              >
                <Shield className="h-4 w-4" />
                Nadaljuj kot administrator
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
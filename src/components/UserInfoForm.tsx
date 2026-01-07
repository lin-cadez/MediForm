"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { User, Loader2, CheckCircle2, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

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

export default function UserInfoForm({ onSubmit }: UserInfoFormProps) {
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
  const [authStatus, setAuthStatus] = useState<'guest' | 'email' | null>(null)

  useEffect(() => {
    const status = localStorage.getItem("authStatus");
    setAuthStatus(status as 'guest' | 'email' | null);

    const savedInfo = localStorage.getItem("userInfo");
    if (savedInfo) {
      setUserInfo(JSON.parse(savedInfo));
    }
  }, []);

  const validate = () => {
    const newErrors: Partial<UserInfo> = {};
    if (!userInfo.ime) newErrors.ime = "Ime je obvezno.";
    if (!userInfo.priimek) newErrors.priimek = "Priimek je obvezen.";
    if (!userInfo.razred) newErrors.razred = "Razred je obvezen.";
    if (authStatus === 'email' && !userInfo.email) {
      newErrors.email = "Email je obvezen za prijavljene uporabnike.";
    }
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
              
              {authStatus === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    className={errors.email ? "border-red-500" : "bg-white/80"}
                    disabled // Email is usually not editable here
                  />
                  {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="sola">Šola</Label>
                <Input
                  id="sola"
                  value={userInfo.sola}
                  onChange={(e) => setUserInfo({ ...userInfo, sola: e.target.value })}
                  className="bg-white/80"
                />
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
                ) : (
                  <ArrowLeft className="mr-2 h-4 w-4" />
                )}
                {saveSuccess ? "Shranjeno!" : "Shrani in nadaljuj"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
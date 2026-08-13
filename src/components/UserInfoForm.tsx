"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { User, Loader2, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { saveStudentProfile } from "@/lib/api"

interface UserInfo {
    ime: string
    priimek: string
    razred: string
    sola: string
    podrocje: string
}

interface UserInfoFormProps {
    onSubmit: (info: UserInfo) => void;
}

const SCHOOL_NAME = "Srednja zdravstvena šola Ljubljana, Poljanska cesta 61, 1000 Ljubljana";

export default function UserInfoForm({ onSubmit }: UserInfoFormProps) {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    ime: "",
    priimek: "",
    razred: "",
    sola: SCHOOL_NAME,
    podrocje: "",
  });
  const [errors, setErrors] = useState<Partial<UserInfo>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    // Check if user already has saved info
    const savedInfo = localStorage.getItem("userInfo");
    
    if (savedInfo) {
      const parsed = JSON.parse(savedInfo);
      const { email: _removedEmail, ...infoWithoutEmail } = parsed;
      void _removedEmail;
      setUserInfo({
        ime: infoWithoutEmail.ime || "",
        priimek: infoWithoutEmail.priimek || "",
        razred: infoWithoutEmail.razred || "",
        sola: SCHOOL_NAME,
        podrocje: infoWithoutEmail.podrocje || "",
      });
    }
  }, []);

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

    // Save locally and send only the student profile to the backend.
    const infoToSave = { ...userInfo, sola: SCHOOL_NAME };
    localStorage.setItem("userInfo", JSON.stringify(infoToSave));
    await saveStudentProfile(infoToSave);

    setIsSaving(false);
    setSaveSuccess(true);
    
    // Call onSubmit and then redirect
    onSubmit(infoToSave);
    
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

                <div className="space-y-2">
                  <Label htmlFor="sola">Šola</Label>
                  <select
                    id="sola"
                    value={userInfo.sola}
                    onChange={() => setUserInfo({ ...userInfo, sola: SCHOOL_NAME })}
                    className="flex h-9 w-full rounded-md border border-input bg-white/80 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value={SCHOOL_NAME}>{SCHOOL_NAME}</option>
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

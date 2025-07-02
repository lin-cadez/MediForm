"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { User, GraduationCap, FileText } from "lucide-react"
import { motion } from "framer-motion"

interface UserInfo {
  ime: string
  priimek: string
  razred: string
}

interface UserInfoFormProps {
  onSubmit: (userInfo: UserInfo) => void
}

export default function UserInfoForm({ onSubmit }: UserInfoFormProps) {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    ime: "",
    priimek: "",
    razred: "",
  })

  const [errors, setErrors] = useState<Partial<UserInfo>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const newErrors: Partial<UserInfo> = {}
    if (!userInfo.ime.trim()) newErrors.ime = "Ime je obvezno"
    if (!userInfo.priimek.trim()) newErrors.priimek = "Priimek je obvezen"
    if (!userInfo.razred.trim()) newErrors.razred = "Razred je obvezen"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Save to localStorage
    localStorage.setItem("userInfo", JSON.stringify(userInfo))
    onSubmit(userInfo)
  }

  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm border border-blue-100">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Dobrodošli!
            </CardTitle>
            <p className="text-slate-600 mt-2">Prosimo, vnesite svoje podatke za začetek uporabe aplikacije.</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ime" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-violet-600" />
                  Ime
                </Label>
                <Input
                  id="ime"
                  type="text"
                  value={userInfo.ime}
                  onChange={(e) => handleInputChange("ime", e.target.value)}
                  placeholder="Vnesite vaše ime"
                  className={`transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 ${
                    errors.ime ? "border-red-300 focus:border-red-300 focus:ring-red-500/20" : "border-violet-200"
                  }`}
                />
                {errors.ime && <p className="text-sm text-red-600">{errors.ime}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priimek" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-violet-600" />
                  Priimek
                </Label>
                <Input
                  id="priimek"
                  type="text"
                  value={userInfo.priimek}
                  onChange={(e) => handleInputChange("priimek", e.target.value)}
                  placeholder="Vnesite vaš priimek"
                  className={`transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 ${
                    errors.priimek ? "border-red-300 focus:border-red-300 focus:ring-red-500/20" : "border-violet-200"
                  }`}
                />
                {errors.priimek && <p className="text-sm text-red-600">{errors.priimek}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="razred" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-violet-600" />
                  Razred
                </Label>
                <Input
                  id="razred"
                  type="text"
                  value={userInfo.razred}
                  onChange={(e) => handleInputChange("razred", e.target.value)}
                  placeholder="Vnesite vaš razred (npr. 3.A)"
                  className={`transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 ${
                    errors.razred ? "border-red-300 focus:border-red-300 focus:ring-red-500/20" : "border-violet-200"
                  }`}
                />
                {errors.razred && <p className="text-sm text-red-600">{errors.razred}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white py-3 text-lg font-medium"
              >
                Začni z uporabo
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

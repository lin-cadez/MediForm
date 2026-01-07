"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sendLoginEmail } from "@/lib/firebaseAuth";

interface UserLoginProps {
  formId?: string;
}

export default function UserLogin({ formId }: UserLoginProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGdprPopup, setShowGdprPopup] = useState(false);
  const [loginType, setLoginType] = useState<"email" | "guest" | null>(null);

  const handleEmailLoginClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Vnesite email naslov.");
      return;
    }
    setLoginType("email");
    setShowGdprPopup(true);
  };

  const handleGuestLoginClick = () => {
    setLoginType("guest");
    setShowGdprPopup(true);
  };

  const handleGdprAgree = async () => {
    setShowGdprPopup(false);
    if (loginType === "guest") {
      localStorage.setItem("authStatus", "guest");
      // Force a full page reload to re-initialize App state
      window.location.href = formId ? `/user-info` : "/user-info";
      return;
    }

    // Handle email login
    setError(null);
    setIsLoading(true);

    try {
      // Store the formId for redirect after login (if provided)
      if (formId) {
        localStorage.setItem("pendingFormId", formId);
      }

      const result = await sendLoginEmail(email);

      if (result.success) {
        setLinkSent(true);
      } else {
        setError(result.error || "Napaka pri pošiljanju povezave");
      }
    } catch (err) {
      setError("Prišlo je do napake. Poskusite znova.");
    } finally {
      setIsLoading(false);
    }
  };

  if (linkSent) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-ocean-light to-ocean-frost rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-ocean-teal" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Preveri svoj email!
            </CardTitle>
            <CardDescription className="text-slate-600 mt-2">
              Poslali smo povezavo za dostop na <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-ocean-light/30 border-ocean-frost">
              <Mail className="h-4 w-4 text-ocean-teal" />
              <AlertDescription className="text-slate-700">
                Klikni na povezavo v emailu za dostop do obrazca. Povezava velja 24 ur.
              </AlertDescription>
            </Alert>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setLinkSent(false);
                setEmail("");
              }}
            >
              Uporabi drug email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-ocean-light to-ocean-frost rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-ocean-teal" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Dostop do obrazca
            </CardTitle>
            <CardDescription className="text-slate-600 mt-2">
              Vnesite vaš email naslov za dostop do obrazca ali nadaljujte kot
              gost.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleEmailLoginClick} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ime@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/80"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && loginType === "email" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Prijava z emailom
              </Button>
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
              variant="secondary"
              className="w-full"
              onClick={handleGuestLoginClick}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Prijava kot gost
            </Button>
            <p className="mt-4 text-xs text-center text-gray-500">
              Način za goste ne pošilja nobenih podatkov iz naprave. Vse ostane
              na napravi.
            </p>
          </CardContent>
        </Card>
      </div>
      <Dialog open={showGdprPopup} onOpenChange={setShowGdprPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Strinjanje s pogoji</DialogTitle>
            <DialogDescription>
              Za nadaljevanje se morate strinjati s pogoji uporabe in
              nastavitvami zasebnosti.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm">
            <p>
              S klikom na &quot;Strinjam se&quot; potrjujete, da ste prebrali in
              se strinjate z našimi{" "}
              <a
                href="/PogojiUporabe"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600 hover:text-blue-800"
              >
                Pogoji uporabe
              </a>{" "}
              in{" "}
              <a
                href="/Zasebnost"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600 hover:text-blue-800"
              >
                Politiko zasebnosti
              </a>
              .
            </p>
            {loginType === "guest" && (
              <p className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                Nadaljujete kot gost. Vsi podatki bodo shranjeni samo na vaši
                napravi in ne bodo poslani na naše strežnike.
              </p>
            )}
            {loginType === "email" && (
              <p className="mt-4 p-3 bg-blue-100 border-l-4 border-blue-500 text-blue-700">
                Nadaljujete s prijavo preko emaila. Vaši podatki bodo obdelani
                za namen zagotavljanja storitve.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGdprPopup(false)}>
              Prekliči
            </Button>
            <Button onClick={handleGdprAgree} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Strinjam se
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

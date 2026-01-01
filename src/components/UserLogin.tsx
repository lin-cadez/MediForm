"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sendLoginEmail } from "@/lib/firebaseAuth";

interface UserLoginProps {
  formId?: string;
}

export default function UserLogin({ formId }: UserLoginProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Store the formId for redirect after login (if provided)
      if (formId) {
        localStorage.setItem('pendingFormId', formId);
      }
      
      const result = await sendLoginEmail(email);
      
      if (result.success) {
        setLinkSent(true);
      } else {
        setError(result.error || 'Napaka pri pošiljanju povezave');
      }
    } catch (err) {
      setError('Prišlo je do napake. Poskusite znova.');
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
            Vnesite vaš email naslov za dostop do obrazca
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Email naslov
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.com"
                required
                className="h-12"
                disabled={isLoading}
              />
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-ocean-deep to-ocean-teal hover:from-ocean-deep hover:to-ocean-surf text-white font-medium"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Pošiljanje...
                </>
              ) : (
                <>
                  Pošlji povezavo za dostop
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-center text-slate-500 mt-4">
            Na vaš email bomo poslali povezavo za dostop. Vaši podatki se bodo avtomatsko shranjevali.
          </p>
        </CardContent>
      </Card>
      
      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-slate-500">
        <p>
          MediForm © {new Date().getFullYear()} | Pomoč:{" "}
          <a 
            href="mailto:podpora@mediform.cadez.eu" 
            className="text-ocean-teal hover:text-ocean-deep transition-colors"
          >
            podpora@mediform.cadez.eu
          </a>
        </p>
      </div>
    </div>
  );
}

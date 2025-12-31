"use client";

import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// This component is deprecated - Firebase Email Link now redirects to /finish-signin
// Keeping for backwards compatibility - redirects old links to login flow
export default function VerifyUserSession() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Extract formId and redirect to appropriate page
    const formId = searchParams.get('formId');
    
    if (formId) {
      // Store the form ID and redirect to the form page
      // The form page will show the login form if no session exists
      localStorage.setItem('pendingFormId', formId);
      navigate(`/checklist/${formId}`);
    } else {
      // No form specified, go to home
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-ocean-light to-ocean-frost rounded-full flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-ocean-teal animate-spin" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Preusmerjanje...
          </CardTitle>
          <CardDescription className="text-slate-600 mt-2">
            Prosimo počakajte
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}

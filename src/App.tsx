"use client";

import "./App.css";
import { useState, useEffect } from "react";
import Checklist from "./checklist/checklist";
import Selector from "./selector/selector";
import Profil from "./profil/profil";
import UserInfoForm from "./components/UserInfoForm";
import VerifyUserSession from "./components/VerifyUserSession";
import FinishSignIn from "./components/FinishSignIn";
import CookieConsent from "./components/CookieConsent";

import TermsOfUse from "./profil/Terms";
import PrivacyPolicy from "./profil/Privacy";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { checkUserSession, logoutUser } from "./lib/userAuth";

interface UserInfo {
    ime: string;
    priimek: string;
    razred: string;
    sola: string;
    podrocje?: string;
    email?: string;
}

function AppContent() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authStatus, setAuthStatus] = useState<'anonymous' | 'email' | null>(null);
    const [, setHasConsent] = useState(() => {
        return localStorage.getItem("cookieConsent") === "accepted";
    });

    useEffect(() => {
        const initializeAuth = async () => {
            // First check localStorage for auth status
            const storedAuthStatus = localStorage.getItem("authStatus");
            if (storedAuthStatus === 'anonymous') {
                setAuthStatus('anonymous');
            } else if (storedAuthStatus === 'email' || storedAuthStatus === 'guest') {
                // 'guest' is legacy, treat as 'email' for backward compatibility
                setAuthStatus('email');
            }

            // Check localStorage for saved user info
            const savedUserInfo = localStorage.getItem("userInfo");
            if (savedUserInfo) {
                try {
                    const parsed = JSON.parse(savedUserInfo);
                    // Validate that userInfo has actual data (not just empty strings)
                    if (parsed && (parsed.ime || parsed.priimek || parsed.email)) {
                        // Only set userInfo if we have a valid authStatus
                        // Otherwise the user needs to re-authenticate
                        if (storedAuthStatus) {
                            setUserInfo(parsed);
                        }
                    } else {
                        // Invalid userInfo, clear it
                        localStorage.removeItem("userInfo");
                    }
                } catch (e) {
                    console.error("Error parsing userInfo:", e);
                    localStorage.removeItem("userInfo");
                }
            }
            
            // For anonymous mode, skip server session check
            if (storedAuthStatus === 'anonymous') {
                setIsLoading(false);
                return;
            }
            
            // If no authStatus is set, clear session and force re-login
            if (!storedAuthStatus) {
                // Clear potentially invalid session data
                localStorage.removeItem("mediform_session_token");
                localStorage.removeItem("emailForSignIn");
                setIsLoading(false);
                return;
            }
            
            // Check server session for email-based auth
            try {
                const session = await checkUserSession();
                if (session.success && session.user) {
                    // If we don't have local userInfo but server has user data, populate it
                    if (!savedUserInfo && session.user.email) {
                        const serverUserInfo: UserInfo = {
                            ime: session.user.ime || '',
                            priimek: session.user.priimek || '',
                            razred: session.user.razred || '',
                            sola: session.user.sola || '',
                            podrocje: session.user.podrocje || '',
                            email: session.user.email,
                        };
                        // Only set if we have at least an email
                        if (serverUserInfo.email) {
                            setUserInfo(serverUserInfo);
                            localStorage.setItem("userInfo", JSON.stringify(serverUserInfo));
                        }
                    }
                } else {
                    // Session check failed, clear session data
                    localStorage.removeItem("authStatus");
                    localStorage.removeItem("mediform_session_token");
                }
            } catch (error) {
                console.error("Error checking server session:", error);
                // On error, clear session data to prevent loops
                localStorage.removeItem("authStatus");
                localStorage.removeItem("mediform_session_token");
            }
            
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const handleUserInfoSubmit = (info: UserInfo) => {
        setUserInfo(info);
    };

    const handleLogout = async () => {
        // Clear all localStorage data
        localStorage.clear();
        
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        // Try server logout if email mode
        if (authStatus === 'email') {
            try {
                await logoutUser();
            } catch (error) {
                console.error("Server logout error:", error);
            }
        }
        
        // Clear all state
        setUserInfo(null);
        setAuthStatus(null);
        
        // Force redirect to login (use replace to prevent back button)
        window.location.replace('/');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-sky-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-teal mx-auto"></div>
                </div>
            </div>
        );
    }

    // Check if user is logged in
    if (!userInfo) {
        return (
            <div className="min-h-screen bg-sky-50 flex flex-col">
                <CookieConsent onAccept={() => setHasConsent(true)} />
                <div className="flex-1">
                    <Routes>
                        {/* Legal pages - always accessible */}
                        <Route path="/pogoji-uporabe" element={<TermsOfUse />} />
                        <Route path="/zasebnost" element={<PrivacyPolicy />} />
                        {/* User session verification route */}
                        <Route path="/verify-session" element={<VerifyUserSession />} />
                        {/* Email sign-in completion route - must be accessible without auth */}
                        <Route path="/finish-signin" element={<FinishSignIn />} />
                        {/* Checklist routes - handle user auth internally */}
                        <Route path="/checklist/*" element={<Checklist userInfo={{ ime: '', priimek: '', razred: '', sola: '' }} />} />
                        {/* Form routes with template ID */}
                        <Route path="/obrazec/:formId" element={<Checklist userInfo={{ ime: '', priimek: '', razred: '', sola: '' }} />} />
                        {/* All other routes require user info */}
                        <Route path="*" element={<UserInfoForm onSubmit={handleUserInfoSubmit} />} />
                    </Routes>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-sky-50 flex flex-col">
            <CookieConsent onAccept={() => setHasConsent(true)} />
            <div className="flex-1">
                <Routes>
                    {/* Legal pages - always accessible */}
                    <Route path="/pogoji-uporabe" element={<TermsOfUse />} />
                    <Route path="/zasebnost" element={<PrivacyPolicy />} />
                    {/* User session verification route */}
                    <Route path="/verify-session" element={<VerifyUserSession />} />
                    {/* Email sign-in completion route */}
                    <Route path="/finish-signin" element={<FinishSignIn />} />
                    {/* Checklist - for filling out forms */}
                    <Route
                        path="/checklist/*"
                        element={
                            <Checklist userInfo={userInfo} />
                        }
                    />
                    {/* Form routes with template ID */}
                    <Route
                        path="/obrazec/:formId"
                        element={
                            <Checklist userInfo={userInfo} />
                        }
                    />
                    {/* User profile */}
                    <Route
                        path="/profil"
                        element={
                            <Profil userInfo={userInfo} onLogout={handleLogout} />
                        }
                    />
                    {/* Selector - main page with templates and user documents */}
                    <Route path="/" element={<Selector />} />
                    <Route path="*" element={<Selector />} />
                </Routes>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;

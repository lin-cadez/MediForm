"use client";

import "./App.css";
import { useState, useEffect } from "react";
import Checklist from "./checklist/checklist";
import Selector from "./selector/selector";
import Profil from "./profil/profil";
import UserInfoForm from "./components/UserInfoForm";
import CookieConsent from "./components/CookieConsent";

import TermsOfUse from "./profil/Terms";
import PrivacyPolicy from "./profil/Privacy";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

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
    const [, setHasConsent] = useState(() => {
        return localStorage.getItem("cookieConsent") === "accepted";
    });

    useEffect(() => {
        const initializeAuth = async () => {
            // Check localStorage for saved user info
            const savedUserInfo = localStorage.getItem("userInfo");
            if (savedUserInfo) {
                try {
                    const parsed = JSON.parse(savedUserInfo);
                    // Only set userInfo if we have at least name and surname
                    if (parsed && parsed.ime && parsed.priimek) {
                        setUserInfo(parsed);
                    } else {
                        // Invalid userInfo, clear it
                        localStorage.removeItem("userInfo");
                    }
                } catch (e) {
                    console.error("Error parsing userInfo:", e);
                    localStorage.removeItem("userInfo");
                }
            }
            
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const handleUserInfoSubmit = (info: UserInfo) => {
        setUserInfo(info);
    };

    const handleLogout = () => {
        // Clear all localStorage data
        localStorage.clear();
        
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        // Clear all state
        setUserInfo(null);
        
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

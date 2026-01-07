"use client";

import "./App.css";
import { useState, useEffect } from "react";
import Checklist from "./checklist/checklist";
import Selector from "./selector/selector";
import Profil from "./profil/profil";
import FormBuilder from "./form_builder/form_builder";
import UserInfoForm from "./components/UserInfoForm";
import FinishSignIn from "./form_builder/FinishSignIn";
import VerifyUserSession from "./components/VerifyUserSession";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { checkUserSession } from "./lib/userAuth";
import TermsOfUse from "./profil/Terms";
import PrivacyPolicy from "./profil/Privacy";
import UserLogin from "./components/UserLogin";

interface UserInfo {
    ime: string;
    priimek: string;
    razred: string;
    sola: string;
    podrocje?: string;
    email?: string;
}

function App() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
        // Initialize from localStorage immediately
        const saved = localStorage.getItem("userInfo");
        console.log("[App Init] userInfo from localStorage:", saved);
        return saved ? JSON.parse(saved) : null;
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [authStatus] = useState<string | null>(() => {
        // Initialize from localStorage immediately
        const status = localStorage.getItem("authStatus");
        console.log("[App Init] authStatus from localStorage:", status);
        return status;
    });

    console.log("[App Render] userInfo:", userInfo, "authStatus:", authStatus, "isLoading:", isLoading);

    useEffect(() => {
        const initializeAuth = async () => {
            const storedAuthStatus = localStorage.getItem("authStatus");
            
            // For guest users, we already have everything from localStorage
            if (storedAuthStatus === 'guest') {
                setIsLoading(false);
                return;
            }

            // Check if admin is logged in from sessionStorage
            const adminLoggedIn = sessionStorage.getItem("adminLoggedIn");
            if (adminLoggedIn === "true") {
                setIsAdmin(true);
            }
            
            // For non-guest users, also check server session
            try {
                const session = await checkUserSession();
                if (session.success && session.user) {
                    // User has server session
                    if (session.user.role === 'admin') {
                        setIsAdmin(true);
                        sessionStorage.setItem("adminLoggedIn", "true");
                    }
                    
                    // If we don't have local userInfo but server has user data, populate it
                    const savedUserInfo = localStorage.getItem("userInfo");
                    if (!savedUserInfo && session.user.email) {
                        const serverUserInfo: UserInfo = {
                            ime: session.user.ime || '',
                            priimek: session.user.priimek || '',
                            razred: session.user.razred || '',
                            sola: session.user.sola || '',
                            podrocje: session.user.podrocje || '',
                            email: session.user.email,
                        };
                        if (serverUserInfo.email) {
                            setUserInfo(serverUserInfo);
                            localStorage.setItem("userInfo", JSON.stringify(serverUserInfo));
                        }
                    }
                }
            } catch (error) {
                console.error("Error checking server session:", error);
            }
            
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    // Monitor sessionStorage changes for admin login
    useEffect(() => {
        const checkAdminStatus = () => {
            const adminLoggedIn = sessionStorage.getItem("adminLoggedIn");
            setIsAdmin(adminLoggedIn === "true");
        };

        // Check every 500ms for sessionStorage changes
        const interval = setInterval(checkAdminStatus, 500);
        
        // Also check on window focus
        window.addEventListener('focus', checkAdminStatus);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', checkAdminStatus);
        };
    }, []);

    const handleUserInfoSubmit = (info: UserInfo) => {
        setUserInfo(info);
        localStorage.setItem("userInfo", JSON.stringify(info));
    };

    const handleLogout = () => {
        setUserInfo(null);
        setIsAdmin(false);
        localStorage.removeItem("userInfo");
        localStorage.removeItem("authStatus");
        sessionStorage.removeItem("adminLoggedIn");
        // TODO: Add server-side logout if necessary
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

    console.log("[App Render before return] userInfo:", userInfo, "authStatus:", authStatus, "isLoading:", isLoading);
    console.log("[App Render] userInfo truthy?", !!userInfo, "authStatus truthy?", !!authStatus);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<UserLogin />} />
                <Route path="/login/:formId" element={<UserLogin />} />
                <Route path="/finishSignIn" element={<FinishSignIn />} />
                <Route path="/PogojiUporabe" element={<TermsOfUse />} />
                <Route path="/Zasebnost" element={<PrivacyPolicy />} />
                <Route path="/verify" element={<VerifyUserSession />} />
                <Route path="/user-info" element={<UserInfoForm onSubmit={handleUserInfoSubmit} />} />

                {/* Main app routes - only accessible with userInfo */}
                {userInfo ? (
                    <>
                        {console.log("[Routes] Rendering main app routes")}
                        <Route path="/" element={<Selector />} />
                        <Route path="/form/:formId" element={<Checklist userInfo={userInfo} />} />
                        <Route path="/profil" element={<Profil userInfo={userInfo} onLogout={handleLogout} />} />
                        {isAdmin && <Route path="/builder" element={<FormBuilder />} />}
                        <Route path="*" element={<Navigate to="/" />} />
                    </>
                ) : authStatus ? (
                    // Has authStatus but no userInfo - need to fill user info
                    <>
                        {console.log("[Routes] Redirecting to user-info")}
                        <Route path="*" element={<Navigate to="/user-info" />} />
                    </>
                ) : (
                    // No authStatus - need to login first
                    <>
                        {console.log("[Routes] Redirecting to login")}
                        <Route path="*" element={<Navigate to="/login" />} />
                    </>
                )}

            </Routes>
        </Router>
    );
}

export default App;

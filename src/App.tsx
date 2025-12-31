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

interface UserInfo {
    ime: string;
    priimek: string;
    razred: string;
    sola: string;
    podrocje?: string;
    email?: string;
}

function App() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            // First check localStorage for saved user info
            const savedUserInfo = localStorage.getItem("userInfo");
            if (savedUserInfo) {
                setUserInfo(JSON.parse(savedUserInfo));
            }
            
            // Check if admin is logged in from sessionStorage
            const adminLoggedIn = sessionStorage.getItem("adminLoggedIn");
            if (adminLoggedIn === "true") {
                setIsAdmin(true);
            }
            
            // Also check server session - user might be logged in on server but not have localStorage
            try {
                const session = await checkUserSession();
                if (session.success && session.user) {
                    // User has server session
                    if (session.user.role === 'admin') {
                        setIsAdmin(true);
                        sessionStorage.setItem("adminLoggedIn", "true");
                    }
                    
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

    // Allow access if user is logged in OR if admin is logged in
    if (!userInfo && !isAdmin) {
        return (
            <Router>
                <Routes>
                    {/* Finish Sign In route - must be accessible without login */}
                    <Route path="/finish-signin" element={<FinishSignIn />} />
                    {/* User session verification route */}
                    <Route path="/verify-session" element={<VerifyUserSession />} />
                    {/* Checklist routes - handle user auth internally */}
                    <Route path="/checklist/*" element={<Checklist userInfo={{ ime: '', priimek: '', razred: '', sola: '' }} />} />
                    {/* All other routes require user info */}
                    <Route path="*" element={<UserInfoForm onSubmit={handleUserInfoSubmit} />} />
                </Routes>
            </Router>
        );
    }

    return (
        <div className="min-h-screen bg-sky-50">
            <Router>
                <Routes>
                    {/* Finish Sign In route */}
                    <Route path="/finish-signin" element={<FinishSignIn />} />
                    {/* User session verification route */}
                    <Route path="/verify-session" element={<VerifyUserSession />} />
                    {/* Checklist - accessible by both admin and regular users */}
                    <Route
                        path="/checklist/*"
                        element={
                            <Checklist userInfo={userInfo || { ime: '', priimek: '', razred: '', sola: '' }} />
                        }
                    />
                    <Route
                        path="/profil"
                        element={
                            userInfo ? <Profil /> : <Navigate to="/" replace />
                        }
                    />
                    {/* Form builder - only for admins */}
                    <Route path="/form_builder" element={<FormBuilder />} />
                    {/* Selector - accessible by all logged in users */}
                    <Route path="/" element={<Selector />} />
                    <Route path="*" element={<Selector />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;

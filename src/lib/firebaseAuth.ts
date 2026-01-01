// Firebase Authentication for Email Link Sign-In
import { initializeApp } from "firebase/app";
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB5sccmiSisPk0qAxgCXzUK4eP3KYzboj8",
  authDomain: "mediform-73012.firebaseapp.com",
  projectId: "mediform-73012",
  storageBucket: "mediform-73012.firebasestorage.app",
  messagingSenderId: "279000449170",
  appId: "1:279000449170:web:76330b8faced5b247da64b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://medi-form-backend.vercel.app/api';

// Send email link for sign-in
export const sendLoginEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
  // Encode email in the URL so it works across devices/browsers
  const encodedEmail = encodeURIComponent(email);
  const actionCodeSettings = {
    url: `${window.location.origin}/finish-signin?email=${encodedEmail}`,
    handleCodeInApp: true
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    localStorage.setItem('emailForSignIn', email);
    return { success: true };
  } catch (error: any) {
    console.error("Error sending email link:", error);
    return { success: false, error: error.message || "Napaka pri pošiljanju emaila" };
  }
};

// Complete sign-in with email link
export const completeEmailSignIn = async (providedEmail?: string): Promise<{ success: boolean; user?: any; error?: string; needsEmail?: boolean }> => {
  const url = window.location.href;

  if (!isSignInWithEmailLink(auth, url)) {
    return { success: false, error: "Neveljavna povezava za prijavo" };
  }

  // Try to get email from: 1) provided param, 2) URL param, 3) localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const emailFromUrl = urlParams.get('email');
  let email = providedEmail || emailFromUrl || localStorage.getItem('emailForSignIn');
  
  if (!email) {
    // Return special flag indicating we need email input (fallback)
    return { success: false, needsEmail: true, error: "Prosimo, vnesite svoj email naslov" };
  }

  try {
    const result = await signInWithEmailLink(auth, email, url);
    const idToken = await result.user.getIdToken();

    // Create session on backend with retry logic for rate limiting
    let attempts = 0;
    const maxAttempts = 3;
    let response;
    
    while (attempts < maxAttempts) {
      response = await fetch(`${API_BASE_URL}/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken })
      });
      
      if (response.status === 429 && attempts < maxAttempts - 1) {
        // Rate limited, wait and retry
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempts + 1)));
        attempts++;
        continue;
      }
      break;
    }

    if (!response) {
      return { success: false, error: "Napaka pri povezavi s strežnikom" };
    }

    const data = await response.json();

    if (data.success) {
      localStorage.removeItem('emailForSignIn');
      // Don't set adminLoggedIn here - let FinishSignIn handle it based on role
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.error || "Napaka pri ustvarjanju seje" };
    }
  } catch (error: any) {
    console.error("Error completing sign-in:", error);
    
    // If link was already used or email already in use, check if user is logged in
    if (error.code === 'auth/invalid-action-code' || error.code === 'auth/email-already-in-use') {
      try {
        const sessionCheck = await checkSession();
        if (sessionCheck.success) {
          // User is already logged in, return success
          return { success: true, user: sessionCheck.user };
        }
      } catch (e) {
        // Ignore session check errors
      }
      
      if (error.code === 'auth/email-already-in-use') {
        return { success: false, error: "Ta email naslov je že v uporabi. Če ste že prijavljeni, osvežite stran." };
      }
      
      return { success: false, error: "Povezava za prijavo je že bila uporabljena ali je potekla. Prosimo, zahtevajte novo povezavo." };
    }
    
    return { success: false, error: error.message || "Napaka pri prijavi" };
  }
};

// Check if user is signed in
export const checkSession = async (): Promise<{ success: boolean; user?: any }> => {
  try {
    // Add retry logic for rate limiting and 401 errors
    let attempts = 0;
    const maxAttempts = 3;
    let response;
    
    while (attempts < maxAttempts) {
      response = await fetch(`${API_BASE_URL}/auth/session`, {
        method: 'GET',
        credentials: 'include'
      });
      
      // Retry on rate limiting or unauthorized (session might be establishing)
      if ((response.status === 429 || response.status === 401) && attempts < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempts + 1)));
        attempts++;
        continue;
      }
      break;
    }

    if (!response) {
      return { success: false };
    }

    const data = await response.json();

    if (data.success && data.user) {
      sessionStorage.setItem('adminLoggedIn', 'true');
      return { success: true, user: data.user };
    } else {
      sessionStorage.removeItem('adminLoggedIn');
      return { success: false };
    }
  } catch (error) {
    console.error("Error checking session:", error);
    sessionStorage.removeItem('adminLoggedIn');
    return { success: false };
  }
};

// Logout
export const logout = async (): Promise<{ success: boolean }> => {
  try {
    // Clear session on backend - with retry for rate limiting
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.status === 429 && attempts < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
        continue;
      }
      break;
    }

    // Sign out from Firebase client
    await signOut(auth);

    // Clear all local state
    sessionStorage.clear();
    localStorage.removeItem('emailForSignIn');
    localStorage.removeItem('pendingFormId');

    return { success: true };
  } catch (error) {
    console.error("Error during logout:", error);
    // Still clear local state even if backend fails
    sessionStorage.clear();
    localStorage.removeItem('emailForSignIn');
    localStorage.removeItem('pendingFormId');
    return { success: true };
  }
};

// Check if current URL is a sign-in link
export const isEmailSignInLink = (): boolean => {
  return isSignInWithEmailLink(auth, window.location.href);
};
// Update user profile
export interface ProfileUpdateData {
  ime?: string;
  priimek?: string;
  razred?: string;
  sola?: string;
  podrocje?: string;
}

export const updateUserProfile = async (data: ProfileUpdateData): Promise<{ success: boolean; user?: any; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // Update localStorage with new data
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        const userInfo = JSON.parse(storedUserInfo);
        localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, ...data }));
      }
      return { success: true, user: result.user };
    } else {
      return { success: false, error: result.error || 'Napaka pri posodabljanju profila' };
    }
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message || 'Napaka pri posodabljanju profila' };
  }
};
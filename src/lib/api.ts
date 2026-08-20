// API Client for MediForm Backend
// Uses session cookie authentication (HttpOnly cookie set by backend)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://medi-form-backend.vercel.app/api';

// Track backend availability
let isBackendAvailable = true;

// Helper for making authenticated requests with session cookies
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // Important: sends session cookie
    });

    return response;
};

// ==================== BACKEND HEALTH CHECK ====================

// Ping the backend to check if it's available
export const pingBackend = async (): Promise<boolean> => {
    isBackendAvailable = false;
    return false;
};

// Get backend availability status
export const getBackendStatus = (): boolean => isBackendAvailable;

// ==================== CACHED FORMS LOADING ====================

// Load cached forms index
const loadCachedFormsIndex = async (): Promise<any[]> => {
    try {
        const response = await fetch(`/cached-forms/index.json?v=${Date.now()}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
            },
        });
        if (response.ok) {
            const data = await response.json();
            console.log('Loading fresh forms index');
            // Handle both array format and {forms: []} format
            return Array.isArray(data) ? data : (data.forms || []);
        }
    } catch (error) {
        console.warn('Fresh forms index unavailable, falling back to cached copy:', error);
    }

    try {
        const fallbackResponse = await fetch('/cached-forms/index.json');
        if (fallbackResponse.ok) {
            const data = await fallbackResponse.json();
            console.log('⚠️ Loading forms from local cache (offline mode)');
            return Array.isArray(data) ? data : (data.forms || []);
        }
    } catch (error) {
        console.error('Failed to load cached forms index:', error);
    }

    return [];
};

// Load a specific cached form by ID
const loadCachedFormById = async (formId: string): Promise<any | null> => {
    try {
        const response = await fetch(`/cached-forms/${formId}.json?v=${Date.now()}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
            },
        });
        if (response.ok) {
            console.log(`Loading fresh form "${formId}"`);
            return await response.json();
        }
    } catch (error) {
        console.warn(`Fresh form "${formId}" unavailable, falling back to cached copy:`, error);
    }

    try {
        const fallbackResponse = await fetch(`/cached-forms/${formId}.json`);
        if (fallbackResponse.ok) {
            console.warn(`⚠️ Loading form "${formId}" from local cache (offline mode)`);
            return await fallbackResponse.json();
        }
    } catch (error) {
        console.error(`Failed to load cached form ${formId}:`, error);
    }

    return null;
};

// ==================== AUTH ENDPOINTS ====================
// These legacy functions are kept for compatibility with older admin tooling.

export interface LoginResponse {
    success: boolean;
    token?: string;
    user?: { id: string; username: string; email?: string };
    error?: string;
}

// Check current session status
export const checkSession = async (): Promise<{ success: boolean; user?: any }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/session`, {
            method: 'GET',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success && data.user) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            return { success: true, user: data.user };
        } else {
            sessionStorage.removeItem('adminLoggedIn');
            return { success: false };
        }
    } catch (error) {
        console.error('Session check error:', error);
        sessionStorage.removeItem('adminLoggedIn');
        return { success: false };
    }
};

// Legacy username/password login function.
export const login = async (username: string, password: string): Promise<LoginResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Napaka pri prijavi' };
    }
};

export const logout = async (): Promise<{ success: boolean }> => {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        sessionStorage.removeItem('adminLoggedIn');
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        sessionStorage.removeItem('adminLoggedIn');
        return { success: true }; // Still clear local state
    }
};

export const verifyToken = async (): Promise<{ success: boolean; valid: boolean; user?: { id: string; username: string } }> => {
    try {
        const response = await fetchWithAuth('/auth/verify');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Token verification error:', error);
        return { success: false, valid: false };
    }
};

// ==================== FORMS ENDPOINTS ====================

export interface FormData {
    id?: string;
    title: string;
    description: string;
    url?: string;
    categories: Record<string, any>;
    createdAt?: number;
    updatedAt?: number;
}

export interface FormsResponse {
    success: boolean;
    data?: FormData[];
    count?: number;
    error?: string;
}

export interface FormResponse {
    success: boolean;
    data?: FormData;
    error?: string;
    message?: string;
}

// Get all forms (public) - cache only
export const getAllForms = async (): Promise<FormData[]> => {
    isBackendAvailable = false;
    return await loadCachedFormsIndex();
};

// Get form by ID (public) - cache only
export const getFormById = async (formId: string): Promise<FormData | null> => {
    isBackendAvailable = false;
    return await loadCachedFormById(formId);
};

// Create form (authenticated)
export const createForm = async (formData: FormData): Promise<FormResponse> => {
    try {
        const response = await fetchWithAuth('/forms', {
            method: 'POST',
            body: JSON.stringify(formData),
        });

        return await response.json();
    } catch (error) {
        console.error('Error creating form:', error);
        return { success: false, error: 'Napaka pri ustvarjanju obrazca' };
    }
};

// Update form (authenticated)
export const updateForm = async (formId: string, formData: Partial<FormData>): Promise<FormResponse> => {
    try {
        const response = await fetchWithAuth(`/forms/${encodeURIComponent(formId)}`, {
            method: 'PUT',
            body: JSON.stringify(formData),
        });

        return await response.json();
    } catch (error) {
        console.error('Error updating form:', error);
        return { success: false, error: 'Napaka pri posodabljanju obrazca' };
    }
};

// Save form (create or update) (authenticated)
export const saveForm = async (formId: string, formData: FormData): Promise<FormResponse> => {
    try {
        const response = await fetchWithAuth(`/forms/${encodeURIComponent(formId)}/save`, {
            method: 'POST',
            body: JSON.stringify(formData),
        });

        return await response.json();
    } catch (error) {
        console.error('Error saving form:', error);
        return { success: false, error: 'Napaka pri shranjevanju obrazca' };
    }
};

// Delete form (authenticated)
export const deleteForm = async (formId: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
        const response = await fetchWithAuth(`/forms/${encodeURIComponent(formId)}`, {
            method: 'DELETE',
        });

        return await response.json();
    } catch (error) {
        console.error('Error deleting form:', error);
        return { success: false, error: 'Napaka pri brisanju obrazca' };
    }
};

// ==================== LEGACY COMPATIBILITY ====================
// These functions remain for older admin tooling and are not used by the student flow.

export const legacySaveForm = async (formId: string, formData: any): Promise<{ success: boolean; error?: any }> => {
    const result = await saveForm(formId, formData);
    return { success: result.success, error: result.error };
};

export const legacyGetAllForms = getAllForms;
export const legacyGetFormById = getFormById;
export const legacyDeleteForm = async (formId: string): Promise<{ success: boolean; error?: any }> => {
    const result = await deleteForm(formId);
    return { success: result.success, error: result.error };
};

// ==================== STUDENT PROFILE ENDPOINT ====================
// Reuses the existing /exports backend route, but sends only student profile data.

export interface StudentProfileData {
    ime: string;
    priimek: string;
    razred: string;
    sola: string;
}

const sanitizeStudentProfile = (profile: StudentProfileData): StudentProfileData => ({
    ime: profile.ime.trim(),
    priimek: profile.priimek.trim(),
    razred: profile.razred.trim(),
    sola: profile.sola.trim(),
});

export const saveStudentProfile = async (
    profile: StudentProfileData
): Promise<{ success: boolean; error?: string }> => {
    const studentProfile = sanitizeStudentProfile(profile);

    try {
        const response = await fetch(`${API_BASE_URL}/exports`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            keepalive: true,
            body: JSON.stringify({
                email: "",
                userInfo: studentProfile,
                document: {
                    type: "student-profile",
                    studentProfile,
                    submittedAt: new Date().toISOString(),
                },
                exportType: "json",
                documentName: "student-profile",
            }),
        });

        if (!response.ok) {
            return { success: false, error: "Napaka pri shranjevanju profila dijaka" };
        }

        return await response.json();
    } catch (error) {
        console.warn("Could not save student profile:", error);
        return { success: false, error: "Profil dijaka ni bil poslan" };
    }
};

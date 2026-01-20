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
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${API_BASE_URL}/forms`, {
            method: 'GET',
            signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        isBackendAvailable = response.ok;
        
        if (!isBackendAvailable) {
            console.warn('⚠️ Backend returned non-OK status, using cached forms');
        }
        
        return isBackendAvailable;
    } catch (error) {
        console.warn('⚠️ Backend is unavailable, switching to offline mode:', error);
        isBackendAvailable = false;
        return false;
    }
};

// Get backend availability status
export const getBackendStatus = (): boolean => isBackendAvailable;

// ==================== CACHED FORMS LOADING ====================

// Load cached forms index
const loadCachedFormsIndex = async (): Promise<any[]> => {
    try {
        const response = await fetch('/cached-forms/index.json');
        if (response.ok) {
            console.warn('⚠️ Loading forms from local cache (offline mode)');
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error('Failed to load cached forms index:', error);
        return [];
    }
};

// Load a specific cached form by ID
const loadCachedFormById = async (formId: string): Promise<any | null> => {
    try {
        const response = await fetch(`/cached-forms/${formId}.json`);
        if (response.ok) {
            console.warn(`⚠️ Loading form "${formId}" from local cache (offline mode)`);
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error(`Failed to load cached form ${formId}:`, error);
        return null;
    }
};

// ==================== AUTH ENDPOINTS ====================
// Note: Primary authentication is handled via Firebase Email Link in firebaseAuth.ts
// These functions are kept for session management

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

// Legacy login function (deprecated - use email link auth instead)
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

// Get all forms (public) - with fallback to cached forms
export const getAllForms = async (): Promise<FormData[]> => {
    // If we know backend is unavailable, go straight to cache
    if (!isBackendAvailable) {
        return await loadCachedFormsIndex();
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/forms`);
        const data: FormsResponse = await response.json();

        if (data.success && data.data) {
            isBackendAvailable = true;
            return data.data;
        }
        
        // Fallback to cached forms
        console.warn('⚠️ Backend returned empty response, falling back to cached forms');
        return await loadCachedFormsIndex();
    } catch (error) {
        console.error('Error getting forms from backend:', error);
        isBackendAvailable = false;
        // Fallback to cached forms
        return await loadCachedFormsIndex();
    }
};

// Get form by ID (public) - with fallback to cached forms
export const getFormById = async (formId: string): Promise<FormData | null> => {
    // If we know backend is unavailable, go straight to cache
    if (!isBackendAvailable) {
        return await loadCachedFormById(formId);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/forms/${encodeURIComponent(formId)}`);
        const data: FormResponse = await response.json();

        if (data.success && data.data) {
            isBackendAvailable = true;
            return data.data;
        }
        
        // Fallback to cached form
        console.warn(`⚠️ Backend returned empty response for form "${formId}", falling back to cache`);
        return await loadCachedFormById(formId);
    } catch (error) {
        console.error('Error getting form from backend:', error);
        isBackendAvailable = false;
        // Fallback to cached form
        return await loadCachedFormById(formId);
    }
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
// These functions maintain backward compatibility with the old firebase.ts interface

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

// ==================== EXPORT ENDPOINT ====================
// Save exported document to backend for archiving

export interface ExportData {
    email: string;
    userInfo: {
        ime: string;
        priimek: string;
        razred: string;
        sola?: string;
        podrocje?: string;
    };
    document: any;
    exportType: 'pdf' | 'json';
    documentName?: string;
}

export const saveExport = async (exportData: ExportData): Promise<{ success: boolean; error?: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/exports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(exportData),
        });

        if (!response.ok) {
            console.warn('⚠️ Failed to save export to backend, continuing offline');
            return { success: false, error: 'Backend unavailable' };
        }

        return await response.json();
    } catch (error) {
        console.warn('⚠️ Could not reach backend for export archiving:', error);
        // Don't fail the export if backend is unavailable
        return { success: false, error: 'Network error' };
    }
};

// User Authentication and Auto-Save utilities for MediForm
// API v3.0 - Unified Firebase Email Link authentication for all users

const API_BASE = 'https://medi-form-backend.vercel.app/api';

export interface UserSession {
  uid: string;
  email: string;
  role: 'user' | 'admin';
  ime?: string;
  priimek?: string;
  razred?: string;
  sola?: string;
  podrocje?: string;
}

export interface SavedSubmission {
  id: string;
  formId: string;
  email: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
}

/**
 * Check if user has an active session (API v3.0)
 * Returns user info including role
 */
export async function checkUserSession(): Promise<{
  success: boolean;
  user?: UserSession;
  email?: string;
  role?: 'user' | 'admin';
}> {
  try {
    const response = await fetch(`${API_BASE}/auth/session`, {
      method: 'GET',
      credentials: 'include'
    });

    const data = await response.json();
    
    if (data.success && data.user) {
      return { 
        success: true, 
        user: data.user,
        email: data.user.email,
        role: data.user.role
      };
    }
    return { success: false };
  } catch (error) {
    console.error('Error checking session:', error);
    return { success: false };
  }
}

/**
 * Get current user profile
 */
export async function getUserProfile(): Promise<{
  success: boolean;
  user?: UserSession;
}> {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      credentials: 'include'
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false };
  }
}

/**
 * Logout user - clear session cookie (API v3.0)
 */
export async function logoutUser(): Promise<void> {
  try {
    // Clear backend session with retry for rate limiting
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      const response = await fetch(`${API_BASE}/auth/logout`, {
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
    
    // Clear all local data
    sessionStorage.clear();
    localStorage.removeItem('emailForSignIn');
    localStorage.removeItem('pendingFormId');
  } catch (error) {
    console.error('Error logging out:', error);
    // Still clear local data even if backend fails
    sessionStorage.clear();
    localStorage.removeItem('emailForSignIn');
    localStorage.removeItem('pendingFormId');
  }
}

/**
 * Auto-save form data to server (API v3.0)
 */
export async function autoSaveForm(formId: string, formData: Record<string, any>): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/submissions/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ formId, data: formData })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error auto-saving form:', error);
    return { success: false, message: 'Napaka pri shranjevanju' };
  }
}

/**
 * Load saved submission for a form (API v3.0)
 */
export async function loadSavedSubmission(formId: string): Promise<{
  success: boolean;
  data?: SavedSubmission;
  message?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/submissions/${formId}`, {
      method: 'GET',
      credentials: 'include'
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error loading saved submission:', error);
    return { success: false, message: 'Napaka pri nalaganju podatkov' };
  }
}

/**
 * Submit completed form (API v3.0)
 */
export async function submitForm(formId: string, formData: Record<string, any>): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/submissions/${formId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ data: formData })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error submitting form:', error);
    return { success: false, message: 'Napaka pri oddaji forme' };
  }
}

// Debounce utility for auto-save
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Schedule an auto-save with debouncing (waits for specified delay after last change)
 */
export function scheduleAutoSave(
  formId: string, 
  formData: Record<string, any>, 
  delay: number = 1000,
  onSaveStart?: () => void,
  onSaveComplete?: (success: boolean) => void
): void {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  
  autoSaveTimeout = setTimeout(async () => {
    onSaveStart?.();
    const result = await autoSaveForm(formId, formData);
    onSaveComplete?.(result.success);
    console.log(result.success ? '✅ Auto-saved' : '❌ Auto-save failed', new Date().toLocaleTimeString());
  }, delay);
}

/**
 * Cancel any pending auto-save
 */
export function cancelAutoSave(): void {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = null;
  }
}

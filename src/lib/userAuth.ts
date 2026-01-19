// User Authentication and Auto-Save utilities for MediForm
// API v3.0 - Unified Firebase Email Link authentication for all users

const API_BASE = 'https://medi-form-backend.vercel.app/api';

// Session cache to prevent too many requests (429 errors)
let cachedSession: { success: boolean; user?: UserSession; email?: string; role?: 'user' | 'admin' } | null = null;
let sessionCacheTime: number = 0;
const SESSION_CACHE_DURATION = 60000; // Cache session for 60 seconds

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
 * Clear the session cache (call on logout)
 */
export function clearSessionCache(): void {
  cachedSession = null;
  sessionCacheTime = 0;
}

/**
 * Check if user has an active session (API v3.0)
 * Returns user info including role
 * Includes caching to prevent 429 Too Many Requests
 */
export async function checkUserSession(): Promise<{
  success: boolean;
  user?: UserSession;
  email?: string;
  role?: 'user' | 'admin';
}> {
  // Return cached session if still valid
  const now = Date.now();
  if (cachedSession && (now - sessionCacheTime) < SESSION_CACHE_DURATION) {
    return cachedSession;
  }
  
  try {
    const response = await fetch(`${API_BASE}/auth/session`, {
      method: 'GET',
      credentials: 'include'
    });

    // Handle rate limiting
    if (response.status === 429) {
      console.warn('Rate limited by server, using cached session or returning failure');
      if (cachedSession) {
        return cachedSession;
      }
      return { success: false };
    }

    const data = await response.json();
    
    if (data.success && data.user) {
      cachedSession = { 
        success: true, 
        user: data.user,
        email: data.user.email,
        role: data.user.role
      };
      sessionCacheTime = now;
      return cachedSession;
    }
    
    cachedSession = { success: false };
    sessionCacheTime = now;
    return cachedSession;
  } catch (error) {
    console.error('Error checking session:', error);
    // On error, return cached if available
    if (cachedSession) {
      return cachedSession;
    }
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
  // Clear session cache first
  clearSessionCache();
  
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
 * Uses document ID as the unique identifier
 */
export async function autoSaveForm(documentId: string, formData: Record<string, any>, documentMeta?: {
  templateId: string;
  templateTitle: string;
  name: string;
}): Promise<{
  success: boolean;
  message?: string;
}> {
  console.log("🌐 autoSaveForm called:", {
    documentId,
    hasData: !!formData,
    documentMeta
  });

  try {
    // First check if user is authenticated
    const sessionCheck = await checkUserSession();
    console.log("🔐 Session check before save:", sessionCheck);
    
    if (!sessionCheck.success || !sessionCheck.user) {
      console.error("❌ Not authenticated - cannot save to backend");
      return { success: false, message: 'Niste prijavljeni' };
    }

    const payload = { 
      documentId, 
      data: formData,
      ...(documentMeta && { 
        templateId: documentMeta.templateId,
        templateTitle: documentMeta.templateTitle,
        name: documentMeta.name
      })
    };

    console.log("📤 Sending POST to", `${API_BASE}/submissions/save`);
    console.log("📦 Payload:", payload);

    const response = await fetch(`${API_BASE}/submissions/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    console.log("📥 Response status:", response.status, response.statusText);

    // Handle different HTTP status codes
    if (response.status === 401) {
      console.error("❌ 401 Unauthorized - session expired or invalid");
      return { success: false, message: 'Seja je potekla, prosimo prijavite se ponovno' };
    }

    if (response.status === 403) {
      console.error("❌ 403 Forbidden - insufficient permissions");
      return { success: false, message: 'Nimate pravic za to operacijo' };
    }

    if (response.status === 429) {
      console.warn('⚠️ 429 Rate limited, will retry later');
      return { success: false, message: 'Preveč zahtev, poskusite znova kasneje' };
    }

    if (response.status === 500) {
      console.error("❌ 500 Server error");
      const errorText = await response.text();
      console.error("Server error details:", errorText);
      return { success: false, message: 'Napaka strežnika pri shranjevanju' };
    }

    // Try to parse JSON response
    let result;
    try {
      result = await response.json();
      console.log("📥 Response data:", result);
    } catch (parseError) {
      console.error("❌ Failed to parse response as JSON:", parseError);
      return { success: false, message: 'Neveljavna odgovor strežnika' };
    }

    // Check if response indicates success
    if (!response.ok) {
      console.error("❌ Response not OK:", response.status, result);
      return { success: false, message: result.error || result.message || 'Napaka pri shranjevanju' };
    }

    return result;
  } catch (error) {
    console.error('❌ Network error auto-saving form:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { success: false, message: 'Ni povezave s strežnikom' };
    }
    return { success: false, message: 'Napaka pri shranjevanju' };
  }
}

/**
 * Load saved submission for a specific document (API v3.0)
 */
export async function loadSavedSubmission(documentId: string): Promise<{
  success: boolean;
  data?: SavedSubmission;
  message?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/submissions/${documentId}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (response.status === 404) {
      return { success: false, message: 'Dokument ni najden' };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error loading saved submission:', error);
    return { success: false, message: 'Napaka pri nalaganju podatkov' };
  }
}

/**
 * Load all saved submissions/documents for the current user
 */
export async function loadAllUserSubmissions(): Promise<{
  success: boolean;
  documents?: Array<{
    id: string;
    documentId: string;
    templateId: string;
    templateTitle: string;
    name: string;
    email: string;
    data: Record<string, any>;
    createdAt: string;
    updatedAt: string;
  }>;
  message?: string;
}> {
  console.log("🌐 loadAllUserSubmissions called");
  
  try {
    // Check authentication first
    const sessionCheck = await checkUserSession();
    console.log("🔐 Session check before load:", sessionCheck);
    
    if (!sessionCheck.success || !sessionCheck.user) {
      console.error("❌ Not authenticated - cannot load from backend");
      return { success: false, message: 'Niste prijavljeni' };
    }

    console.log("📤 Sending GET to", `${API_BASE}/submissions`);
    
    const response = await fetch(`${API_BASE}/submissions`, {
      method: 'GET',
      credentials: 'include'
    });

    console.log("📥 Response status:", response.status, response.statusText);

    if (response.status === 401) {
      console.error("❌ 401 Unauthorized");
      return { success: false, message: 'Seja je potekla' };
    }

    if (response.status === 404) {
      console.log("ℹ️ No documents found (404)");
      return { success: true, documents: [], message: 'Še nimate shranjenih dokumentov' };
    }

    if (response.status === 429) {
      console.warn('⚠️ Rate limited');
      return { success: false, message: 'Preveč zahtev' };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Response not OK:", response.status, errorText);
      return { success: false, message: 'Napaka pri nalaganju dokumentov' };
    }

    const result = await response.json();
    console.log("📥 Response data:", result);
    
    if (result.documents) {
      console.log("📊 Loaded", result.documents.length, "documents from backend");
    }
    
    return result;
  } catch (error) {
    console.error('❌ Network error loading user submissions:', error);
    return { success: false, documents: [], message: 'Napaka pri nalaganju dokumentov' };
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

/**
 * Delete/clear saved submission for a form (API v3.0)
 */
export async function clearSavedSubmission(formId: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/submissions/${formId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error clearing saved submission:', error);
    return { success: false, message: 'Napaka pri brisanju podatkov' };
  }
}

/**
 * Save user document metadata to backend
 */
export async function saveUserDocument(document: {
  id: string;
  templateId: string;
  templateTitle: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  data: any;
}): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/user-documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(document)
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, message: error.message || 'Napaka pri shranjevanju dokumenta' };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving user document:', error);
    return { success: false, message: 'Napaka pri shranjevanju dokumenta' };
  }
}

/**
 * Get all user documents from backend
 */
export async function getUserDocuments(): Promise<{
  success: boolean;
  documents?: any[];
  message?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/user-documents`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      return { success: false, message: 'Napaka pri nalaganju dokumentov' };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error getting user documents:', error);
    return { success: false, message: 'Napaka pri nalaganju dokumentov' };
  }
}

/**
 * Delete user document from backend
 */
export async function deleteUserDocument(documentId: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/user-documents/${documentId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      return { success: false, message: 'Napaka pri brisanju dokumenta' };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting user document:', error);
    return { success: false, message: 'Napaka pri brisanju dokumenta' };
  }
}

// Debounce utility for auto-save
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Schedule an auto-save with debouncing (waits for specified delay after last change)
 */
export function scheduleAutoSave(
  documentId: string, 
  formData: Record<string, any>, 
  delay: number = 1000,
  onSaveStart?: () => void,
  onSaveComplete?: (success: boolean) => void,
  documentMeta?: {
    templateId: string;
    templateTitle: string;
    name: string;
  }
): void {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  
  autoSaveTimeout = setTimeout(async () => {
    onSaveStart?.();
    const result = await autoSaveForm(documentId, formData, documentMeta);
    onSaveComplete?.(result.success);
    console.log(result.success ? '✅ Auto-saved to backend' : '❌ Auto-save failed', new Date().toLocaleTimeString());
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

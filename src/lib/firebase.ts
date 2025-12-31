// API-based form operations (replacing direct Firebase access)
// This file now acts as a wrapper around the API client for backward compatibility

import {
    getAllForms as apiGetAllForms,
    getFormById as apiGetFormById,
    saveForm as apiSaveForm,
    deleteForm as apiDeleteForm
} from './api';

// Re-export API functions with the same interface as before
export const saveForm = async (formId: string, formData: any): Promise<{ success: boolean; error?: any }> => {
    const result = await apiSaveForm(formId, formData);
    return { success: result.success, error: result.error };
};

export const getAllForms = async (): Promise<any[]> => {
    return await apiGetAllForms();
};

export const getFormById = async (formId: string): Promise<any | null> => {
    return await apiGetFormById(formId);
};

export const deleteForm = async (formId: string): Promise<{ success: boolean; error?: any }> => {
    const result = await apiDeleteForm(formId);
    return { success: result.success, error: result.error };
};

// Legacy exports for compatibility (these are no longer used but kept for safety)
export const db = null;
export const app = null;

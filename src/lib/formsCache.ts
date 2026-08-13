import {
    getAllForms as apiGetAllForms,
    getFormById as apiGetFormById,
} from "./api";

export const getAllForms = async (): Promise<any[]> => {
    return await apiGetAllForms();
};

export const getFormById = async (formId: string): Promise<any | null> => {
    return await apiGetFormById(formId);
};

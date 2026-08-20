interface FormCategory {
    title: string;
    description?: string | null;
    url?: string;
    color?: string;
    categoryType?: string;
    subcategories: Record<string, unknown>;
}

interface FormWithCategories {
    reportType?: string;
    categories: Record<string, FormCategory>;
}

export const separateOrmozInstitutionCategory = <T extends FormWithCategories>(data: T): T => {
    if (data.reportType !== "healthcare_ormoz" || data.categories["0"]) {
        return data;
    }

    const patientCategory = data.categories["1"];
    const institutionSubcategory = patientCategory?.subcategories?.["1.1"];
    const patientSubcategory = patientCategory?.subcategories?.["1.2"];

    if (!institutionSubcategory || !patientSubcategory) {
        return data;
    }

    const patientSubcategories = Object.fromEntries(
        Object.entries(patientCategory.subcategories).filter(([key]) => key !== "1.1")
    );

    return {
        ...data,
        categories: {
            ...data.categories,
            "0": {
                title: "PODATKI O ZDRAVSTVENI USTANOVI",
                description: "Ustanova in oddelek izvajanja praktičnega pouka",
                url: "podatki-o-ustanovi",
                color: "#DFF4F1",
                categoryType: "institution_data",
                subcategories: {
                    "1.1": institutionSubcategory,
                },
            },
            "1": {
                ...patientCategory,
                subcategories: patientSubcategories,
            },
        },
    } as T;
};

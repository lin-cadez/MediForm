// Script to update zdravstvena-nega.json with proper types and missing sections

import fs from 'fs';

// Load the fetched data
const rawData = fs.readFileSync('c:/Users/linca/MediForm/temp_zdravstvena_nega.json', 'utf8');
const response = JSON.parse(rawData);
const formData = response.data;

// Helper function to check if a hint suggests it should be a number
function shouldBeNumber(hint, title) {
    if (!hint) return false;
    
    // Skip if hint contains compound values like blood pressure (107/77), dates, or text
    if (hint.includes('/') && hint.includes('mmHg')) return false; // Blood pressure
    if (hint.match(/\d+\.\d+\.\d+/)) return false; // Dates like 7.10.2025
    if (hint.match(/[a-zA-Zčšžćđ]/)) return false; // Contains letters (text)
    
    // Check if hint is purely numeric (possibly with decimal)
    const numericHint = hint.replace(',', '.').trim();
    if (!isNaN(parseFloat(numericHint)) && isFinite(numericHint)) {
        return true;
    }
    
    return false;
}

// Helper function to check if it should be a date type
function shouldBeDate(title, hint) {
    const dateKeywords = ['datum', 'date'];
    const titleLower = title.toLowerCase();
    
    for (const keyword of dateKeywords) {
        if (titleLower.includes(keyword)) {
            return true;
        }
    }
    
    // Check if hint looks like a date
    if (hint && hint.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
        return true;
    }
    
    return false;
}

// Helper function to extract description from title (part after " - ")
function extractDescription(title) {
    if (!title) return null;
    const dashIndex = title.indexOf(' - ');
    if (dashIndex !== -1) {
        return title.substring(dashIndex + 3).trim();
    }
    return null;
}

// Process all elements
function processElements(categories) {
    for (const [catId, category] of Object.entries(categories)) {
        // Update category description based on title
        const catDesc = extractDescription(category.title);
        if (catDesc && (!category.description || category.description === '')) {
            category.description = catDesc;
        }
        
        for (const [subId, subcategory] of Object.entries(category.subcategories)) {
            // Update subcategory description based on title
            const subDesc = extractDescription(subcategory.title);
            if (subDesc && (!subcategory.description || subcategory.description === null)) {
                subcategory.description = subDesc;
            }
            
            for (const [elemId, element] of Object.entries(subcategory.elements)) {
                // Skip table elements
                if (element.type === 'table') continue;
                
                // Check for date type
                if (shouldBeDate(element.title, element.hint)) {
                    element.type = 'date';
                    if (!element.defaultValue) {
                        element.defaultValue = 'danes';
                    }
                }
                // Check for number type (only if not already set and not a selection type)
                else if (!element.options && shouldBeNumber(element.hint, element.title)) {
                    element.type = 'num';
                }
            }
        }
    }
}

// Add the missing section for "Aktivnosti zdravstvene nege pri življenjski aktivnosti prehranjevanje in pitje"
function addMissingPrehranjevanjeSection(categories) {
    // Find the right position - should be after category 5 (PREHRANJEVANJE IN PITJE) 
    // and replace or update category 6 if it's incomplete
    
    // Check if category 6 already has proper content
    if (categories['6'] && categories['6'].subcategories['6.1']) {
        const existingElements = categories['6'].subcategories['6.1'].elements;
        
        // If it only has one generic element, we need to replace with proper content
        if (Object.keys(existingElements).length <= 1) {
            // Replace with proper detailed content
            categories['6'] = {
                title: "Aktivnosti zdravstvene nege pri življenjski aktivnosti prehranjevanje in pitje",
                description: "Podatki o izvedeni aktivnosti zdravstvene nege",
                url: "aktivnosti-prehranjevanje",
                color: "#FEF9C3",
                subcategories: {
                    "6.1": {
                        title: "Aktivnosti zdravstvene nege",
                        description: null,
                        elements: {
                            "6.1.1": {
                                title: "Datum izvedbe",
                                unit: null,
                                value: null,
                                hint: "7.10.2025",
                                type: "date",
                                defaultValue: "danes"
                            },
                            "6.1.2": {
                                title: "Identifikacija pacienta",
                                unit: null,
                                value: null,
                                hint: "Identifikacija pravega pacienta (vprašala sem po imenu, priimku, datumu rojstva, preverila sem zapestnico in dokumentacijo).",
                                type: "str"
                            },
                            "6.1.3": {
                                title: "Ocena stopnje samooskrbe v zvezi s prehranjevanjem in pitjem",
                                unit: null,
                                value: null,
                                hint: "Pridobila z opazovanjem, pogovorom s pacientko in sobno medicinsko sestro.",
                                type: "str"
                            },
                            "6.1.4": {
                                title: "Opazovanje pacienta pri hranjenju in pitju",
                                unit: null,
                                value: null,
                                hint: "Pojedla ¾ obroka hrane, zaužila vsa zdravila, popila v omejeni količini.",
                                type: "str"
                            },
                            "6.1.5": {
                                title: "Priprava pacienta in okolja na hranjenje in pitje",
                                unit: null,
                                value: null,
                                hint: "Pojedla je samostojno čez rob postelje za posteljno mizicio.",
                                type: "str"
                            },
                            "6.1.6": {
                                title: "Razdeljevanje hrane/napitkov/prehranskih dodatkov",
                                unit: null,
                                value: null,
                                hint: "Servirala sem ji pladenj s hrano na posteljno mizico in ji dosoljevala hrano ter ji dala skodelico čaja.",
                                type: "str"
                            },
                            "6.1.7": {
                                title: "Beleženje zaužite hrane in tekočine",
                                unit: null,
                                value: null,
                                hint: "Beleženje zaužite tekočine v list za bilanco tekočine po vsakem obroku.",
                                type: "str"
                            },
                            "6.1.8": {
                                title: "Sporočanje in dokumentiranje aktivnosti v zvezi s prehranjevanjem in pitjem",
                                unit: null,
                                value: null,
                                hint: "Dokumentiranje v list za bilanco tekočin in v poročilo ZN.",
                                type: "str"
                            }
                        }
                    }
                }
            };
        }
    }
}

// Fix specific elements that should be numbers
function fixSpecificTypes(categories) {
    // Fix telesna temperatura - should be num
    if (categories['3']?.subcategories['3.1']?.elements['3.1.1']) {
        categories['3'].subcategories['3.1'].elements['3.1.1'].type = 'num';
    }
    
    // Fix trajanje spanja - should be num
    if (categories['11']?.subcategories['11.1']?.elements['11.1.2']) {
        categories['11'].subcategories['11.1'].elements['11.1.2'].type = 'num';
    }
    
    // Fix velikost rane - should stay str because it can have dimensions like "2x3"
    // Keep as is
    
    // Fix volume/quantity fields that might have "/" as hint (means empty/not applicable)
    // These should stay as str or num based on context
}

// Process the data
processElements(formData.categories);
addMissingPrehranjevanjeSection(formData.categories);
fixSpecificTypes(formData.categories);

// Remove the API wrapper and prepare for upload
const cleanedData = {
    id: formData.id,
    title: formData.title,
    description: formData.description,
    predmet: formData.predmet,
    url: formData.url,
    patient_data: formData.patient_data,
    categories: formData.categories
};

// Save to file for review
fs.writeFileSync(
    'c:/Users/linca/MediForm/assets/zdravstvena-nega-updated.json',
    JSON.stringify({ [formData.url]: cleanedData }, null, '\t'),
    'utf8'
);

console.log('Updated file saved to assets/zdravstvena-nega-updated.json');

// Also save the clean version for API upload
fs.writeFileSync(
    'c:/Users/linca/MediForm/scripts/zdravstvena-nega-for-upload.json',
    JSON.stringify(cleanedData, null, '\t'),
    'utf8'
);

console.log('API-ready file saved to scripts/zdravstvena-nega-for-upload.json');

// Print summary of changes
console.log('\n=== Summary of Changes ===');
console.log('1. Updated category 6 with detailed prehranjevanje activities');
console.log('2. Set type to "num" for numeric fields based on hints');
console.log('3. Set type to "date" for date-related fields');
console.log('4. Updated descriptions from titles where applicable');

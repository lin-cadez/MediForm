const fs = require('fs');

// Read the JSON file
const jsonPath = './scripts/zdravstvena-nega-for-upload.json';
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const categories = data.categories;

console.log('=== Converting Category 31 to Table ===\n');

if (categories['31'] && categories['31'].subcategories && categories['31'].subcategories['31.1']) {
    // Define the table structure for category 31 - Diagnostično terapevtske preiskave
    const tableElement = {
        "31.1.1": {
            "title": "Diagnostično terapevtske preiskave",
            "type": "table",
            "columns": [
                {
                    "key": "vrsta_preiskave",
                    "title": "Vrsta diagnostično terapevtske preiskave",
                    "hint": "RTG, CT, MRI, UZ, EKG, EEG, endoskopija, biopsija, laboratorijske preiskave, druge preiskave"
                },
                {
                    "key": "datum_ura",
                    "title": "Datum in ura preiskave",
                    "hint": "/"
                },
                {
                    "key": "priprava",
                    "title": "Priprava pacienta na diagnostično terapevtsko preiskavo",
                    "hint": "tešč, odvzem krvi, odvzem urina, premedikacija, črevesna priprava, psihična priprava"
                },
                {
                    "key": "odvzem_vzorca",
                    "title": "Odvzem vzorca za preiskavo (vrsta vzorca)",
                    "hint": "kri, urin, blato, sputum, bris, likvor, tkivo"
                }
            ],
            "rows": []
        }
    };
    
    // Replace elements with new table structure
    categories['31'].subcategories['31.1'].elements = tableElement;
    
    console.log('Category 31 converted to table with columns:');
    tableElement['31.1.1'].columns.forEach((col, i) => {
        console.log(`  ${i + 1}. ${col.key}: ${col.title}`);
    });
    
    // Write the updated JSON
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, '\t'), 'utf8');
    
    console.log('\nFile saved successfully!');
} else {
    console.log('Category 31 not found!');
    console.log('Available categories:', Object.keys(categories || {}).slice(0, 10));
}

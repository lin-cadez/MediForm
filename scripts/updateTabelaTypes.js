// Script to update categories to use type "tabela"

import fs from 'fs';

// Load the current data
const formData = JSON.parse(
    fs.readFileSync('c:/Users/linca/MediForm/scripts/zdravstvena-nega-for-upload.json', 'utf8')
);

// Update Category 32 - Aktivnosti zdravstvene nege pri izvajanju diagnostično-terapevtskega programa
// This should be a table with columns: Aktivnosti zdravstvene nege | Podatki o izvedeni aktivnosti
formData.categories['32'] = {
    "title": "Aktivnosti zdravstvene nege pri izvajanju diagnostično-terapevtskega programa",
    "description": "Podatki o izvedeni aktivnosti zdravstvene nege",
    "url": "aktivnosti-diagnostika",
    "color": "#C4B5FD",
    "subcategories": {
        "32.1": {
            "title": "Aktivnosti zdravstvene nege",
            "description": null,
            "type": "tabela",
            "columns": [
                "Aktivnosti zdravstvene nege",
                "Podatki o izvedeni aktivnosti zdravstvene nege"
            ],
            "rows": [],
            "elements": {}
        }
    }
};

// Update Category 33 - Terapevtski program
// This should be a table with columns: (empty) | Datum, ura | Posebnosti
formData.categories['33'] = {
    "title": "Terapevtski program",
    "description": "Podatki o terapevtskem programu",
    "url": "terapevtski-program",
    "color": "#99F6E4",
    "subcategories": {
        "33.1": {
            "title": "Terapevtski program",
            "description": null,
            "type": "tabela",
            "columns": [
                "",
                "Datum, ura",
                "Posebnosti"
            ],
            "rows": [
                {
                    "label": "Fizioterapija",
                    "values": ["1×/dan", "/"]
                },
                {
                    "label": "Delovna terapija",
                    "values": ["/", ""]
                }
            ],
            "elements": {}
        }
    }
};

// Update Category 35 - Aktivnosti zdravstvene nege pri oskrbi rane
// This should be a table with columns: Aktivnosti | Podatki | Datum izvedbe
formData.categories['35'] = {
    "title": "Aktivnosti zdravstvene nege pri oskrbi rane",
    "description": "Podatki o izvedeni aktivnosti zdravstvene nege",
    "url": "aktivnosti-rane",
    "color": "#FECACA",
    "subcategories": {
        "35.1": {
            "title": "Aktivnosti zdravstvene nege",
            "description": null,
            "type": "tabela",
            "columns": [
                "Aktivnosti zdravstvene nege",
                "Podatki o izvedeni aktivnosti zdravstvene nege",
                "Datum izvedbe"
            ],
            "rows": [],
            "elements": {}
        }
    }
};

// Save the updated file
fs.writeFileSync(
    'c:/Users/linca/MediForm/scripts/zdravstvena-nega-for-upload.json',
    JSON.stringify(formData, null, '\t'),
    'utf8'
);

console.log('✅ Updated categories 32, 33, and 35 to type "tabela"');
console.log('Category 32 - Aktivnosti pri diagnostiki (tabela)');
console.log('Category 33 - Terapevtski program (tabela)');
console.log('Category 35 - Aktivnosti pri oskrbi rane (tabela)');

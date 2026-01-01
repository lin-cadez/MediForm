const fs = require('fs');

// Read the JSON file
const jsonPath = './scripts/zdravstvena-nega-for-upload.json';
let fileContent = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(fileContent);
const categories = data.categories;

console.log('=== Updating zdravstvena-nega.json ===\n');

// ==========================================
// 1. GENDERED VERBS - Add both male/female versions
// ==========================================
console.log('1. Adding gendered verb options...\n');

// Map of female verbs -> male equivalents
const genderPairs = {
    // Past tense -la -> -l
    'Razkužila': 'Razkužil',
    'Očistila': 'Očistil',
    'Pridobila': 'Pridobil',
    'Pojedla': 'Pojedel',
    'Servirala': 'Serviral',
    'Zamenjala': 'Zamenjal',
    'Umila': 'Umil',
    'Izbrala': 'Izbral',
    'Spodbujala': 'Spodbujal',
    'Upoštevala': 'Upošteval',
    'Opazovala': 'Opazoval',
    'zaužila': 'zaužil',
    'popila': 'popil',
    // Present with -sem ending
    'Umila sem': 'Umil sem',
    'Izbrala sem': 'Izbral sem',
    'Servirala sem': 'Serviral sem',
};

let genderChanges = 0;

// Function to create male version of a sentence
function createMaleVersion(text) {
    let maleText = text;
    for (const [female, male] of Object.entries(genderPairs)) {
        const regex = new RegExp(female, 'g');
        maleText = maleText.replace(regex, male);
    }
    return maleText;
}

// Function to check if text contains gendered verb
function hasGenderedVerb(text) {
    for (const female of Object.keys(genderPairs)) {
        if (text.includes(female)) {
            return true;
        }
    }
    return false;
}

// Function to process options and add gendered versions
function processOptions(options) {
    if (!Array.isArray(options)) return options;
    
    const newOptions = [];
    const seenOptions = new Set();
    
    for (const opt of options) {
        // Add original option if not seen
        if (!seenOptions.has(opt)) {
            newOptions.push(opt);
            seenOptions.add(opt);
        }
        
        // If has gendered verb, add male version
        if (hasGenderedVerb(opt)) {
            const maleVersion = createMaleVersion(opt);
            if (maleVersion !== opt && !seenOptions.has(maleVersion)) {
                // Insert male version right after female version
                newOptions.push(maleVersion);
                seenOptions.add(maleVersion);
                genderChanges++;
            }
        }
    }
    
    return newOptions;
}

// ==========================================
// 2. CHANGE "/" TO "NE" in multiple choice
// ==========================================
console.log('2. Changing "/" to "NE" in multiple choice fields...\n');

let slashToNeCount = 0;

function replaceSlashWithNe(options) {
    if (!Array.isArray(options)) return options;
    
    return options.map(opt => {
        if (opt === '/') {
            slashToNeCount++;
            return 'NE';
        }
        return opt;
    });
}

// ==========================================
// 3. CLEAR TABLE ROWS - Set default empty row
// ==========================================
console.log('3. Clearing table rows and setting default...\n');

let tablesCleaned = 0;

function createDefaultRow(columns) {
    const row = {};
    for (const col of columns) {
        row[col.key] = '/';
    }
    return row;
}

// Process all categories
for (const [catId, category] of Object.entries(categories)) {
    if (!category.subcategories) continue;
    
    for (const [subId, subcategory] of Object.entries(category.subcategories)) {
        if (!subcategory.elements) continue;
        
        for (const [elemId, element] of Object.entries(subcategory.elements)) {
            // Process tables
            if (element.type === 'table') {
                if (element.rows && element.rows.length > 0) {
                    console.log(`  Clearing table: ${elemId} - ${element.title}`);
                    console.log(`    Removed ${element.rows.length} rows`);
                    tablesCleaned++;
                }
                // Set default row with "/" values
                element.rows = [createDefaultRow(element.columns)];
            }
            
            // Process str fields with options
            if (element.type === 'str' && element.options) {
                // Replace "/" with "NE"
                element.options = replaceSlashWithNe(element.options);
                
                // Add gendered verb options
                element.options = processOptions(element.options);
            }
        }
    }
}

// Also update hints that have gendered text - but only for reference, not changing hints
// since they're just examples

// Write the updated JSON
fs.writeFileSync(jsonPath, JSON.stringify(data, null, '\t'), 'utf8');

console.log('\n=== Summary ===');
console.log(`Gender verb options added: ${genderChanges}`);
console.log(`"/" changed to "NE": ${slashToNeCount}`);
console.log(`Tables cleared: ${tablesCleaned}`);
console.log('File saved successfully!');

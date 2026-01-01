const fs = require('fs');

// Read the JSON file
const jsonPath = './scripts/zdravstvena-nega-for-upload.json';
let fileContent = fs.readFileSync(jsonPath, 'utf8');

// Standard split options for "Ocena stopnje samooskrbe" fields
const standardSplitOptions = [
    "Z opazovanjem",
    "S pogovorom s pacientom",
    "S pogovorom s sobno medicinsko sestro",
    "S pregledom dokumentacije"
];

// Combined options pattern to replace
const oldOptionsBlock = `"options": [
								"Z opazovanjem, pogovorom s pacientom in sobno medicinsko sestro.",
								"Z opazovanjem in pogovorom s pacientom.",
								"Z opazovanjem pacienta.",
								"S pregledom dokumentacije in pogovorom s pacientom."
							],
							"option_type": "one"`;

const newOptionsBlock = `"options": [
								"Z opazovanjem",
								"S pogovorom s pacientom",
								"S pogovorom s sobno medicinsko sestro",
								"S pregledom dokumentacije"
							],
							"option_type": "multiple"`;

// Count and replace all occurrences
let fixedCount = 0;
while (fileContent.includes(oldOptionsBlock)) {
    fileContent = fileContent.replace(oldOptionsBlock, newOptionsBlock);
    fixedCount++;
}

console.log(`Fixed ${fixedCount} "Ocena stopnje samooskrbe" fields with combined options\n`);

// Now parse the JSON
const data = JSON.parse(fileContent);

// Also convert category 31 to a table
console.log('\n=== Converting Category 31 to Table ===\n');

if (data['31'] && data['31'].subcategories && data['31'].subcategories['31.1']) {
    const elements = data['31'].subcategories['31.1'].elements;
    
    // Collect column info from existing fields
    const columns = [];
    const columnKeys = [];
    
    for (const [elementId, element] of Object.entries(elements)) {
        const key = element.title
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 30);
        
        columns.push({
            key: key,
            title: element.title,
            hint: element.hint || ""
        });
        columnKeys.push(key);
        
        console.log(`  Column: ${key} -> ${element.title}`);
    }
    
    // Create the new table element
    const newTableElement = {
        "31.1.1": {
            title: "Diagnostično terapevtske preiskave",
            type: "table",
            columns: columns,
            rows: []
        }
    };
    
    // Replace elements with new table structure
    data['31'].subcategories['31.1'].elements = newTableElement;
    console.log('\nCategory 31 converted to table with', columns.length, 'columns');
}

// Write the updated JSON
fs.writeFileSync(jsonPath, JSON.stringify(data, null, '\t'), 'utf8');

console.log('\n=== Summary ===');
console.log('Category 31 converted to table');
console.log('File saved successfully!');

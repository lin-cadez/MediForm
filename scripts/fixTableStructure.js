/**
 * Script to fix table structure in zdravstvena-nega-for-upload.json
 * - Changes "tabela" to "table"
 * - Moves type, columns, rows from subcategory level to element level
 * - Fixes columns structure to have key and title properties
 * - Fixes rows structure to use column keys
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, 'zdravstvena-nega-for-upload.json');

try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);

    console.log('🔧 Fixing table structures...\n');

    // Categories that have tabela type on subcategory level
    const categoriesToFix = ['32', '33', '35'];

    for (const catId of categoriesToFix) {
        const category = data.categories[catId];
        if (!category) {
            console.log(`  ⚠️ Category ${catId} not found`);
            continue;
        }

        console.log(`📁 Processing category ${catId}: ${category.title}`);

        for (const [subId, subcategory] of Object.entries(category.subcategories)) {
            // Check if subcategory has "type": "tabela"
            if (subcategory.type === 'tabela') {
                console.log(`  📋 Fixing subcategory ${subId}: ${subcategory.title}`);
                
                // Get current columns (array of strings)
                const oldColumns = subcategory.columns || [];
                const oldRows = subcategory.rows || [];
                
                // Convert columns to proper format with key and title
                const newColumns = oldColumns.map((colTitle, index) => ({
                    key: `col${index + 1}`,
                    title: colTitle || `Stolpec ${index + 1}`,
                    hint: ''
                }));
                
                // Convert rows to proper format
                let newRows = [];
                if (oldRows.length > 0) {
                    // Check if rows have label/values format
                    if (oldRows[0].label !== undefined && oldRows[0].values !== undefined) {
                        // First column is the label, rest are values
                        newRows = oldRows.map(row => {
                            const newRow = {};
                            newRow['col1'] = row.label || '';
                            if (row.values && Array.isArray(row.values)) {
                                row.values.forEach((val, idx) => {
                                    newRow[`col${idx + 2}`] = val || '';
                                });
                            }
                            return newRow;
                        });
                    }
                }
                
                // Create the table element
                const tableElement = {
                    title: subcategory.title,
                    type: 'table',
                    columns: newColumns,
                    rows: newRows
                };
                
                // Clear subcategory's tabela-specific properties
                delete subcategory.type;
                delete subcategory.columns;
                delete subcategory.rows;
                
                // Add table element to elements
                const elementId = `${subId}.1`;
                subcategory.elements = {
                    [elementId]: tableElement
                };
                
                console.log(`    ✅ Created element ${elementId} with ${newColumns.length} columns and ${newRows.length} rows`);
                console.log(`    📊 Columns: ${newColumns.map(c => c.title).join(', ')}`);
            }
        }
    }

    // Also fix any "many" option_type to "multiple" while we're at it
    let manyCount = 0;
    const fixOptionType = (obj) => {
        if (typeof obj !== 'object' || obj === null) return;
        
        if (obj.option_type === 'many') {
            obj.option_type = 'multiple';
            manyCount++;
        }
        
        for (const value of Object.values(obj)) {
            fixOptionType(value);
        }
    };
    
    fixOptionType(data);
    console.log(`\n🔄 Fixed ${manyCount} "many" option_types to "multiple"`);

    // Write updated data back
    fs.writeFileSync(inputPath, JSON.stringify(data, null, '\t'), 'utf8');
    console.log('\n✅ Successfully updated zdravstvena-nega-for-upload.json');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

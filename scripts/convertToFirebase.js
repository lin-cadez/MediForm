/**
 * Script to convert test.json to Firebase-compatible format
 * 
 * Usage:
 * 1. Run: node scripts/convertToFirebase.js
 * 2. The converted JSON will be saved to scripts/firebase-output.json
 * 3. You can then manually import this into Firebase or use the upload script
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the test.json file
const inputPath = path.join(__dirname, '..', 'assets', 'test.json');
const outputPath = path.join(__dirname, 'firebase-output.json');

try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const testData = JSON.parse(rawData);

    // Convert the nested structure to Firebase-compatible format
    // Firebase stores each form as a separate document
    const firebaseDocuments = [];
    const usedUrls = new Map(); // Track used URLs to detect duplicates

    for (const [formKey, formData] of Object.entries(testData)) {
        let url = formData.url || formKey;
        
        // Check for duplicate URLs and add unique suffix if needed
        if (usedUrls.has(url)) {
            const count = usedUrls.get(url) + 1;
            usedUrls.set(url, count);
            url = `${url}_${count}`;
            console.log(`⚠️  Duplicate URL detected: "${formData.url}" -> renamed to "${url}"`);
        } else {
            usedUrls.set(url, 1);
        }
        
        // Create a Firebase document for each form
        const firebaseDoc = {
            // Document ID will be the unique URL
            id: url,
            title: formData.title,
            description: formData.description || null,
            url: url,
            categories: formData.categories || {},
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        firebaseDocuments.push(firebaseDoc);
    }

    // Save the converted data
    fs.writeFileSync(outputPath, JSON.stringify(firebaseDocuments, null, 2), 'utf8');

    console.log('✅ Conversion successful!');
    console.log(`📁 Output saved to: ${outputPath}`);
    console.log(`📊 Converted ${firebaseDocuments.length} form(s)`);
    console.log('\nDocuments created:');
    firebaseDocuments.forEach(doc => {
        console.log(`  - ${doc.id}: "${doc.title}"`);
    });

    console.log('\n📋 Next steps:');
    console.log('1. Review the generated firebase-output.json file');
    console.log('2. Run: node scripts/uploadToFirebase.js to upload to Firebase');
    console.log('   OR manually import via Firebase Console');

} catch (error) {
    console.error('❌ Error during conversion:', error.message);
    process.exit(1);
}

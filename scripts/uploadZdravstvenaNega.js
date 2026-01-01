/**
 * Script to upload zdravstvena-nega.json to Firebase
 * 
 * Usage: node scripts/uploadZdravstvenaNega.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
    apiKey: "AIzaSyB5sccmiSisPk0qAxgCXzUK4eP3KYzboj8",
    authDomain: "mediform-73012.firebaseapp.com",
    projectId: "mediform-73012",
    storageBucket: "mediform-73012.firebasestorage.app",
    messagingSenderId: "279000449170",
    appId: "1:279000449170:web:76330b8faced5b247da64b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadForm() {
    // Use the updated file from scripts folder
    const inputPath = path.join(__dirname, 'zdravstvena-nega-for-upload.json');

    try {
        // Check if the file exists
        if (!fs.existsSync(inputPath)) {
            console.error('❌ zdravstvena-nega-for-upload.json not found!');
            process.exit(1);
        }

        const rawData = fs.readFileSync(inputPath, 'utf8');
        const formData = JSON.parse(rawData);

        // Document ID
        const docId = formData.url || formData.id || 'zdravstvena-nega';

        // Create the document structure
        const document = {
            id: docId,
            title: formData.title,
            description: formData.description,
            predmet: formData.predmet || "Zdravstvena nega",
            url: formData.url || formKey,
            patient_data: formData.patient_data || null,
            categories: formData.categories
        };

        console.log(`📤 Uploading zdravstvena-nega to Firebase...`);
        console.log(`  Document ID: ${docId}`);
        console.log(`  Title: ${document.title}`);
        console.log(`  Categories: ${Object.keys(document.categories).length}`);
        
        await setDoc(doc(db, "static", docId), document);
        console.log(`✅ Successfully uploaded: ${docId}`);

        console.log('\n🎉 Form uploaded successfully!');
        console.log('You can now access it at: /checklist/zdravstvena-nega');

    } catch (error) {
        console.error('❌ Error uploading to Firebase:', error.message);
        process.exit(1);
    }
}

uploadForm().then(() => {
    process.exit(0);
}).catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});

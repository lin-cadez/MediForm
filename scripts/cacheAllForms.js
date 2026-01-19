/**
 * Script to download all forms from Firebase and cache them in public folder
 * This creates a fallback for when the backend is unavailable
 * 
 * Usage: node scripts/cacheAllForms.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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

async function cacheAllForms() {
    try {
        console.log('📥 Fetching all forms from Firebase...');
        
        // Create the cache directory if it doesn't exist
        const cacheDir = path.join(__dirname, '..', 'public', 'cached-forms');
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
            console.log('📁 Created cache directory: public/cached-forms');
        }

        // Get all documents from the 'static' collection
        const staticCollection = collection(db, 'static');
        const snapshot = await getDocs(staticCollection);

        if (snapshot.empty) {
            console.error('❌ No forms found in Firebase!');
            process.exit(1);
        }

        const formsList = [];
        
        for (const doc of snapshot.docs) {
            const formId = doc.id;
            const data = doc.data();
            
            console.log(`  ✅ Fetched: ${formId} - ${data.title || 'Untitled'}`);
            
            // Save individual form
            const formPath = path.join(cacheDir, `${formId}.json`);
            fs.writeFileSync(formPath, JSON.stringify(data, null, 2), 'utf8');
            
            // Add to forms list (for selector)
            formsList.push({
                id: formId,
                title: data.title || formId,
                description: data.description || null,
                url: `/obrazec/${formId}`
            });
        }

        // Save the forms index for the selector page
        const indexPath = path.join(cacheDir, 'index.json');
        fs.writeFileSync(indexPath, JSON.stringify(formsList, null, 2), 'utf8');
        
        console.log(`\n✅ Successfully cached ${snapshot.docs.length} forms`);
        console.log(`📁 Forms saved to: public/cached-forms/`);
        console.log(`📋 Index saved to: public/cached-forms/index.json`);
        
        // Print the list
        console.log('\n📋 Cached forms:');
        formsList.forEach(form => {
            console.log(`  - ${form.id}: ${form.title}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error caching forms:', error);
        process.exit(1);
    }
}

cacheAllForms();

/**
 * Script to download zdravstvena-nega from Firebase and save to assets
 * 
 * Usage: node scripts/downloadFromFirebase.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
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

async function downloadForm() {
    try {
        console.log('📥 Fetching zdravstvena-nega from Firebase...');
        
        // Get the document from Firestore
        const docRef = doc(db, 'static', 'zdravstvena-nega');
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.error('❌ Document not found in Firebase!');
            process.exit(1);
        }

        const data = docSnap.data();
        console.log('✅ Document fetched successfully');
        console.log(`  Title: ${data.title}`);
        console.log(`  Categories: ${Object.keys(data.categories || {}).length}`);

        // Save to assets folder
        const outputPath = path.join(__dirname, '..', 'assets', 'zdravstvena-nega.json');
        
        // Wrap in the expected format
        const outputData = {
            'zdravstvena-nega': data
        };

        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 4), 'utf8');
        console.log(`\n📁 Saved to: ${outputPath}`);

        console.log('\n🎉 Download complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error fetching from Firebase:', error);
        process.exit(1);
    }
}

downloadForm();

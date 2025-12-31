/**
 * Script to upload converted forms to Firebase
 * 
 * Usage:
 * 1. First run: node scripts/convertToFirebase.js
 * 2. Then run: node scripts/uploadToFirebase.js
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

async function uploadForms() {
    const inputPath = path.join(__dirname, 'firebase-output.json');

    try {
        // Check if the converted file exists
        if (!fs.existsSync(inputPath)) {
            console.error('❌ firebase-output.json not found!');
            console.log('Please run: node scripts/convertToFirebase.js first');
            process.exit(1);
        }

        const rawData = fs.readFileSync(inputPath, 'utf8');
        const forms = JSON.parse(rawData);

        console.log(`📤 Uploading ${forms.length} form(s) to Firebase...\n`);

        for (const form of forms) {
            const docId = form.id;
            console.log(`  Uploading: ${docId} ("${form.title}")...`);
            
            await setDoc(doc(db, "static", docId), form);
            console.log(`  ✅ Uploaded: ${docId}`);
        }

        console.log('\n🎉 All forms uploaded successfully!');
        console.log('You can now view them in your Firebase Console or in the app.');

    } catch (error) {
        console.error('❌ Error uploading to Firebase:', error.message);
        process.exit(1);
    }
}

uploadForms().then(() => {
    process.exit(0);
}).catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});

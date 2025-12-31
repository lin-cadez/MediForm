/**
 * Script to convert and upload pud-obrazec.json to Firebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

async function uploadPudObrazec() {
    const inputPath = path.join(__dirname, '..', 'assets', 'zdravstvena-nega.json');

    try {
        const rawData = fs.readFileSync(inputPath, 'utf8');
        const formData = JSON.parse(rawData);

        console.log('📤 Uploading PUD obrazec to Firebase...\n');

        for (const [formKey, form] of Object.entries(formData)) {
            const docId = form.url || formKey;
            
            const firebaseDoc = {
                id: docId,
                title: form.title,
                description: form.description || null,
                url: form.url || formKey,
                categories: form.categories || {},
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            console.log(`  Uploading: ${docId} ("${form.title}")...`);
            await setDoc(doc(db, "static", docId), firebaseDoc);
            console.log(`  ✅ Uploaded: ${docId}`);
        }

        console.log('\n🎉 PUD obrazec uploaded successfully!');
        console.log('You can now view it in your app.');

    } catch (error) {
        console.error('❌ Error uploading to Firebase:', error.message);
        process.exit(1);
    }
}

uploadPudObrazec().then(() => {
    process.exit(0);
}).catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});

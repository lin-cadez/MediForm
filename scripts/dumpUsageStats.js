/**
 * Full usage dump from Firestore users/{userId}/exports
 *
 * Usage:
 *   node scripts/dumpUsageStats.js
 */

import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
    apiKey: 'AIzaSyB5sccmiSisPk0qAxgCXzUK4eP3KYzboj8',
    authDomain: 'mediform-73012.firebaseapp.com',
    projectId: 'mediform-73012',
    storageBucket: 'mediform-73012.firebasestorage.app',
    messagingSenderId: '279000449170',
    appId: '1:279000449170:web:76330b8faced5b247da64b'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function normalizeTimestamp(raw) {
    if (!raw) return null;

    if (typeof raw?.toDate === 'function') {
        return raw.toDate().toISOString();
    }

    if (typeof raw === 'number') {
        const ms = raw > 1e12 ? raw : raw * 1000;
        return new Date(ms).toISOString();
    }

    if (typeof raw === 'string') {
        const d = new Date(raw);
        return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }

    if (typeof raw === 'object' && typeof raw.seconds === 'number') {
        const ms = (raw.seconds * 1000) + Math.floor((raw.nanoseconds || 0) / 1e6);
        return new Date(ms).toISOString();
    }

    return null;
}

function getSubmissionIso(exportData) {
    return normalizeTimestamp(
        exportData.submittedAt ||
        exportData.createdAt ||
        exportData.timestamp ||
        exportData.exportedAt ||
        exportData.updatedAt ||
        null
    );
}

function inc(map, key) {
    const k = key || 'unknown';
    map[k] = (map[k] || 0) + 1;
}

function buildMarkdownReport(stats) {
    const topUsers = stats.usersByReports.slice(0, 10);
    const monthly = Object.entries(stats.reportsByMonth)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([m, c]) => `- ${m}: ${c}`)
        .join('\n') || '- ni podatkov';

    const exportTypes = Object.entries(stats.exportTypeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([t, c]) => `- ${t}: ${c}`)
        .join('\n') || '- ni podatkov';

    const topUsersText = topUsers
        .map((u, i) => `${i + 1}. ${u.userId} (${u.email || 'brez-email'}) - ${u.reports} porocil`)
        .join('\n') || 'Ni uporabnikov.';

    return `# Statistika uporabe (users/exports)\n\n` +
        `Generirano: ${stats.generatedAt}\n\n` +
        `## Povzetek\n` +
        `- Skupno stevilo uporabnikov: **${stats.totalUsers}**\n` +
        `- Uporabniki z vsaj enim porocilom: **${stats.usersWithReports}**\n` +
        `- Skupno stevilo porocil: **${stats.totalReports}**\n` +
        `- Povprecje porocil na uporabnika (z oddajo): **${stats.avgReportsPerActiveUser}**\n` +
        `- Najbolj pogost uporabnik: **${stats.topUser ? `${stats.topUser.userId} (${stats.topUser.reports})` : 'ni podatkov'}**\n` +
        `- Prva oddaja: **${stats.firstSubmissionAt || 'ni podatkov'}**\n` +
        `- Zadnja oddaja: **${stats.lastSubmissionAt || 'ni podatkov'}**\n\n` +
        `## Top uporabniki po stevilu porocil\n${topUsersText}\n\n` +
        `## Porocila po mesecih\n${monthly}\n\n` +
        `## Tip izvoza\n${exportTypes}\n`;
}

async function dumpUsageStats() {
    try {
        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);

        const users = [];
        const usersByReports = [];
        const exportTypeCounts = {};
        const reportsByMonth = {};
        const reportsByDay = {};

        let totalReports = 0;
        let firstSubmissionAt = null;
        let lastSubmissionAt = null;

        console.log(`Found users: ${usersSnap.size}`);

        for (const userDoc of usersSnap.docs) {
            const userId = userDoc.id;
            const userData = userDoc.data() || {};
            const userEmail = userData.email || null;

            const exportsRef = collection(db, 'users', userId, 'exports');
            const exportsSnap = await getDocs(exportsRef);

            const exports = [];

            for (const expDoc of exportsSnap.docs) {
                const expData = expDoc.data() || {};
                const submittedAt = getSubmissionIso(expData);

                if (submittedAt) {
                    const monthKey = submittedAt.slice(0, 7);
                    const dayKey = submittedAt.slice(0, 10);
                    inc(reportsByMonth, monthKey);
                    inc(reportsByDay, dayKey);

                    if (!firstSubmissionAt || submittedAt < firstSubmissionAt) {
                        firstSubmissionAt = submittedAt;
                    }
                    if (!lastSubmissionAt || submittedAt > lastSubmissionAt) {
                        lastSubmissionAt = submittedAt;
                    }
                }

                inc(exportTypeCounts, expData.exportType || 'unknown');

                exports.push({
                    exportId: expDoc.id,
                    submittedAt,
                    documentName: expData.documentName || null,
                    exportType: expData.exportType || null,
                    email: expData.email || null,
                    userInfo: expData.userInfo || null,
                    raw: expData
                });
            }

            users.push({
                userId,
                email: userEmail,
                profile: userData,
                reportCount: exports.length,
                exports
            });

            usersByReports.push({
                userId,
                email: userEmail,
                reports: exports.length
            });

            totalReports += exports.length;
            console.log(`- ${userId}: ${exports.length} exports`);
        }

        usersByReports.sort((a, b) => b.reports - a.reports);

        const usersWithReports = usersByReports.filter((u) => u.reports > 0).length;
        const avgReportsPerActiveUser = usersWithReports > 0
            ? Number((totalReports / usersWithReports).toFixed(2))
            : 0;

        const stats = {
            generatedAt: new Date().toISOString(),
            source: 'firestore/users/{userId}/exports',
            totalUsers: usersSnap.size,
            usersWithReports,
            totalReports,
            avgReportsPerActiveUser,
            topUser: usersByReports.find((u) => u.reports > 0) || null,
            firstSubmissionAt,
            lastSubmissionAt,
            exportTypeCounts,
            reportsByMonth,
            reportsByDay,
            usersByReports
        };

        const dump = {
            stats,
            users
        };

        const outDir = path.join(__dirname, '..', 'public', 'cached-forms');
        const docsDir = path.join(__dirname, '..', 'docs');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

        const jsonPath = path.join(outDir, 'backend-usage-dump.json');
        const mdPath = path.join(docsDir, 'porocilo-statistika-uporabe.md');

        fs.writeFileSync(jsonPath, JSON.stringify(dump, null, 2), 'utf8');
        fs.writeFileSync(mdPath, buildMarkdownReport(stats), 'utf8');

        console.log(`Saved dump: ${jsonPath}`);
        console.log(`Saved report: ${mdPath}`);
        console.log(`Users: ${stats.totalUsers}`);
        console.log(`Reports: ${stats.totalReports}`);
        console.log(`Top user: ${stats.topUser ? `${stats.topUser.userId} (${stats.topUser.reports})` : 'none'}`);
    } catch (error) {
        console.error('Failed to dump usage stats:', error);
        process.exit(1);
    }
}

dumpUsageStats();

/**
 * scripts/sync-to-sheets.js
 * 
 * Purpose: Sync local MDX article metadata to Google Sheets.
 * Inputs: src/content/article/*.{md,mdx}
 * Outputs: Google Sheets Data
 */

import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import matter from 'gray-matter';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const ARTICLES_DIR = path.join(process.cwd(), 'src/content/article');
const GOOGLE_AUTH_FILE = path.join(process.cwd(), '.agent/secrets/google-keys.json');
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID; // 구글 시트 ID (.env 또는 직접 입력)

async function getArticles() {
    const articles = [];

    function walk(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walk(fullPath);
            } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                const { data } = matter(content);

                // UID가 없으면 상대 경로를 기반으로 생성
                const relativePath = path.relative(ARTICLES_DIR, fullPath);
                const uid = data.uid || relativePath.replace(/\\/g, '/').replace(/\.(md|mdx)$/, '');

                articles.push({
                    uid,
                    slug: data.slug || '',
                    type: data.type || 'article',
                    category: data.category || '',
                    flytitle: data.flytitle || '',
                    headline: data.headline || '',
                    rubric: data.rubric || '',
                    isAccessible: data.isAccessible ?? true,
                    createdDate: data.createdDate || '',
                    releaseDate: data.releaseDate || '',
                    tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
                    authors: Array.isArray(data.authors) ? data.authors.join(', ') : (data.authors || ''),
                    highlight_listed: data.highlight?.listed ?? false,
                    highlight_index: data.highlight?.index || ''
                });
            }
        }
    }

    walk(ARTICLES_DIR);
    return articles;
}

async function syncToSheets() {
    if (!fs.existsSync(GOOGLE_AUTH_FILE)) {
        console.error('Error: Google API key file not found at .agent/secrets/google-keys.json');
        return;
    }

    if (!SPREADSHEET_ID) {
        console.error('Error: GOOGLE_SHEET_ID not found in environment variables.');
        return;
    }

    const auth = new google.auth.GoogleAuth({
        keyFile: GOOGLE_AUTH_FILE,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const articles = await getArticles();
        console.log(`Found ${articles.length} articles logic. Preparing to push...`);

        const header = Object.keys(articles[0]);
        const values = [header, ...articles.map(a => header.map(h => a[h]))];

        // 시트의 'Articles' 탭(또는 첫 번째 탭)에 데이터 쓰기
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Articles!A1', // 시트 이름이 'Articles'여야 합니다.
            valueInputOption: 'RAW',
            resource: { values },
        });

        console.log('✅ Successfully synced current articles to Google Sheets!');
    } catch (err) {
        console.error('❌ Failed to sync to Google Sheets:', err.message);
    }
}

syncToSheets();

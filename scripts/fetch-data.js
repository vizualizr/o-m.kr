/**
 * scripts/fetch-data.js
 * 
 * Purpose: Fetch article metadata from Google Sheets, validate with Zod, and emit JSON.
 * Inputs: Google Sheets Data
 * Outputs: src/data/articles.json
 * 
 * Processing:
 * 1. Auth with Google Sheets API.
 * 2. Fetch rows from 'Articles' sheet.
 * 3. Map rows to structured objects.
 * 4. Validate each object using Zod schema.
 * 5. Write valid data to src/data/articles.json.
 */

import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const GOOGLE_AUTH_FILE = path.join(process.cwd(), '.agent/secrets/google-keys.json');
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const OUTPUT_FILE = path.join(process.cwd(), 'src/data/articles.json');

// Schema Definition (Matches content.config.ts logic)
const ArticleSchema = z.object({
    uid: z.string(),
    slug: z.string(),
    type: z.enum(['page', 'article', 'graphics']).default('article'),
    category: z.string().optional(),
    flytitle: z.string(),
    headline: z.string(),
    rubric: z.string(),
    isAccessible: z.coerce.boolean(),
    createdDate: z.coerce.date(),
    releaseDate: z.coerce.date(),
    tags: z.string().transform(s => s ? s.split(',').map(t => t.trim()) : []),
    authors: z.string().transform(s => s ? s.split(',').map(a => a.trim()) : []),
    highlight: z.object({
        listed: z.coerce.boolean(),
        index: z.coerce.number().int().optional(),
    }),
});

async function fetchData() {
    if (!fs.existsSync(GOOGLE_AUTH_FILE)) {
        console.error('Error: Google API key file not found.');
        return;
    }

    if (!SPREADSHEET_ID) {
        console.error('Error: GOOGLE_SHEET_ID not found.');
        return;
    }

    const auth = new google.auth.GoogleAuth({
        keyFile: GOOGLE_AUTH_FILE,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    try {
        // 첫 번째 시트 이름 가져오기
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        const sheetName = spreadsheet.data.sheets[0].properties.title;
        console.log(`Fetching data from sheet: ${sheetName}`);

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A1:Z1000`,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            console.log('No data found.');
            return;
        }

        const headers = rows[0];
        const dataRows = rows.slice(1);

        const articles = dataRows.map(row => {
            const article = {};
            headers.forEach((header, index) => {
                article[header] = row[index];
            });

            // highlight 구조화
            article.highlight = {
                listed: article.highlight_listed,
                index: article.highlight_index
            };
            delete article.highlight_listed;
            delete article.highlight_index;

            return article;
        }).map(article => {
            // Validation & Transformation
            const result = ArticleSchema.safeParse(article);
            if (!result.success) {
                console.warn(`⚠️ Validation failed for UID: ${article.uid}`, result.error.format());
                return null;
            }
            return result.data;
        }).filter(Boolean);

        // Ensure output directory exists
        const outputDir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(articles, null, 2));
        console.log(`✅ Successfully fetched ${articles.length} articles and saved to ${OUTPUT_FILE}`);

    } catch (err) {
        console.error('❌ Failed to fetch data from Google Sheets:', err.message);
    }
}

fetchData();

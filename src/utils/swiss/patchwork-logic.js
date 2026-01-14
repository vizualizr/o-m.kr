import { getArticleScore } from '../scoring.js';

/**
 * Maps a calculated score and its position to a CSS grid col-span class.
 * 
 * @param {number} score 
 * @param {number} index
 * @returns {string} Tailwind CSS class for grid column spanning.
 */
function mapScoreToPatchworkClass(score, index) {
    if (score >= 2500) {
        if (index === 0) return 'col-span-12'; // Highest score item takes full width
        return 'col-span-12 lg:col-span-8'; // Secondary heroes take 2/3 width
    }
    if (score >= 1800) return 'col-span-12 md:col-span-6 lg:col-span-4'; // Featured
    return 'col-span-12 md:col-span-6 lg:col-span-4'; // Standard
}

/**
 * Maps articles to a patchwork grid using a Greedy Row Packing algorithm.
 * This ensures no gaps in the layout by adjusting widths within each row.
 * 
 * @param {import('astro:content').CollectionEntry<'articles'>[]} articles 
 * @returns {Array} Array of articles with assigned scores and gapless grid classes.
 */
export function patchworkMapper(articles) {
    const scoredArticles = articles
        .filter(article => article.data.type !== 'page')
        .map(article => ({
            ...article,
            _score: getArticleScore(article),
        }))
        .sort((a, b) => {
            if (b._score !== a._score) return b._score - a._score;
            const dateA = new Date(a.data.releaseDate).getTime();
            const dateB = new Date(b.data.releaseDate).getTime();
            if (dateB !== dateA) return dateB - dateA;
            return a.id.localeCompare(b.id);
        });

    const result = [];
    let currentRow = [];
    let currentRowWidth = 0;

    scoredArticles.forEach((article, index) => {
        // Step 1: Assign initial preferred width based on score
        let preferredWidth = 4; // Default to 1/3 width
        if (article._score >= 2500) preferredWidth = 12; // Hero
        else if (article._score >= 2000) preferredWidth = 8; // Featured
        else if (article._score >= 1800) preferredWidth = 6; // Half

        const isLastItem = index === scoredArticles.length - 1;

        if (currentRowWidth + preferredWidth > 12 || isLastItem) {
            // Step 2: Finalize the current row or handle the last item
            if (isLastItem) {
                // If it's the last item, it MUST take all remaining space (or full width if new row)
                const remainingSpace = 12 - currentRowWidth;
                if (preferredWidth > remainingSpace && currentRowWidth > 0) {
                    // Finalize current row by expanding its items, then start a new row for the last item
                    finalizeRow(currentRow, 12 - currentRowWidth);
                    article._gridClass = 'col-span-12';
                    result.push(article);
                } else {
                    // Last item fits or is the first in its row
                    article._gridClass = `col-span-${remainingSpace || preferredWidth}`;
                    result.push(article);
                }
            } else {
                // Not the last item, but current row is full. Finalize row.
                finalizeRow(currentRow, 12 - currentRowWidth);

                // Start a new row with the current item
                currentRow = [article];
                currentRowWidth = preferredWidth;
                article._gridClass = `col-span-${preferredWidth}`;
                result.push(article);
            }
        } else {
            // Step 3: Add to current row
            currentRow.push(article);
            currentRowWidth += preferredWidth;
            article._gridClass = `col-span-${preferredWidth}`;
            result.push(article);
        }
    });

    return result;
}

/**
 * Expands items in a row to fill the remaining gap.
 */
function finalizeRow(row, gap) {
    if (gap <= 0 || row.length === 0) return;

    // Simplest strategy: give the gap to the first (most important) item in the row
    const firstItem = row[0];
    const currentSpan = parseInt(firstItem._gridClass.match(/col-span-(\d+)/)[1]);
    firstItem._gridClass = `col-span-${currentSpan + gap}`;
}

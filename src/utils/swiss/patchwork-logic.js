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
 * Sorts and maps articles to patchwork-ready objects.
 * 
 * @param {import('astro:content').CollectionEntry<'articles'>[]} articles 
 * @returns {Array} Array of articles with assigned scores and grid classes.
 */
export function patchworkMapper(articles) {
    return articles
        .filter(article => article.data.type !== 'page')
        .map(article => ({
            ...article,
            _score: getArticleScore(article),
        }))
        .sort((a, b) => {
            // 1. Primary: Score descending
            if (b._score !== a._score) return b._score - a._score;

            // 2. Secondary: Release date descending
            const dateA = new Date(a.data.releaseDate).getTime();
            const dateB = new Date(b.data.releaseDate).getTime();
            if (dateB !== dateA) return dateB - dateA;

            // 3. Tertiary: ID/Headline ascending (Deterministic)
            return a.id.localeCompare(b.id);
        })
        .map((article, index) => ({
            ...article,
            _gridClass: mapScoreToPatchworkClass(article._score, index),
        }));
}

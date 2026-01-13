import { getArticleScore } from './scoring.js';

/**
 * Maps a calculated score to a CSS grid col-span class.
 * 
 * @param {number} score 
 * @returns {string} Tailwind CSS class for grid column spanning.
 */
function mapScoreToGridClass(score) {
    if (score >= 2500) return 'col-span-12 lg:col-span-8'; // Hero
    if (score >= 1800) return 'col-span-12 md:col-span-6 lg:col-span-4'; // Featured
    return 'col-span-12 md:col-span-6 lg:col-span-4'; // Standard (can be refined)
}

/**
 * Sorts and maps articles to grid-ready objects.
 * 
 * @param {import('astro:content').CollectionEntry<'articles'>[]} articles 
 * @returns {Array} Array of articles with assigned scores and grid classes.
 */
export function gridMapper(articles) {
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
        .map(article => ({
            ...article,
            _gridClass: mapScoreToGridClass(article._score),
        }));
}

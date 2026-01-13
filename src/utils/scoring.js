/**
 * Calculates a numerical score for an article based on its metadata.
 * 
 * @param {import('astro:content').CollectionEntry<'articles'>} article 
 * @returns {number} The calculated importance score.
 */
export function getArticleScore(article) {
    const { data } = article;

    // 0. Exclude 'page' type (though the caller should filter this)
    if (data.type === 'page') return 0;

    let score = 0;

    // 1. Listed status (+1000)
    if (data.highlight?.listed) {
        score += 1000;
    }

    // 2. Index weighting (1 -> 1000, 5 -> 200)
    const index = data.highlight?.index || 5;
    score += (6 - index) * 200;

    // 3. Authors count (+50 per author)
    const authorCount = data.authors?.length || 0;
    score += authorCount * 50;

    // 4. Research Density (Date difference)
    // (releaseDate - createdDate) in days * 10
    if (data.releaseDate && data.createdDate) {
        const rel = new Date(data.releaseDate);
        const cre = new Date(data.createdDate);
        const diffTime = Math.abs(rel - cre);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        score += diffDays * 10;
    }

    // 5. Content Type Bonus
    if (data.type === 'graphics') {
        score += 300;
    }

    return score;
}

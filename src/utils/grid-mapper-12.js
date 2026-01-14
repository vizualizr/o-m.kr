import { getArticleScore } from './scoring.js';

/**
 * 정규분포와 12x12 격자 패킹 알고리즘을 사용한 고급 그리드 매퍼
 */

/**
 * 점수 리스트의 평균과 표준편차를 계산합니다.
 */
function getStats(scores) {
    const n = scores.length;
    if (n === 0) return { mean: 0, stdDev: 0 };
    const mean = scores.reduce((a, b) => a + b, 0) / n;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    return { mean, stdDev: Math.sqrt(variance) };
}

/**
 * 정규분포(Z-score)를 기반으로 6단계 위계(Hierarchy)를 결정합니다.
 */
function getHierarchy(score, mean, stdDev) {
    if (stdDev === 0) return 3;
    const z = (score - mean) / stdDev;
    if (z >= 1.5) return 1;
    if (z >= 0.5) return 2;
    if (z >= 0) return 3;
    if (z >= -0.5) return 4;
    if (z >= -1.5) return 5;
    return 6;
}

/**
 * 12x12 격자 시스템 (총 144셀)
 */
export function gridMapper12(articles) {
    const filteredArticles = articles.filter(a => a.data.type !== 'page');
    const scoredArticles = filteredArticles.map(a => ({
        ...a,
        _score: getArticleScore(a)
    })).sort((a, b) => b._score - a._score);

    if (scoredArticles.length === 0) return [];

    // 1. 위계 산출 (정규분포 기준)
    const scores = scoredArticles.map(a => a._score);
    const { mean, stdDev } = getStats(scores);

    scoredArticles.forEach(a => {
        a._hierarchy = getHierarchy(a._score, mean, stdDev);
    });

    // 2. 면적 할당 (총 144셀)
    const totalScore = scores.reduce((a, b) => a + b, 0);
    let totalAssigned = 0;

    // 소수점 이하 처리를 위해 Largest Remainder Method 유사 방식 사용
    scoredArticles.forEach(a => {
        a._targetArea = (a._score / totalScore) * 144;
        a._baseArea = Math.max(1, Math.floor(a._targetArea));
        a._remainder = a._targetArea - a._baseArea;
        totalAssigned += a._baseArea;
    });

    // 남은 셀들을 나머지가 큰 순서대로 배분
    const remaining = 144 - totalAssigned;
    if (remaining > 0) {
        scoredArticles
            .sort((a, b) => b._remainder - a._remainder)
            .slice(0, remaining)
            .forEach(a => {
                a._baseArea += 1;
            });
    }

    // 다시 점수순 정렬
    scoredArticles.sort((a, b) => b._score - a._score);

    // 3. 2D 패킹 (12x12 Matrix)
    const grid = Array(12).fill().map(() => Array(12).fill(false));
    const result = [];

    scoredArticles.forEach(article => {
        const area = article._baseArea;
        let placed = false;

        // 가능한 사각형 형태 후보군 생성 (면적에 맞는 WxH)
        const candidates = [];
        for (let w = 12; w >= 1; w--) {
            for (let h = 12; h >= 1; h--) {
                if (w * h === area) candidates.push({ w, h });
            }
        }
        // 가능한 근사치도 포함 (딱 떨어지지 않을 경우 대비)
        if (candidates.length === 0) {
            for (let w = 12; w >= 1; w--) {
                const h = Math.round(area / w);
                if (h >= 1 && h <= 12) candidates.push({ w, h, diff: Math.abs(w * h - area) });
            }
            candidates.sort((a, b) => a.diff - b.diff);
        }

        // 그리드 순회하며 배치 가능한 첫 위치 찾기
        for (let r = 0; r < 12 && !placed; r++) {
            for (let c = 0; c < 12 && !placed; c++) {
                if (!grid[r][c]) {
                    // 후보 사각형들 중 가장 잘 맞는 것 선택
                    for (const cand of candidates) {
                        if (canPlace(grid, r, c, cand.w, cand.h)) {
                            place(grid, r, c, cand.w, cand.h);
                            article._gridClass = `col-span-${cand.w} row-span-${cand.h} col-start-${c + 1} row-start-${r + 1}`;
                            placed = true;
                            break;
                        }
                    }
                }
            }
        }

        // 배치 실패 시 1x1이라도 강제 배치 시도
        if (!placed) {
            for (let r = 0; r < 12 && !placed; r++) {
                for (let c = 0; c < 12 && !placed; c++) {
                    if (!grid[r][c]) {
                        grid[r][c] = true;
                        article._gridClass = `col-span-1 row-span-1 col-start-${c + 1} row-start-${r + 1}`;
                        placed = true;
                    }
                }
            }
        }

        result.push(article);
    });

    return result;
}

function canPlace(grid, r, c, w, h) {
    if (r + h > 12 || c + w > 12) return false;
    for (let i = r; i < r + h; i++) {
        for (let j = c; j < c + w; j++) {
            if (grid[i][j]) return false;
        }
    }
    return true;
}

function place(grid, r, c, w, h) {
    for (let i = r; i < r + h; i++) {
        for (let j = c; j < c + w; j++) {
            grid[i][j] = true;
        }
    }
}

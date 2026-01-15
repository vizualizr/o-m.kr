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
 * 정규분포(Z-score)를 기반으로 3단계 위계(Hierarchy)를 결정합니다.
 */
function getHierarchy(score, mean, stdDev) {
    if (stdDev === 0) return 2;
    const z = (score - mean) / stdDev;
    if (z >= 0.5) return 1;  // 상위 (평균 + 0.5 표준편차 이상)
    if (z >= -0.5) return 2; // 중위 (평균 ± 0.5 표준편차)
    return 3;                // 하위 (평균 - 0.5 표준편차 미만)
}

/**
 * 12xN 격자 시스템 (12열 고정, 행은 내용에 따라 확장)
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

    // 2. 면적 할당 (위계별 최소 크기 보장, 동적 행 확장)
    // 상위(1): 최소 24셀 (6x4), 중위(2): 최소 16셀 (4x4), 하위(3): 최소 8셀 (4x2)
    const totalScore = scores.reduce((a, b) => a + b, 0);
    let totalAssignedArea = 0;

    scoredArticles.forEach(a => {
        // 위계별 최소 면적 설정
        let minArea;
        if (a._hierarchy === 1) minArea = 24;      // 상위: 6x4
        else if (a._hierarchy === 2) minArea = 16; // 중위: 4x4
        else minArea = 8;                          // 하위: 4x2

        // 기본 144셀 기준 비율 계산
        const rawArea = (a._score / totalScore) * 144;
        // 위계별 최소 크기 이상, 정수로 반올림
        a._baseArea = Math.max(minArea, Math.round(rawArea));
        totalAssignedArea += a._baseArea;
    });

    // 총 필요한 면적에 맞춰 행(Row) 개수 계산 (최소 12행)
    const totalRows = Math.max(12, Math.ceil(totalAssignedArea / 12));

    // 다시 점수순 정렬
    scoredArticles.sort((a, b) => b._score - a._score);

    // 3. 2D 패킹 (12 x TotalRows Matrix)
    const grid = Array(totalRows).fill().map(() => Array(12).fill(false));
    const result = [];

    scoredArticles.forEach(article => {
        const area = article._baseArea;
        let placed = false;

        // 가능한 사각형 형태 후보군 생성
        const candidates = [];

        // 탐색 범위: 최대 너비 12
        for (let w = 12; w >= 1; w--) {
            if (area % w === 0) {
                const h = area / w;
                candidates.push({ w, h });
            }
        }

        // 딱 떨어지는 형태가 없을 경우 근사치 탐색
        if (candidates.length === 0) {
            for (let w = 12; w >= 1; w--) {
                const h = Math.round(area / w);
                if (h >= 1) candidates.push({ w, h, diff: Math.abs(w * h - area) });
            }
            candidates.sort((a, b) => a.diff - b.diff);
        }

        // 그리드 순회하며 배치 가능한 첫 위치 찾기
        for (let r = 0; r < totalRows && !placed; r++) {
            for (let c = 0; c < 12 && !placed; c++) {
                if (!grid[r][c]) {
                    for (const cand of candidates) {
                        if (canPlace(grid, r, c, cand.w, cand.h, totalRows)) {
                            place(grid, r, c, cand.w, cand.h);
                            article._gridClass = `col-span-${cand.w} row-span-${cand.h} col-start-${c + 1} row-start-${r + 1}`;
                            placed = true;
                            break;
                        }
                    }
                }
            }
        }

        // 배치 실패 시: 첫 번째 빈 공간에 1x1 할당
        if (!placed) {
            for (let r = 0; r < totalRows && !placed; r++) {
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

function canPlace(grid, r, c, w, h, maxRows) {
    if (r + h > maxRows || c + w > 12) return false;
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

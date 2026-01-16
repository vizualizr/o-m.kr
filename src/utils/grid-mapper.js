import { getArticleScore } from './scoring.js';
import gridRules from './swiss/grid-rule.json';

/**
 * ==========================================
 * 1. 유틸리티 (Utilities)
 * ==========================================
 */

const RngUtils = {
    // DJB2 Hash for Seed
    generateSeed(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
        }
        return hash >>> 0;
    },

    // Mulberry32 PRNG
    createRng(seed) {
        let state = seed;
        return function () {
            let t = state += 0x6D2B79F5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    },

    getItem(rng, arr) {
        return arr[Math.floor(rng() * arr.length)];
    }
};

const ArrayUtils = {
    isEqual(a, b) {
        if (a === b) return true;
        if (Array.isArray(a) && Array.isArray(b)) {
            return a.length === b.length && a.every((v, i) => v === b[i]);
        }
        return false;
    },

    toArray(val) {
        if (val === null || val === undefined) return [];
        return Array.isArray(val) ? val : [val];
    }
};

/**
 * ==========================================
 * 2. 그리드 생성 엔진 (Grid Generation Engine)
 * ==========================================
 */

const GridEngine = {
    /**
     * 특정 행(rowIndex)에 적용할 규칙을 찾습니다.
     */
    getRule(rules, rowIndex) {
        const order = rowIndex + 1;
        const specific = rules.rows.find(row =>
            Array.isArray(row.order) ? row.order.includes(order) : row.order === order
        );
        return specific || rules.rows.find(row => row.order === 0);
    },

    /**
     * 가능한 Divider 조합을 계산합니다. (메모이제이션 가능)
     */
    calculateDividerOptions(totalCols, cellCount, minWidth) {
        const results = [];

        function distribute(widths, remain, k) {
            if (k === 1) {
                if (remain >= minWidth) results.push([...widths, remain]);
                return;
            }
            const maxW = remain - (minWidth * (k - 1));
            for (let w = minWidth; w <= maxW; w++) {
                distribute([...widths, w], remain - w, k - 1);
            }
        }

        distribute([], totalCols, cellCount);

        // 너비 배열([3,3,6])을 Divider 위치([3,6])로 변환
        return results.map(widths => {
            const dividers = [];
            let sum = 0;
            for (let i = 0; i < widths.length - 1; i++) {
                sum += widths[i];
                dividers.push(sum);
            }
            return dividers.length === 1 ? dividers[0] : dividers;
        });
    },

    /**
     * 중복을 최소화하여 Divider를 선택합니다.
     */
    selectDivider(rng, options, history) {
        const candidates = Array.isArray(options) ? options : [options];
        const allPrevDividers = history.flatMap(d => ArrayUtils.toArray(d));

        // 1순위: 이전 기록들과 겹치지 않는 것
        const noOverlap = candidates.filter(opt => {
            const current = ArrayUtils.toArray(opt);
            return !current.some(d => allPrevDividers.includes(d));
        });
        if (noOverlap.length > 0) return RngUtils.getItem(rng, noOverlap);

        // 2순위: 바로 직전 행과 똑같지 않은 것
        const lastVal = history[0] || null;
        const notSame = candidates.filter(opt => !ArrayUtils.isEqual(opt, lastVal));
        if (notSame.length > 0) return RngUtils.getItem(rng, notSame);

        // 3순위: 랜덤
        return RngUtils.getItem(rng, candidates);
    },

    /**
     * 이전 값과 다른 옵션을 선택합니다 (rowHeight 용)
     */
    selectDistinct(rng, options, prevValue) {
        const candidates = ArrayUtils.toArray(options);
        const valid = candidates.filter(v => !ArrayUtils.isEqual(v, prevValue));
        return valid.length > 0 ? RngUtils.getItem(rng, valid) : RngUtils.getItem(rng, candidates);
    }
};

/**
 * ==========================================
 * 3. 메인 로직 (Main Logic)
 * ==========================================
 */

/**
 * 그리드의 논리적 구조(Cells)를 생성합니다.
 * 아티클 데이터 없이 순수하게 '공간'만 생성합니다.
 */
function generateGridStructure(rng, targetCount, rules) {
    const cells = [];
    let currentCount = 0;
    let rowIndex = 0;

    // State Tracking
    let prevRowState = { cellCount: null, rowHeight: null };
    const dividerHistory = []; // [recent, old]

    while (currentCount < targetCount) {
        const rule = GridEngine.getRule(rules, rowIndex);

        // 1. Variant (Cell Count) 선택
        let variants = rule.variants;
        let validVariants = variants.filter(v => v.cellCount !== prevRowState.cellCount);
        if (validVariants.length === 0) validVariants = variants;

        const selectedVariant = RngUtils.getItem(rng, validVariants);
        const { cellCount, rowHeight: heightOpts, dividerPositions } = selectedVariant;

        // 2. Row Height 선택
        const rowHeight = GridEngine.selectDistinct(rng, heightOpts, prevRowState.rowHeight);

        // 3. Divider & Flex Ratios 계산
        let flexRatios = [];
        let selectedDivider = null;

        if (cellCount === 1) {
            flexRatios = [rules.colCount];
            selectedDivider = 0;
        } else {
            // dividerPositions가 JSON에 없으면 동적 계산 (minColsCount 사용)
            const options = dividerPositions
                ? dividerPositions
                : GridEngine.calculateDividerOptions(rules.colCount, cellCount, rules.minColsCount);

            selectedDivider = GridEngine.selectDivider(rng, options, dividerHistory);

            // Flex Ratio 변환
            const dividers = ArrayUtils.toArray(selectedDivider).slice().sort((a, b) => a - b);
            const points = [0, ...dividers, rules.colCount];
            for (let i = 0; i < points.length - 1; i++) {
                flexRatios.push(points[i + 1] - points[i]);
            }
        }

        // 4. 셀 생성
        for (let i = 0; i < cellCount; i++) {
            const ratio = flexRatios[i];
            cells.push({
                rowIndex,
                cellIndex: i,
                flexRatio: ratio,
                rowHeight: rowHeight,
                totalCellsInRow: cellCount,
                area: ratio * rowHeight // 중요: 우선순위 결정 요인
            });
        }

        // 상태 업데이트
        currentCount += cellCount;
        prevRowState = { cellCount, rowHeight };
        dividerHistory.unshift(selectedDivider);
        if (dividerHistory.length > 2) dividerHistory.pop();
        rowIndex++;
    }

    return cells;
}

/**
 * 생성된 셀들을 '좋은 자리' 순서대로 정렬합니다.
 * 기준: 면적(Large) > 상단(Top) > 좌측(Left)
 */
function rankCellsByQuality(cells) {
    return cells.slice().sort((a, b) => {
        if (b.area !== a.area) return b.area - a.area;      // 면적 큰 순
        if (a.rowIndex !== b.rowIndex) return a.rowIndex - b.rowIndex; // 상단 행 우선
        return a.cellIndex - b.cellIndex;                   // 좌측 열 우선
    });
}

/**
 * 메인 Export 함수
 * 아티클을 받아 결정론적 그리드를 생성하고 매핑 정보를 주입합니다.
 */
export function gridMapper12(articles) {
    // Debug: Check input length and metadata
    console.log(`[GridMapper] Input articles: ${articles.length}`);
    articles.forEach(a => {
        console.log(`[GridMapper] Loaded: ID=${a.id} | Slug=${a.data.slug} | Type=${a.data.type}`);
    });

    // 1. 데이터 준비 (필터링 및 점수 계산)
    const validArticles = articles
        .filter(a => {
            const isPage = a.data.type === 'page';
            // listed가 명시적으로 false인 경우 제외 (undefined는 true로 간주하거나 스키마 기본값 따름)
            const isUnlisted = a.data.highlight?.listed === false;

            if (isPage) console.log(`[GridMapper] Filtered out (page): ${a.id}`);
            if (isUnlisted) console.log(`[GridMapper] Filtered out (unlisted): ${a.id}`);

            return !isPage && !isUnlisted;
        })
        .map(a => ({ ...a, _score: getArticleScore(a) }))
        .sort((a, b) => b._score - a._score); // 점수 높은 순 정렬

    console.log(`[GridMapper] Valid articles: ${validArticles.length}`);

    if (validArticles.length === 0) return [];

    // 2. RNG 초기화 (결정론적 레이아웃을 위해 아티클 ID 기반 시드 사용)
    const seedStr = validArticles.map(a => a.id).join('');
    const seed = RngUtils.generateSeed(seedStr);
    const rng = RngUtils.createRng(seed);

    // 3. 그리드 구조 생성 (아티클 수만큼 공간 확보)
    const rawCells = generateGridStructure(rng, validArticles.length, gridRules);

    // 4. 셀 품질 순위 매기기
    // (생성된 셀이 아티클보다 많을 경우, 품질이 낮은 뒤쪽 셀들이 버려짐)
    const rankedCells = rankCellsByQuality(rawCells).slice(0, validArticles.length);

    // 5. 매핑 (High Score Article <-> High Quality Cell)
    return validArticles.map((article, index) => {
        const cell = rankedCells[index];

        // 원본 객체를 변경하기보다 새 객체/속성을 반환하는 것이 안전하지만,
        // 기존 로직 유지를 위해 속성 주입 방식을 사용
        article._gridInfo = {
            rowIndex: cell.rowIndex,
            cellIndex: cell.cellIndex,
            flexRatio: cell.flexRatio,
            rowHeight: cell.rowHeight,
            totalCellsInRow: cell.totalCellsInRow,
            area: cell.area
        };

        return article;
    });
}

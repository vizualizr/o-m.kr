import { getArticleScore } from './scoring.js';
import gridRules from './swiss/grid-rule-12-cols.json';

/**
 * 랜덤 그리드 생성 로직을 사용한 12열 그리드 매퍼
 * HTML 샘플 파일의 동적 규칙 기반 로직을 적용
 */

// ============ 유틸리티 함수 ============

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function isEqual(a, b) {
    if (a === null || b === null) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }
    return a === b;
}

function getDividerArray(val) {
    if (val === null || val === undefined) return [];
    return Array.isArray(val) ? val : [val];
}

/**
 * 가능한 Divider 조합을 동적으로 계산
 * @param {number} totalCols - 총 열 개수 (12)
 * @param {number} cellCount - 셀 개수
 * @param {number} minWidth - 최소 셀 너비
 * @returns {Array} Divider 위치 배열들
 */
function getPossibleDividers(totalCols, cellCount, minWidth) {
    const validWidthConfigs = [];

    function distribute(currentWidths, remainingWidth, cellsLeft) {
        if (cellsLeft === 1) {
            if (remainingWidth >= minWidth) {
                validWidthConfigs.push([...currentWidths, remainingWidth]);
            }
            return;
        }

        const maxPossibleWidth = remainingWidth - (minWidth * (cellsLeft - 1));

        for (let w = minWidth; w <= maxPossibleWidth; w++) {
            distribute([...currentWidths, w], remainingWidth - w, cellsLeft - 1);
        }
    }

    distribute([], totalCols, cellCount);

    // 너비를 Divider 위치로 변환
    return validWidthConfigs.map(widths => {
        const dividers = [];
        let sum = 0;
        for (let i = 0; i < widths.length - 1; i++) {
            sum += widths[i];
            dividers.push(sum);
        }
        return dividers.length === 1 ? dividers[0] : dividers;
    });
}

/**
 * Divider 선택: 이전 행과 겹치지 않는 것을 우선 선택
 */
function selectDividerWithLeastOverlap(options, prevValue) {
    let candidates = Array.isArray(options) ? options : [options];
    const prevDividers = getDividerArray(prevValue);

    // 1. 겹치지 않는 후보 찾기
    const noOverlapCandidates = candidates.filter(opt => {
        const optDividers = getDividerArray(opt);
        const hasIntersection = optDividers.some(d => prevDividers.includes(d));
        return !hasIntersection;
    });

    if (noOverlapCandidates.length > 0) {
        return getRandomItem(noOverlapCandidates);
    }

    // 2. 완전히 똑같지 않은 것 찾기
    const notSameCandidates = candidates.filter(opt => !isEqual(opt, prevValue));
    if (notSameCandidates.length > 0) {
        return getRandomItem(notSameCandidates);
    }

    // 3. 대안이 없으면 아무거나
    return getRandomItem(candidates);
}

/**
 * 이전 값과 다른 옵션 선택 (rowHeight용)
 */
function selectDifferentOption(options, prevValue) {
    let candidates = Array.isArray(options) ? options : [options];
    const validCandidates = candidates.filter(opt => !isEqual(opt, prevValue));

    if (validCandidates.length > 0) {
        return getRandomItem(validCandidates);
    }
    return getRandomItem(candidates);
}

/**
 * 현재 행 인덱스에 해당하는 규칙 찾기
 */
function getRuleForIndex(rowIndex, rules) {
    const currentOrder = rowIndex + 1;

    const specificRule = rules.rows.find(row => {
        if (Array.isArray(row.order)) {
            return row.order.includes(currentOrder);
        }
        return row.order === currentOrder;
    });

    if (specificRule) return specificRule;
    return rules.rows.find(row => row.order === 0);
}

// ============ 메인 함수 ============

/**
 * 12열 그리드 매퍼 - 동적 규칙 기반
 * @param {Array} articles - 아티클 배열
 * @returns {Array} 그리드 정보가 추가된 아티클 배열
 */
export function gridMapper12(articles) {
    const filteredArticles = articles.filter(a => a.data.type !== 'page');

    // 점수 계산 및 정렬
    const scoredArticles = filteredArticles.map(a => ({
        ...a,
        _score: getArticleScore(a)
    })).sort((a, b) => b._score - a._score);

    if (scoredArticles.length === 0) return [];

    const result = [];
    let rowIndex = 0;
    let articleIndex = 0;

    let prevRowState = {
        cellCount: null,
        dividerPositions: null,
        rowHeight: null
    };

    // 모든 아티클을 배치할 때까지 반복
    while (articleIndex < scoredArticles.length) {
        const rule = getRuleForIndex(rowIndex, gridRules);

        // 1. Variant 선택 (이전 행과 cellCount가 다른 것 선호)
        const variantCandidates = rule.variants;
        let validVariants = variantCandidates.filter(v => v.cellCount !== prevRowState.cellCount);
        if (validVariants.length === 0) validVariants = variantCandidates;

        const selectedVariant = getRandomItem(validVariants);
        const cellCount = selectedVariant.cellCount;

        // 2. Row Height 선택
        const rowHeightOptions = selectedVariant.rowHeight;
        const selectedRowHeight = selectDifferentOption(rowHeightOptions, prevRowState.rowHeight);

        // 3. Divider Position 선택 (동적 계산)
        let selectedDivider = null;
        let flexRatios = [];

        if (cellCount === 1) {
            flexRatios = [gridRules.colCount];
            selectedDivider = 0;
        } else {
            const dividerOptions = getPossibleDividers(
                gridRules.colCount,
                cellCount,
                gridRules.minColsCount
            );

            selectedDivider = selectDividerWithLeastOverlap(dividerOptions, prevRowState.dividerPositions);

            // Flex 비율 계산
            let dividers = Array.isArray(selectedDivider) ? [...selectedDivider] : [selectedDivider];
            dividers.sort((a, b) => a - b);

            const points = [0, ...dividers, gridRules.colCount];

            for (let i = 0; i < points.length - 1; i++) {
                flexRatios.push(points[i + 1] - points[i]);
            }
        }

        // 4. 현재 행에 아티클 배치
        for (let i = 0; i < cellCount && articleIndex < scoredArticles.length; i++) {
            const article = scoredArticles[articleIndex];

            // 그리드 클래스 정보 추가
            article._gridInfo = {
                rowIndex: rowIndex,
                cellIndex: i,
                flexRatio: flexRatios[i],
                rowHeight: selectedRowHeight,
                totalCellsInRow: cellCount
            };

            result.push(article);
            articleIndex++;
        }

        // 5. 상태 업데이트
        prevRowState = {
            cellCount: cellCount,
            rowHeight: selectedRowHeight,
            dividerPositions: selectedDivider
        };
        rowIndex++;
    }

    return result;
}

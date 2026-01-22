import { getArticleScore } from './scoring.js';
import gridRules from './swiss/grid-rule.json';

/**
 * ==========================================
 * 1. 유틸리티 (Utilities)
 * ==========================================
 */

const RngUtils = {
    /**
     * 문자열을 기반으로 숫자형 시드(Seed) 값을 생성합니다.
     * @param {string} str - 시드 생성을 위한 원본 문자열
     * @returns {number} 생성된 32비트 부호 없는 정수 해시값
     */
    generateSeed(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
        }
        return hash >>> 0;
    },

    /**
     * Mulberry32 시드 기반 의사 난수 생성기(PRNG)를 생성합니다.
     * 동일한 시드(seed) 값을 입력하면 항상 동일한 순서의 난수를 생성하여
     * 새로고침 시에도 그리드 레이아웃의 일관성을 유지합니다.
     * 
     * @param {number} seed - 난수 생성을 위한 시작점(해시값)
     * @returns {function(): number} 0 이상 1 미만의 실수를 반환하는 난수 생성 함수
     */
    createRng(seed) {
        let state = seed;
        return function () {
            let t = state += 0x6D2B79F5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    },

    /**
     * 제공된 난수 생성기(rng)를 사용하여 배열에서 아이템을 하나 무작위로 선택합니다.
     * Math.random() 대신 시드 기반 rng()를 사용함으로써 결정론적 선택을 보장합니다.
     * 
     * @param {function(): number} rng - 난수 생성 함수 (0~1 사이의 실수 반환)
     * @param {Array} arr - 아이템을 선택할 대상 배열
     * @returns {*} 배열에서 선택된 아이템
     */
    getItem(rng, arr) {
        return arr[Math.floor(rng() * arr.length)];
    },

    /**
     * 지정된 범위(min ~ max) 내의 정수 난수를 생성합니다.
     * 
     * @param {function(): number} rng - 난수 생성 함수 (0~1 사이의 실수 반환)
     * @param {number} min - 최소값 (포함)
     * @param {number} max - 최대값 (포함)
     * @returns {number} 범위 내의 정수
     */
    getInt(rng, min, max) {
        return Math.floor(rng() * (max - min + 1)) + min;
    }
};

const ArrayUtils = {
    /**
     * 두 값 또는 배열이 논리적으로 동일한지 비교합니다.
     * @param {*} a - 비교 대상 A
     * @param {*} b - 비교 대상 B
     * @returns {boolean} 동일 여부
     */
    isEqual(a, b) {
        if (a === b) return true;
        if (Array.isArray(a) && Array.isArray(b)) {
            return a.length === b.length && a.every((v, i) => v === b[i]);
        }
        return false;
    },
    /**
     * 입력값이 배열이 아닌 경우 1차 배열로 감싸서 반환하고, 
     * null이나 undefined인 경우 빈 배열을 반환하여 안전한 순회를 보장합니다.
     * 
     * @param {*} val - 배열로 변환할 대상 값
     * @returns {Array} 변환된 1차 배열
     */
    toArray(val) {
        if (val === null || val === undefined) return [];
        return Array.isArray(val) ? val : [val];
    }
};

/**
 * ==========================================
 * 2. 그리드 생성 엔진 (Grid Generation Engine)
 * ==========================================
 * 
 * [핵심 처리 로직]
 * 1. 지능형 규칙 선택 (getRule): 행 번호에 따른 전용/공통 레이아웃 규칙 적용
 * 2. 빈틈 방지 너비 분할 (calculateDividersForWidth): 재귀적 분할 및 마지막 셀 보정으로 그리드 빈틈 방지
 * 3. 시각적 다양성 확보 (selectDistinct): 이전 행과 중복되지 않는 옵션 우선 선택으로 리듬감 유지
 * 4. 구분선 엇갈리기 (selectWidthsWithLeastOverlap): 상단 행들과 세로 구분선 위치를 엇갈리게 배치하여 미적 완성도 향상
 * 
 * @namespace GridEngine
 */
const GridEngine = {
    /**
     * 행 인덱스에 해당하는 그리드 규칙을 가져옵니다.
     * @param {Object} rules - 전체 그리드 규칙 객체
     * @param {number} rowIndex - 현재 행 인덱스
     * @returns {Object} 해당 행에 적용될 규칙 객체
     */
    getRule(rules, rowIndex) {
        const order = rowIndex + 1;
        const specific = rules.rows.find(row =>
            Array.isArray(row.order) ? row.order.includes(order) : row.order === order
        );
        return specific || rules.rows.find(row => row.order === 0);
    },

    /**
     * [질문 로직: 마지막 셀 크기 조정]
     * 지정된 너비를 셀 개수와 최소 너비 기준에 맞춰 분할 가능한 모든 조합을 계산합니다.
     * 마지막 셀이 남은 여백을 모두 차지하도록 강제하여 그리드 빈틈을 방지합니다.
     * 
     * @param {number} width - 분할할 총 너비 (컬럼 수)
     * @param {number} cellCount - 목표 셀 개수
     * @param {number} minWidth - 셀당 최소 너비
     * @returns {Array<Array<number>>} 가능한 너비 분할 조합들의 배열
     */
    calculateDividersForWidth(width, cellCount, minWidth) {
        const maxCells = Math.floor(width / minWidth);
        let targetCount = cellCount;

        if (targetCount > maxCells) {
            targetCount = Math.max(1, maxCells);
        }

        const results = [];
        function distribute(widths, remain, k) {
            // [마지막 셀 조정] 남은 모든 너비(remain)를 이 구획의 마지막 셀에 할당
            if (k === 1) {
                if (remain >= minWidth) results.push([...widths, remain]);
                else if (widths.length === 0) results.push([remain]);
                return;
            }
            const maxW = remain - (minWidth * (k - 1));
            for (let w = minWidth; w <= maxW; w++) {
                distribute([...widths, w], remain - w, k - 1);
            }
        }

        distribute([], width, targetCount);

        // [강제 보정] 만약 적절한 분할법을 찾지 못하면, 구획 전체를 채우는 1개의 셀을 반환하여 여백을 방지
        if (results.length === 0) return [[width]];
        return results;
    },

    /**
     * 이전 값과 중복되지 않는 옵션을 무작위로 선택하여 시각적 다양성을 확보합니다.
     * 
     * @param {Function} rng - 난수 생성 함수
     * @param {Array|*} options - 선택 가능한 옵션들
     * @param {*} prevValue - 직전에 선택된 값
     * @returns {*} 선택된 값
     */
    selectDistinct(rng, options, prevValue) {
        const candidates = ArrayUtils.toArray(options);
        const valid = candidates.filter(v => !ArrayUtils.isEqual(v, prevValue));
        return valid.length > 0 ? RngUtils.getItem(rng, valid) : RngUtils.getItem(rng, candidates);
    },

    /**
     * 직전 행들의 세로 구분선 위치와 최대한 겹치지 않는 너비 조합을 선택합니다.
     * 
     * @param {Function} rng - 난수 생성 함수
     * @param {Array<Array<number>>} widthOptions - 가능한 너비 분할 조합들
     * @param {number} currentStartCol - 현재 구획의 시작 컬럼 위치
     * @param {Object} dividerHistory - 행별 구분선 위치 기록
     * @param {number} rowIndex - 현재 행 인덱스
     * @returns {Array<number>} 선택된 너비 분할 배열
     */
    selectWidthsWithLeastOverlap(rng, widthOptions, currentStartCol, dividerHistory, rowIndex) {
        const previousDividers = new Set();

        if (dividerHistory[rowIndex - 1]) {
            dividerHistory[rowIndex - 1].forEach(d => previousDividers.add(d));
        }
        if (dividerHistory[rowIndex - 2]) {
            dividerHistory[rowIndex - 2].forEach(d => previousDividers.add(d));
        }

        const noOverlapCandidates = widthOptions.filter(widths => {
            let currentSum = currentStartCol;
            for (let i = 0; i < widths.length - 1; i++) {
                currentSum += widths[i];
                if (previousDividers.has(currentSum)) return false;
            }
            return true;
        });

        if (noOverlapCandidates.length > 0) {
            return RngUtils.getItem(rng, noOverlapCandidates);
        }

        return RngUtils.getItem(rng, widthOptions);
    }
};

/**
 * ==========================================
 * 3. 메인 로직 (Main Logic)
 * ==========================================
 */

/**
 * [1단계: 그리드 설계도 생성]
 * 입력받은 아티클 개수와 규칙을 바탕으로 비어있는 그리드 슬롯(Cells) 배열을 생성합니다.
 * 이 단계에서는 아티클의 내용은 고려하지 않으며, 오직 물리적인 공간 확보와 행 높이(rowHeights)를 결정합니다.
 * 
 * @param {Function} rng - 난수 생성 함수
 * @param {number} targetCount - 배치할 총 아티클 개수 (목표치)
 * @param {Object} rules - 그리드 레이아웃 규칙 (grid-rule.json)
 * @returns {Object} 생성된 그리드 정보 객체
 * @property {Array<Object>} cells - 위치 및 크기 정보가 담긴 슬롯 배열
 * @property {Array<number>} rowHeights - 각 행의 단위 높이 가중치 배열 (모두 1로 고정)
 * @property {number} totalRows - 생성된 총 행 수
 */
function generateGridStructure(rng, targetCount, rules) {
    const cells = [];
    let generatedCount = 0;
    const occupied = [];
    const rowHeights = [];
    const dividerHistory = {};

    let maxOccupiedRowIndex = -1;
    let rowIndex = 0;
    let prevRowState = { cellCount: null }; // rowHeight 추적 제거

    function isOccupied(r, c) {
        if (!occupied[r]) return false;
        return !!occupied[r][c];
    }
    function setOccupied(r, c, val) {
        if (!occupied[r]) occupied[r] = [];
        occupied[r][c] = val;
        if (val) maxOccupiedRowIndex = Math.max(maxOccupiedRowIndex, r);
    }
    function addDivider(r, colIndex) {
        if (!dividerHistory[r]) dividerHistory[r] = [];
        dividerHistory[r].push(colIndex);
    }

    // [Point 1: 루프 종료 조건 보강] 아티클을 다 채웠더라도 이미 점유된 행이나 높이가 할당된 행이 남아있다면 끝까지 처리합니다.
    while (generatedCount < targetCount || rowIndex <= maxOccupiedRowIndex || rowIndex < rowHeights.length) {
        const isFillMode = generatedCount >= targetCount;
        const rule = GridEngine.getRule(rules, rowIndex);

        const currentRowHeightUnit = 1; // 모든 행의 높이 유닛을 1로 고정
        let activeVariant;

        // 트랙 높이가 이미 결정된 행인지 확인
        if (rowHeights[rowIndex] === undefined) {
            let variants = rule.variants;
            let validVariants = variants.filter(v => v.cellCount !== prevRowState.cellCount);
            if (validVariants.length === 0) validVariants = variants;
            activeVariant = RngUtils.getItem(rng, validVariants);

            // 해당 행의 기본 트랙 높이 설정 (항상 1)
            rowHeights[rowIndex] = 1;

            prevRowState = {
                cellCount: activeVariant.cellCount
            };
        } else {
            activeVariant = RngUtils.getItem(rng, rule.variants);
        }

        const effectiveTotalHeight = 1; // 가변 높이 제거됨
        // 너비 분할 단계에서는 면적 제약(minArea)보다는 최소 컬럼 수(minColsCount)를 우선하여 
        // 다양한 가로 분할이 가능하도록 합니다. 면적 부족은 이후 rowSpan 확장이 해결합니다.
        const effectiveMinWidth = rules.minColsCount;

        let holes = [];
        let currentHoleStart = -1;

        for (let c = 0; c < rules.colCount; c++) {
            if (!isOccupied(rowIndex, c)) {
                if (currentHoleStart === -1) currentHoleStart = c;
            } else {
                if (currentHoleStart !== -1) {
                    holes.push({ start: currentHoleStart, length: c - currentHoleStart });
                    currentHoleStart = -1;
                }
            }
        }
        if (currentHoleStart !== -1) {
            holes.push({ start: currentHoleStart, length: rules.colCount - currentHoleStart });
        }

        holes.forEach(hole => {
            // 필러 모드에서는 구획을 최대한 큼직하게 채워 로직 복잡도를 낮춤
            let targetHoleCells = isFillMode ? 1 : Math.max(1, Math.round(activeVariant.cellCount * (hole.length / rules.colCount)));
            const maxCellsPossible = Math.floor(hole.length / rules.minColsCount);
            if (targetHoleCells > maxCellsPossible) targetHoleCells = Math.max(1, maxCellsPossible);

            const widthOptions = GridEngine.calculateDividersForWidth(hole.length, targetHoleCells, effectiveMinWidth);
            const selectedWidths = GridEngine.selectWidthsWithLeastOverlap(
                rng,
                widthOptions,
                hole.start,
                dividerHistory,
                rowIndex
            );

            let currentCol = hole.start;
            selectedWidths.forEach((w) => {
                const spanOpts = ArrayUtils.toArray(activeVariant.rowSpan || 1);
                let selectedSpan = isFillMode ? 1 : RngUtils.getItem(rng, spanOpts);

                let estimatedArea = w * selectedSpan; // area = width * span

                if (estimatedArea < rules.minArea) {
                    const requiredSpan = Math.ceil(rules.minArea / w);
                    const maxSpanLimit = 4;
                    for (let s = selectedSpan + 1; s <= Math.min(requiredSpan, maxSpanLimit); s++) {
                        let canExpand = true;
                        const checkRow = rowIndex + s - 1;
                        for (let c = currentCol; c < currentCol + w; c++) {
                            if (isOccupied(checkRow, c)) {
                                canExpand = false;
                                break;
                            }
                        }
                        if (canExpand) {
                            selectedSpan = s;
                            // 확장된 행의 트랙 높이도 1로 고정
                            if (rowHeights[checkRow] === undefined) {
                                rowHeights[checkRow] = 1;
                            }
                        } else {
                            break;
                        }
                    }
                    estimatedArea = w * selectedSpan;
                }

                cells.push({
                    rowIndex: rowIndex,
                    colIndex: currentCol,
                    width: w,
                    height: selectedSpan,
                    unitHeight: currentRowHeightUnit,
                    area: parseFloat(estimatedArea.toFixed(1))
                });

                for (let r = rowIndex; r < rowIndex + selectedSpan; r++) {
                    const dividerPos = currentCol + w;
                    if (dividerPos < rules.colCount) {
                        addDivider(r, dividerPos);
                    }
                    for (let c = currentCol; c < currentCol + w; c++) {
                        setOccupied(r, c, true);
                    }
                }

                currentCol += w;
                generatedCount++;
            });
        });

        rowIndex++;
    }

    return { cells, rowHeights, totalRows: rowIndex };
}

/**
 * [2단계: 슬롯 품질 평가 및 정렬]
 * 생성된 빈 슬롯들을 품질(면적 순, 상단 순)에 따라 재정렬합니다.
 * 면적이 큰 '명당 자리'를 배열 앞쪽으로 배치하여 점수 높은 아티클이 우선적으로 차지할 수 있도록 합니다.
 * 
 * @param {Array<Object>} cells - generateGridStructure에서 생성된 미정렬 슬롯 배열
 * @returns {Array<Object>} 면적 및 위치 기준에 따라 내림차순 정렬된 슬롯 배열
 */
function rankCellsByQuality(cells) {
    return cells.slice().sort((a, b) => {
        if (b.area !== a.area) return b.area - a.area;
        if (a.rowIndex !== b.rowIndex) return a.rowIndex - b.rowIndex;
        return a.colIndex - b.colIndex;
    });
}

/**
 * [3단계: 최종 매핑 및 조립 (메인 컨트롤러)]
 * 아티클 데이터를 스위스 스타일 그리드 레이아웃에 맞춰 배치하는 최상위 함수입니다.
 * 1. 아티클을 점수(score) 순으로 정렬합니다.
 * 2. 그리드 설계도(Cells)를 생성하고 품질순으로 정렬(Ranking)합니다.
 * 3. 아티클과 슬롯을 1:1 매칭하며, 부족한 공간은 필러(Filler)로 보충합니다.
 * 
 * @param {Array<Object>} articles - 원본 아티클 데이터 배열 (Content Collection)
 * @returns {Object} 최종 레이아웃 결과 객체
 * @property {Array<Object>} articles - 위치 정보(_gridInfo)가 주입된 아티클 및 필러 배열
 * @property {Array<number>} rowHeights - CSS Grid 렌더링에 필요한 행별 높이 가중치 배열
 */
export function gridMapper12(articles) {
    const validArticles = articles
        .filter(a => {
            const isPage = a.data.type === 'page';
            const isUnlisted = a.data.highlight?.listed === false;
            return !isPage && !isUnlisted;
        })
        .map(a => ({ ...a, _score: getArticleScore(a) }))
        .sort((a, b) => b._score - a._score);

    if (validArticles.length === 0) return { articles: [], rowHeights: [] };

    const seedStr = validArticles.map(a => a.id).join('');
    const seed = RngUtils.generateSeed(seedStr);
    const rng = RngUtils.createRng(seed);

    const { cells: rawCells, rowHeights } = generateGridStructure(rng, validArticles.length, gridRules);
    const rankedCells = rankCellsByQuality(rawCells);

    const allMapped = rankedCells.map((cell, index) => {
        const article = validArticles[index];
        const gridInfo = {
            rowIndex: cell.rowIndex,
            colIndex: cell.colIndex,
            width: cell.width,
            height: cell.height,
            unitHeight: cell.unitHeight,
            area: cell.area
        };

        if (article) {
            article._gridInfo = gridInfo;
            article._isFiller = false;
            return article;
        } else {
            return {
                id: `filler-${index}`,
                slug: `filler-${index}`,
                data: {
                    headline: "",
                    category: "",
                    type: "filler",
                    releaseDate: new Date().toISOString(),
                    images: []
                },
                _gridInfo: gridInfo,
                _score: 0,
                _isFiller: true
            };
        }
    });

    return {
        articles: allMapped,
        rowHeights: rowHeights
    };
}

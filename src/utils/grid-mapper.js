import { getArticleScore } from './scoring.js';

/**
 * 계산된 점수와 인덱스를 바탕으로 CSS 그리드 컬럼 스팬(col-span) 클래스를 반환합니다.
 * (참고: 현재 gridMapper 함수에서는 이 함수 대신 직접 내부 로직으로 처리하고 있으나, 
 * 하위 호환성이나 단순 매핑을 위해 유지합니다.)
 * 
 * @param {number} score - 기사의 중요도 점수
 * @param {number} index - 리스트에서의 순서
 * @returns {string} Tailwind CSS 그리드 컬럼 스팬 클래스
 */
function mapScoreToGridClass(score, index) {
    if (score >= 2500) {
        if (index === 0) return 'col-span-12'; // 최고 점수 기사는 전체 너비 점유
        return 'col-span-12 lg:col-span-8'; // 보조 히어로 기사는 2/3 너비 점유
    }
    if (score >= 1800) return 'col-span-12 md:col-span-6 lg:col-span-4'; // 주요 기사
    return 'col-span-12 md:col-span-6 lg:col-span-4'; // 표준 기사
}

/**
 * '탐욕적 행 채우기(Greedy Row Packing)' 알고리즘을 사용하여 기사들을 12열 그리드에 배치합니다.
 * 이 알고리즘은 각 행의 가로 너비 합이 반드시 12가 되도록 조정하여 레이아웃에 빈 공간(Gap)이 생기지 않게 합니다.
 * 
 * @param {import('astro:content').CollectionEntry<'articles'>[]} articles - 기사 컬렉션 배열
 * @returns {Array} 점수와 갭 없는 그리드 클래스가 할당된 기사 객체 배열
 */
export function gridMapper(articles) {
    // 1. 데이터 전처리 및 정렬
    const scoredArticles = articles
        .filter(article => article.data.type !== 'page') // 'page' 타입은 그리드에서 제외
        .map(article => ({
            ...article,
            _score: getArticleScore(article), // scoring.js를 통해 중요도 점수 산출
        }))
        .sort((a, b) => {
            // 정렬 우선순위: 1. 점수(내림차순) -> 2. 발행일(내림차순) -> 3. ID(오름차순, 결정론적 정렬)
            if (b._score !== a._score) return b._score - a._score;
            const dateA = new Date(a.data.releaseDate).getTime();
            const dateB = new Date(b.data.releaseDate).getTime();
            if (dateB !== dateA) return dateB - dateA;
            return a.id.localeCompare(b.id);
        });

    const result = [];
    let currentRow = [];       // 현재 채워지고 있는 행의 기사들
    let currentRowWidth = 0;   // 현재 행에 누적된 너비 합계 (최대 12)

    scoredArticles.forEach((article, index) => {
        // [단계 1] 점수에 따른 초기 선호 너비(Preferred Width) 할당
        let preferredWidth = 4; // 기본값: 1/3 너비 (4/12)
        if (article._score >= 2500) preferredWidth = 12;      // 최상위: 전체 너비 (12/12)
        else if (article._score >= 2000) preferredWidth = 8;  // 우수: 2/3 너비 (8/12)
        else if (article._score >= 1800) preferredWidth = 6;  // 보통: 1/2 너비 (6/12)

        const isLastItem = index === scoredArticles.length - 1;

        // [단계 2] 현재 행에 추가했을 때 12열을 초과하는지 또는 마지막 아이템인지 확인
        if (currentRowWidth + preferredWidth > 12 || isLastItem) {

            if (isLastItem) {
                // 마지막 아이템인 경우: 남은 공간을 모두 채워야 함 (새 행이든 기존 행이든)
                const remainingSpace = 12 - currentRowWidth;

                // 만약 현재 아이템이 기존 행의 남은 공간에 들어가기 너무 크다면 (이미 행이 꽤 차 있다면)
                if (preferredWidth > remainingSpace && currentRowWidth > 0) {
                    // 1) 기존 행을 마무리(확장)하여 12를 채움
                    finalizeRow(currentRow, 12 - currentRowWidth);
                    // 2) 마지막 아이템은 새 행에서 전체 너비(12)를 가짐
                    article._gridClass = 'col-span-12';
                    result.push(article);
                } else {
                    // 남은 공간에 들어가거나, 아예 새 행의 첫 아이템인 경우
                    // 남은 공간(remainingSpace)이 있으면 그것을 다 쓰고, 없으면 자기 선호 너비 사용
                    article._gridClass = `col-span-${remainingSpace || preferredWidth}`;
                    result.push(article);
                }
            } else {
                // 일반적인 상황에서 행이 꽉 찬 경우: 현재 행 마무리 및 새 행 시작
                // 기존 행의 빈 공간(12 - currentRowWidth)을 계산하여 이전 아이템들을 확장
                finalizeRow(currentRow, 12 - currentRowWidth);

                // 새로운 행의 첫 번째 아이템 설정
                currentRow = [article];
                currentRowWidth = preferredWidth;
                article._gridClass = `col-span-${preferredWidth}`;
                result.push(article);
            }
        } else {
            // [단계 3] 현재 행에 여유 공간이 있어 아이템 추가 가능
            currentRow.push(article);
            currentRowWidth += preferredWidth;
            article._gridClass = `col-span-${preferredWidth}`;
            result.push(article);
        }
    });

    return result;
}

/**
 * 특정 행의 남은 공간(gap)을 채우기 위해 행 내 아이템의 너비를 확장합니다.
 * 
 * @param {Array} row - 현재 행에 포함된 기사 객체 배열
 * @param {number} gap - 채워야 할 남은 그리드 컬럼 수
 */
function finalizeRow(row, gap) {
    // 채울 공간이 없거나 행이 비어있으면 종료
    if (gap <= 0 || row.length === 0) return;

    // 가장 단순하고 효과적인 전략: 해당 행의 첫 번째(가장 점수가 높은) 아이템에게 남은 공간을 몰아줌
    const firstItem = row[0];

    // 정규표현식을 사용하여 기존 'col-span-X' 클래스에서 숫자 X를 추출
    const match = firstItem._gridClass.match(/col-span-(\d+)/);
    if (match) {
        const currentSpan = parseInt(match[1]);
        // 기존 너비에 gap을 더해 12열이 되도록 업데이트
        firstItem._gridClass = `col-span-${currentSpan + gap}`;
    }
}

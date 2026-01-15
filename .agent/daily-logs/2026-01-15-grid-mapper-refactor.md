# 2026-01-15 작업 일지: 동적 규칙 기반 그리드 매퍼 리팩토링

## 작업 개요
HTML 프로토타입의 랜덤 그리드 생성 로직을 프로덕션 코드로 이식하여 동적이고 다양한 레이아웃을 구현했습니다.

## 주요 변경사항

### 1. JSON 규칙 파일 정리
**파일**: `src/utils/swiss/grid-rule-12-cols.json`
- JSON 주석 제거하여 유효한 형식으로 수정
- 12열 그리드 시스템 규칙 정의:
  - `colCount`: 12 (고정)
  - `minColsCount`: 3 (최소 셀 너비)
  - `rows`: 행별 규칙 (order, variants, cellCount, rowHeight)

### 2. 그리드 매퍼 완전 재작성
**파일**: `src/utils/grid-mapper-12 JSON.js`

#### 핵심 알고리즘 구현:
- **`getPossibleDividers()`**: 최소 셀 너비(3칸)를 고려한 동적 divider 위치 계산
  - 재귀적으로 가능한 모든 너비 조합 생성
  - 너비 배열을 divider 위치로 변환
  
- **`selectDividerWithLeastOverlap()`**: 시각적 다양성을 위한 divider 선택 로직
  1. 우선순위 1: 이전 행과 겹치지 않는 divider
  2. 우선순위 2: 완전히 같지 않은 divider
  3. 대안: 랜덤 선택

- **`selectDifferentOption()`**: 이전 행과 다른 rowHeight 선택

- **`getRuleForIndex()`**: 행 인덱스에 따른 규칙 매칭
  - 특정 order (1, 2-4) 또는 기본 규칙 (order: 0)

#### 데이터 구조:
각 아티클에 `_gridInfo` 객체 추가:
```javascript
{
  rowIndex: number,      // 행 인덱스
  cellIndex: number,     // 행 내 셀 인덱스
  flexRatio: number,     // flex 비율 (너비)
  rowHeight: number,     // 행 높이
  totalCellsInRow: number // 행 내 총 셀 개수
}
```

### 3. 컴포넌트 업데이트
**파일**: `src/components/swiss/Patchwork.astro`
- `_gridClass` → `_gridInfo` 구조로 변경
- Flex 기반 레이아웃 적용:
  ```astro
  style={`flex: ${flexRatio}; aspect-ratio: ${aspectRatio};`}
  ```

### 4. CSS 레이아웃 변경
**파일**: `src/styles/swiss/patchwork.css`
- **Grid → Flex 시스템 전환**:
  - `.patchwork-grid`: `display: flex; flex-direction: column;`
  - `.patchwork-row` 추가: 각 행을 flex 컨테이너로 구성
- **시각적 개선**:
  - 각 셀에 `2px solid var(--color-outline)` 외곽선 추가
  - 디자인 시스템의 `--color-outline` (stone-200) 사용

### 5. 페이지 로직 업데이트
**파일**: `src/pages/index.astro`
- 아티클을 `rowIndex`로 그룹화하는 로직 추가
- 행별 렌더링 구조로 변경:
  ```astro
  {rows.map((rowArticles) => (
    <div class="patchwork-row">
      {rowArticles.map((article) => <Patchwork article={article} />)}
    </div>
  ))}
  ```

## 기술적 성과

### 동적 레이아웃 생성
- 페이지 새로고침마다 다른 레이아웃 생성
- 최소 셀 너비 보장 (3칸)
- 이전 행과의 시각적 차별화 (divider 겹침 최소화)

### 유연한 규칙 시스템
- JSON 파일로 규칙 외부화
- 행별 다양한 variant 지원
- cellCount, rowHeight 조합 가능

### 반응형 Aspect Ratio
- Flex 비율과 aspect-ratio를 활용한 유동적 레이아웃
- 12열 시스템 유지하면서 다양한 셀 크기 구현

## 현재 상태
✅ 동적 랜덤 레이아웃 생성 완료
✅ JSON 규칙 기반 시스템 구현
✅ Flex 기반 반응형 레이아웃
✅ 디자인 시스템 통합 (외곽선)

## 추가 작업 완료 (레이아웃 일관성 구현)
✅ **결정론적(Deterministic) 레이아웃 구현 완료**
- **목표 달성**: 콘텐츠 스키마 값을 시드로 사용하여 항상 동일한 레이아웃 생성
- **구현 내용**: 
  - `generateSeed()`: DJB2 변형 해시 함수로 아티클 ID 문자열을 시드(정수)로 변환
  - `mulberry32()`: 시드 기반 난수 생성기(PRNG) 구현 및 적용
  - `gridMapper12`: `Math.random()`을 `rng()`로 전면 교체
- **효과**: 
  - 페이지를 새로고침해도 레이아웃이 변경되지 않음 (일관성 확보)
  - 새로운 아티클이 추가되거나 ID가 변경될 때만 레이아웃이 재생성됨

## 파일 변경 목록
```
수정:
- src/utils/swiss/grid-rule-12-cols.json
- src/utils/grid-mapper-12 JSON.js (완전 재작성)
- src/components/swiss/Patchwork.astro
- src/styles/swiss/patchwork.css
- src/pages/index.astro

생성:
- src/utils/swiss/_grid-rule-12-sample.html (참조용 프로토타입)
```

## 학습 및 인사이트
- **동적 분할 알고리즘**: 재귀를 통한 가능한 조합 탐색
- **시각적 다양성**: 규칙 기반이면서도 반복을 피하는 선택 로직
- **Flex vs Grid**: 동적 행 기반 레이아웃에는 Flex가 더 적합
- **디자인 시스템 활용**: CSS 변수로 일관된 스타일 유지

# [PLAN] 동적 벤토 그리드(Dynamic Bento Grid) 구현 계획

`index.astro`의 정적 레이아웃을 유지하면서, `src/content/article`에 저장된 실제 아티클 데이터를 읽어와 "중요도"에 따라 그리드 셀 크기를 동적으로 결정하는 시스템을 구축합니다.

## 핵심 목표
- **데이터 연동**: `astro:content`를 사용하여 실시간으로 아티클 목록 수집.
- **가중치 매핑**: 아티클의 특정 메타데이터 값을 기반으로 `col-span` 결정.
- **최소 수정**: 기존 기사의 Frontmatter(메타데이터) 수정을 최소화하거나 생략.

## 가중치 정렬 알고리즘 (Scoring Algorithm)

각 기사의 노출 순서와 크기(Weight)를 결정하기 위해 다음과 같은 점수 계산식을 사용합니다. 기사 타입이 `page`인 경우는 계산에서 제외됩니다.

| 가중치 항목 | 계산 방식 | 최대 점수 (예측) |
| :--- | :--- | :--- |
| **1. 노출 여부 (`listed`)** | `listed === true` 이면 +1000점 | 1000 |
| **2. 가중치 인덱스 (`index`)** | `(6 - index) * 200` (1단위 200 ~ 5단위 1000) | 1000 |
| **3. 저자 수 (`authors`)** | `저자 수 * 50점` | 200+ |
| **4. 연구 밀도 (`dateDiff`)** | `(releaseDate - createdDate)` (일 단위) * 10점 | 500 (50일 기준) |
| **5. 콘텐츠 타입 (`type`)** | `graphics` 이면 +300점 (일반 article은 0) | 300 |

### 🧮 실제 데이터 검증 결과 (Validation)
`src/content/article` 내의 실제 MDX 파일들을 분석하여 산출한 점수 분포입니다:

1.  **[Hero] 내가 만든 기린 그림 (`S: 2,540`)**
    - `index: 1`, `authors: 3명`, `type: graphics`, `listed: true`
    - 그래픽 가산점과 다수 협업이 결합되어 최고 점수 기록.
2.  **[Hero] 지구 온난화 (`S: 2,520`)**
    - `index: 1`, `dateDiff: 47일`, `listed: true`
    - 인덱스는 같지만 **연구 밀도(작성 기간)**가 매우 길어 히어로 섹션으로 격상됨.
3.  **[Featured] 투표가 내란을 끝낼 수 있을까? (`S: 2,126`)**
    - `index: 1`, `dateDiff: 7일`, `listed: true`
    - 표준적인 중요 기사로 분류되어 중간 크기 그리드 점유.
4.  **[Standard] E-스포츠의 성장 (`S: 1,707`)**
    - `index: 4`, `listed: true`
    - 중요도가 낮게 설정되어 소형 그리드에 배치.
5.  **[Exclusion] 케이타 모리모토 (`S: 1,318`)**
    - `listed: false`로 인해 메인 그리드에서 제외되거나 가장 낮은 순위로 밀림.

### 결론
실제 데이터를 대입해 본 결과, 동일한 `index`를 가진 기사라도 **"얼마나 오래 공들였는가(dateDiff)"**와 **"얼마나 많은 전문가가 참여했는가(authors)"**에 따라 레이아웃이 정교하게 차별화됨을 확인했습니다.

### 그리드 배치 규칙 (Grid Fitting)
- **Level 1 (가장 중요)**: `col-span-12` 또는 `col-span-8` (대형 카드)
- **Level 2-3 (중간 중요)**: `col-span-6` 또는 `col-span-4` (중형 카드)
- **Level 4-5 (일반)**: `col-span-4` (소형 카드)
- **자동 밀림 방지**: 12컬럼의 합이 맞지 않아 발생하는 빈 공간은 '통계 요약형 카드'나 '여백 카드'로 자동 채움 처리.

## 제안하는 변경 사항

### [Component] `src/utils/grid-mapper.js` [NEW]
- 입력받은 아티클 배열을 그리드 레이아웃 순서에 맞게 재배열하고, 각 아티클에 적용될 Tailwind 클래스(`col-span-X`)를 계산하는 순수 함수 logic 구축.

### [Page] [MODIFY] [index.astro](file:///d:/yonggeun/porter/git/o-m.kr/production/src/pages/index.astro)
- 하드코딩된 `<div class="bento-card">`들을 `getCollection`으로 가져온 데이터 기반의 루프문으로 변경.
- 데이터 포인트(영향력 지표, 검증 데이터 등)는 특수 태그(예: `tag: ['stats']`)를 가진 아티클을 자동으로 매핑하거나 별도의 데이터 파일로 분리.

### [Component] [NEW] `src/components/BentoCell.astro`
- 각기 다른 테마(배경 이미지형, 텍스트형, 지표형)를 `importance` 값에 따라 분기하여 렌더링하는 통합 컴포넌트 구현.

## 검증 계획
### 자동화 테스트
- `localhost:4321` 접속 시 `src/content/article` 내의 파일 개수와 화면에 그려진 그리드 셀의 개수가 일치하는지 확인.
- 임의의 아티클 `highlight.index`를 수정했을 때 실시간으로 그리드 크기가 변하는지 브라우저에서 시각적으로 확인.

---
> [!NOTE]
> 기존 `highlight.index`가 없는 기사들은 기본적으로 가장 작은 단위인 `col-span-4`로 배치되도록 설계하여 데이터 수정을 방지합니다.

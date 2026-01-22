# o-m.kr 디자인 시스템 가이드 (Swiss & Default)

이 문서는 o-m.kr 프로젝트의 멀티 테마 아키텍처와 디자인 토큰 시스템을 정의합니다.

## 1. 아키텍처 구조
- **Default Layout**: 모든 테마의 근간 (SEO, Meta, OS 시스템 폰트 리셋)
- **Swiss Theme**: 스위스 기능주의 디자인 테마.
- **Patchwork System**: 조각보 형태의 동적 그리드 시스템.

## 2. 디자인 토큰 (M3 기반)
- **Color**: `primary`, `base-100`, `base-content`, `outline` (FlyonUI 호환)
- **Typography**: `--font-display` (Display), `--font-headline` (Headline), `--font-sans` (Body/Standard)

## 3. Patchwork 그리드
- **컴포넌트**: `src/components/swiss/Patchwork.astro`
- **핵심 로직**: `src/utils/swiss/patchwork-logic.js`
- **레이아웃 규칙**: `src/utils/swiss/grid-rule.json`
- **구현 원칙 (2026-01-22)**:
  - **Span-Only Height**: 그리드 아이템의 높이는 개별 `height` 픽셀 값이 아닌, 그리드 단위인 `rowSpan`을 기준으로 계산하여 레이아웃 무너짐을 방지함.
  - **Dynamic Layout**: `articles.json`의 데이터를 `grid-rule.json`에 정의된 매퍼(`type` -> `span`)를 통해 동적으로 그리드에 배치함.

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
- 컴포넌트: `Patchwork.astro`
- 로직: `patchwork-logic.js`

---
trigger: always_on
---

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

---
title: Default Layout (Foundation)
---
1. Create src/styles/default/global.css with system font stack.
2. Create src/layouts/default/DefaultLayout.astro with common head and body wrapper.


5. Design System & Accessibility

Paper-like Aesthetic: oklch 변수 사용. Hex 코드 하드코딩 엄격 금지 (--color-paper-* 사용).

Typography: UI(Sans-serif), 본문(Serif) 구분


프로젝트는 "Paper-like(종이 질감)" 미학을 추구하며, 다음 규칙을 따릅니다.

3.1. 색상 팔레트 (Color Palette)

Paper Scale: 자체 정의된 oklch 기반 색상 스케일을 사용합니다.

제약 사항: 코드 내에서 #111111과 같은 하드코딩된 Hex 색상 값 사용을 엄격히 금지합니다. 반드시 아래의 CSS 변수 또는 이에 매핑된 Tailwind 클래스를 사용해야 합니다.

범위: --color-paper-50 (가장 밝은 배경) ~ --color-paper-950 (가장 어두운 텍스트)

3.2. 타이포그래피 (Typography)

목적에 따라 폰트 패밀리를 구분하여 사용합니다.

제목 및 UI 요소 (Headings & UI): Sans-serif 폰트 사용 (Tailwind 기본 font-sans 계열).

본문 및 읽기 텍스트 (Body & Reading): Serif 폰트 사용 (Tailwind font-serif 계열, 예: Georgia).
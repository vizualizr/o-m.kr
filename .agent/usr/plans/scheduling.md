# 기본 원칙

- 마일스톤은 반드시 지킨다. 

## 진행 상황

이 진행 상황은 프로젝트가 진행됨에 따라 AI 에이전트가 내용을 갱신해야 한다.

### 2026-01-16 완료 작업
- **데이터 로딩 안정화**: Astro Content Collection에서 스키마 불일치로 인해 17개 중 4개의 기사가 누락되던 문제를 해결. (Frontmatter 날짜 형식 및 이미지 경로 표준화)
- **그리드 시스템 개선**: `grid-mapper.js`에서 `listed: false`인 기사 필터링 로직 추가 및 디버깅 로그 강화.
- **구조 개선**: `src/layouts/swiss/Header.astro` 컴포넌트 분리 및 `index.astro` 적용.
- **개발 환경**: `.agent` 폴더 변경 시 불필요한 서버 재시작 방지 (Vite 설정), Zotero 서지 데이터 심볼릭 링크(Hard Link) 복구.

### 2025-11-27 현재 (Previous)

## 테스트 운영

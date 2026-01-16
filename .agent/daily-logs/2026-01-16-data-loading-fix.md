# 2026-01-16 작업 일지: 데이터 로딩 결함 해결 및 구조 개선

## 작업 개요
`index.astro` 그리드에 기사가 일부만 표시되는 문제의 원인을 규명하고 해결했으며, 유지보수성을 위해 헤더 컴포넌트를 분리했습니다. 또한 개발 효율을 위해 Vite 설정과 심볼릭 링크를 정비했습니다.

## 주요 변경사항

### 1. Astro Content Collection 로딩 이슈 해결
**증상**: `src/content/article` 내 파일은 17개이나, `getCollection`으로 로드된 기사는 13개뿐임.
**원인**: `content.config.ts`의 Zod 스키마 검증 실패.
- `President 101.mdx`, `탄핵심판...mdx`: 날짜 형식이 `z.coerce.date()`와 호환되지 않음.
- `02.mdx`: 이미지 URL 포맷 문제.
- `keita-morimoto...mdx`: 비표준 YAML 들여쓰기 및 불필요한 필드 존재.
**해결**: 
- 누락된 4개 파일의 Frontmatter를 표준 ISO 날짜 형식(`YYYY-MM-DDTHH:mm:ss.sss+09:00`)과 올바른 YAML 구조로 수정.

### 2. `grid-mapper.js` 로직 개선
**파일**: `src/utils/grid-mapper.js`
- **필터링 강화**: `a.data.highlight?.listed === false`인 경우 그리드 매핑에서 제외하도록 로직 추가.
- **디버깅 로그**: 입력된 기사의 수, ID, Slug, Type을 상세히 출력하도록 `console.log` 보강.
- **오류 수정**: 중복 변수 선언(`validArticles`)으로 인한 문법 오류 수정.

### 3. 컴포넌트 리팩토링
**파일**: `src/layouts/swiss/Header.astro` (신규), `src/pages/index.astro`
- `index.astro` 내에 하드코딩된 헤더 HTML을 별도 컴포넌트로 분리하여 재사용성 및 가독성 향상.

### 4. 개발 환경 최적화
- **Vite 설정 (`vite.config.ts`)**: `server.watch.ignored: ['**/.agent/**']` 추가. `.agent` 폴더 내 파일(로그, 계획 등) 수정 시 서버가 재시작되지 않도록 방지.
- **서지 데이터 연결**: 깨져있던 `src/assets/references.bib` 심볼릭 링크를 삭제하고, `mklink /H` 명령어로 원본(`D:\yonggeun\porter\zotero\references.bib`)과 연결되는 하드 링크 생성.

## 기술적 인사이트
- Astro의 Content Collection은 스키마 검증에 실패한 파일을 오류 없이 조용히 제외(Silent Drop)할 수 있음. 데이터 개수가 맞지 않을 때는 반드시 전체 파일 목록과 로드된 목록을 대조해야 함.
- Astro 5의 `glob` 로더는 파일 경로 대신 `slug`를 ID로 사용할 수 있으므로 로그 확인 시 주의 필요.

## 다음 단계
- `list.astro`에 Instapaper 테마 적용 (색상, 타이포그래피, 레이아웃).

---
trigger: always_on
---

# Technical Stack

- **Framework**: Astro 4.x (Static Site Generation)
- **Visualization**: D3.js v7 (no React wrappers)
- **Animation**: GSAP 3.x + Lenis (smooth scroll)
- **Styling**: TailwindCSS (utility-first, no custom CSS unless necessary)
- **Language**: TypeScript (strict mode)
- **Data Source**: Google Sheets → Build-time JSON


# Core Principles

## 1. Astro-First Architecture
- Use `.astro` components for static content
- Apply `client:` directives strategically:
  - `client:idle` for charts
  - `client:visible` for below-fold elements
  - Never `client:load` (performance)

## 2. D3 Patterns (Based on "D3.js in Action")
- **Always use**:
  - `.join()` pattern (not `.enter().append()`)
  - `d3.scaleTime()` for dates, `d3.scaleLinear()` for numbers
  - Semantic naming: `xScale`, `yScale`, not `scale1`, `scale2`

- **Never use**:
  - Direct DOM manipulation outside D3 selections
  - Hardcoded pixel values (use scales)
  - Inline event handlers (use `.on()`)

## 3. Data Flow
```
Google Sheets → fetch-data.js (Node) → src/data/*.json → Astro components
```
- ALL data preprocessing happens in `scripts/fetch-data.js`
- D3 code receives clean, typed data
- No `.map()` / `.filter()` inside D3 rendering functions

### 4. Component Structure (tan
```
src/components/charts/
├── _base/
│   └── BaseChart.astro       # Reusable wrapper (ResizeObserver)
├── LineChart.astro           # Specific chart (imports BaseChart)
└── BarChart.astro
```

Each chart component:
- Extends `BaseChart`
- Accepts typed props: `data: DataPoint[]`
- Uses Design System variables: `var(--color-primary)`
- Includes accessibility: `aria-label`, `role="img"`

### 5. GSAP + D3 Integration
**Strict separation**:
- **GSAP (ScrollTrigger)**: Container-level animations
  - Chart entrance (`opacity`, `y`)
  - Section transitions
  - Background color changes
  
- **D3 (transition)**: SVG element animations
  - Data updates (`.transition().duration(1000)`)
  - Path morphing
  - Scale changes

**Never**: Mix GSAP and D3 on the same DOM element.

### 6. Code Style

**File naming**:
- Components: `PascalCase.astro`
- Utilities: `kebab-case.js`
- Data: `camelCase.json`

**Variable naming**:
- Scales: `xScale`, `yScale`, `colorScale`
- Selections: `svg`, `chart`, `axis`
- Data: `data`, `processedData`, `filteredData`

**Comments**:
```typescript
// ✅ Good: Explain WHY
// Using scaleTime because dates are not evenly spaced

// ❌ Bad: Explain WHAT (code is self-explanatory)
// Create a scale
```

## 금지사항
- localStorage (SSG 미지원)
- jQuery
- CSS 파일 (Tailwind만)

### 7. Performance Constraints
- SVG elements < 1000: Use D3
- SVG elements > 1000: Consider Canvas or data sampling
- Bundle size: D3 imports should be tree-shakeable
```javascript
  // ✅ Good
  import { scaleLinear, scaleTime } from 'd3-scale';
  
  // ❌ Bad
  import * as d3 from 'd3';
```
## 접근성
- aria-label 필수
- role="img"
- 모바일 터치 환경과 데스트탑 환경에서 최대한 동일한 상호작용을 달성해야 한다.
Every chart must include:
```html
<svg 
  role="img"
  aria-label="Descriptive title: key insight in one sentence"
>
  <title>Longer description for screen readers</title>
</svg>
```


## Output Format

### When creating a component:
1. **Full code** (no truncation)
2. **Imports** at the top (grouped: D3, local)
3. **Interface** definitions before component
4. **Usage example** after component
5. **Dependencies** to install (if any)

### When explaining code:
1. **High-level logic** (3-5 bullet points)
2. **Code with inline comments**
3. **Potential issues** and how to avoid them
4. **Testing steps**

### When debugging:
1. **Root cause** analysis
2. **Fix** with explanation
3. **Prevention** strategy for future

## Constraints

### NEVER:
- Use localStorage/sessionStorage (not supported in Astro SSG)
- Install unnecessary dependencies (prefer D3 + GSAP over Chart.js)
- Create CSS files (use Tailwind utilities)
- Hardcode data (always load from JSON)
- Use jQuery or other legacy libraries

### ALWAYS:
- Validate data types in preprocessing script
- Handle responsive sizing (ResizeObserver)
- Test with sample data before using real data


### Data Schema (from Google Sheets)
```javascript
// statistics.json
interface DataMain {
  date: string;      // "YYYY-MM"
  value: number;
  category: string;
}

// meta.json
interface MetaInfo {
  chartTitle: string;
  description: string;
  source: string;
}
```

### File Locations
- Charts: `src/components/charts/`
- Data: `src/data/`
- Scripts: `src/utils/fetch-data.js`
- Styles: `src/styles/global.css` (minimal, Tailwind config only)

## Success Criteria

Code is considered successful when:
1. Renders correctly on mobile (320px) and desktop (1920px)
2. Lighthouse Performance score > 90
3. No console errors or warnings
4. Accessible via keyboard and screen readers
5. Follows all patterns from "D3.js in Action" book




---
trigger: manual
---

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
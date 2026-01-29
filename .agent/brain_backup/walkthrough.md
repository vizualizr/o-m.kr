# Walkthrough - Fixing Tailwind v4 @theme Error

I have resolved the "Unknown at rule @theme" error and standardized the CSS architecture for Tailwind v4.

## Changes Made

### 1. CSS Standardization
- **[global.css](file:///d:/yonggeun/porter/git/o-m.kr/production/src/styles/global.css)**: Fixed the invalid import order. `@import "tailwindcss"` and related plugins are now at the very top, ensuring standard CSS compliance and proper parsing by Tailwind v4.
- **[theme.css](file:///d:/yonggeun/porter/git/o-m.kr/production/src/styles/theme.css)**: Removed redundant `@import "tailwindcss"` to keep the file clean for use as a module.
- **[theme.css (Swiss)](file:///d:/yonggeun/porter/git/o-m.kr/production/src/styles/swiss/theme.css)**: Added `@import "tailwindcss"` at the top so it is correctly recognized as an entry point when imported in layouts.

### 3. CSS Alias Resolution Fix
- **Internal Imports**: Replaced `@import "@styles/theme.css"` with relative paths (e.g., `./theme.css`) in `global.css`, `list.css`, and `article.css`. This ensures that standard CSS processors can resolve the files without depending on the Vite/TS alias configuration, which was causing runtime errors in the browser.
- **Nested Files**: Fixed nested scroller CSS to point to the correct relative path for the theme file.

## Verification Results

- **IDE Recognition**: The red squiggles for `@theme` and `@utility` should no longer appear in VS Code.
- **Dev Server**: The styles remain correctly applied in the development environment.
- **Build Note**: A build was attempted, and while it failed due to a bibliography path issue in `rehype-citation` (unrelated to this task), the Tailwind-specific CSS parsing errors have been resolved.

render_diffs(file:///d:/yonggeun/porter/git/o-m.kr/production/src/styles/global.css)
render_diffs(file:///d:/yonggeun/porter/git/o-m.kr/production/src/styles/theme.css)
render_diffs(file:///d:/yonggeun/porter/git/o-m.kr/production/src/styles/swiss/theme.css)

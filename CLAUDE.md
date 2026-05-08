# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

- React component library published as npm package `antd`
- TypeScript + React (peer deps: React ≥18)
- CSS-in-JS via `@ant-design/cssinjs` with a three-tier Design Token system
- Supports dark mode, RTL layout, SSR, and 150+ locales

## Commands

```bash
npm start                           # Start doc site dev server (runs prestart: version, tokens, style)
npm test                            # Run all unit tests
npx jest --testPathPattern button   # Run tests for a single component
npm run tsc                         # TypeScript type check (no emit)
npm run lint                        # Full lint: tsc + eslint + biome + markdown + changelog
npm run lint:script                 # ESLint only
npm run lint:biome                  # Biome lint only
npm run format                      # Biome format (write)
npm run compile                     # Compile to es/ and lib/
npm run build                       # Full build: compile + dist (UMD)
npm run style                       # Generate CSS files from CSS-in-JS
npm run test:node                   # Node.js SSR tests
npm run test:image                  # Visual regression (puppeteer)
```

> `npm start` runs a lengthy `prestart` chain (version generation, token statistics, style build). First start takes a few minutes.

## Architecture

### Token System (three tiers)

```
SeedToken          →  MapToken / AliasToken  →  ComponentToken
(brand colors,        (color palettes,           (per-component
 base sizes)           spacing scale,              overrides)
                       typography)
```

- `components/theme/interface/seeds.ts` — SeedToken definitions
- `components/theme/interface/alias.ts` — AliasToken (global design tokens used by all components)
- `components/theme/themes/` — algorithms that map seed → alias (default, dark, compact)
- Each component's `style/token.ts` defines its `ComponentToken` and `prepareComponentToken` factory

### CSS-in-JS Style Registration

Every component registers its styles via `genStyleHooks` (exported from `components/theme/internal`):

```ts
// style/index.ts pattern
import { genStyleHooks } from '../../theme/internal';
import { prepareComponentToken } from './token';

export default genStyleHooks('Button', (token) => [
  genSharedButtonStyle(token),
  genVariantStyle(token),
], prepareComponentToken);
```

`genStyleHooks` (defined in `components/theme/util/genStyleUtils.ts`) wires up ConfigContext prefix, `useToken`, CSP, and calls `useStyleRegister` from `@ant-design/cssinjs`. The returned hook is called inside the component to inject styles.

### Component Structure Pattern

```
components/button/
├── Button.tsx          # Implementation
├── index.tsx           # Public export, attaches sub-components
├── context.ts          # Internal context (if needed)
├── style/
│   ├── index.ts        # genStyleHooks call — registers all styles
│   └── token.ts        # ComponentToken interface + prepareComponentToken
├── demo/               # Demo files (*.tsx); imports must use 'antd' alias, not relative paths
├── __tests__/          # Tests use relative imports, never 'antd' alias
├── index.en-US.md      # English API docs
└── index.zh-CN.md      # Chinese API docs
```

### Shared Test Helpers (`tests/shared/`)

| Helper | Purpose |
|--------|---------|
| `mountTest` | Verifies component mounts without errors in basic + size variants |
| `rtlTest` | Renders component under RTL ConfigProvider, checks snapshot |
| `demoTest` | Renders all `demo/*.tsx` files as snapshots |
| `accessibilityTest` | Runs jest-axe accessibility check |

Use these at the top of every `__tests__/index.test.tsx`.

## Coding Conventions

### TypeScript

- Never use `any` — define precise types
- Use interfaces (not type aliases) for object structures; name them `ComponentNameProps`
- Prefer union types over enums; use `as const` for constants
- Component refs must expose `{ nativeElement: HTMLElement; focus: VoidFunction; ... }` via `React.forwardRef`

### Components

- Functional components with hooks only (no class components)
- Use CSS logical properties for RTL (`margin-inline-start` not `margin-left`)
- Never hardcode colors, sizes, or spacing — use design tokens
- Use `components/_util/is.ts` type guards (`isNumber`, `isString`, etc.) before rolling inline `typeof`/`instanceof`

### Naming

- Controlled/uncontrolled pairs: `value` / `defaultValue`
- Open state: `open` (not `visible`)
- Events: `on` + EventName (`onClick`, `onChange`)
- Use complete names, no abbreviations

---

## Import Rules

### Demo files (`components/**/demo/`)

- Use absolute imports only: `antd`, `antd/es/*`, `antd/lib/*`, `antd/locale/*`, `@@/*`
- Exception: `_semantic*.tsx` files may use relative paths to `.dumi/` helpers
- No `../`, `../../`, or `./` references to component internals

### Test files (`components/**/__tests__/`)

- Use relative imports only: `../`, `../index`, `../../_util/*`, `../../../tests/shared/*`
- Never import from `antd`, `antd/es/*`, or any alias path for in-repo code
- Third-party deps (`react`, `@testing-library/react`, `dayjs`) import normally by package name

---

## Documentation

### API Table Format

| Property | Description | Type | Default | Version |
|----------|-------------|------|---------|---------|
| disabled | Whether disabled | boolean | false | - |
| type | Button type | `primary` \| `default` | `default` | - |

- String defaults in backticks; boolean/number as literals; no default → `-`
- Sort API properties alphabetically; new props must include `Version`

### Anchor IDs

- Chinese headings need explicit English anchors: `## 中文标题 {#english-anchor-id}`
- Pattern: `^[a-zA-Z][\w-:\.]*$`, max 32 chars; FAQ items must use `faq-` prefix

### i18n

- Locale files: `components/locale/[lang_COUNTRY].ts` (e.g. `zh_CN.ts`)
- Type entry: `components/locale/index.tsx`
- Any locale change must be applied to **all** language files

---

## PR & Branch

- PR titles always in English: `fix: fix Button style in Safari`
- Feature branches → `feature` base; everything else → `master`
- Branch prefixes: `feat/`, `fix/`, `docs/`, `refactor/`
- Fill PR template from `.github/PULL_REQUEST_TEMPLATE.md` (EN) or `PULL_REQUEST_TEMPLATE_CN.md`

---

## Changelog

Only update `CHANGELOG.en-US.md` / `CHANGELOG.zh-CN.md` when explicitly preparing a release. Regular PRs just fill the PR template field with a brief impact description or `N/A`.

Format per entry: `Emoji ComponentName description` (verb first). One emoji per entry. Both EN and ZH versions required.

Emoji guide: 🐞 bug fix · 💄 style/token · 🆕 new feature · 🔥 major feature · ✅ tests · 🛠 refactor · ⚡️ perf · 🗑 deprecation

---

## References

- [API Naming Rules](https://github.com/ant-design/ant-design/wiki/API-Naming-rules)
- [Release Process](https://github.com/ant-design/ant-design/wiki/%E8%BD%AE%E5%80%BC%E8%A7%84%E5%88%99%E5%92%8C%E7%89%88%E6%9C%AC%E5%8F%91%E5%B8%83%E6%B5%81%E7%A8%8B)
- [Unique Panel Component](https://github.com/ant-design/ant-design/wiki/Unique-Panel-Component)

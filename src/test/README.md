# Testing Infrastructure

## Status

✅ Testing framework installed and configured
⚠️ **Known Issue:** Tailwind CSS v4 compatibility issue with Vitest

## Setup

- **Framework:** Vitest 4.0.18
- **Testing Library:** @testing-library/react 16.3.2
- **Environment:** jsdom
- **Coverage:** @vitest/coverage-v8

## Known Issues

### Tailwind CSS v4 + Vitest Compatibility

There's currently a known compatibility issue between Tailwind CSS v4 and Vitest where ESM-only CSS tool dependencies (`@csstools/css-calc`, `@asamuzakjp/css-color`) cannot be loaded in the Vitest worker process.

**Error:**
```
Error: require() of ES Module /node_modules/@csstools/css-calc/dist/index.mjs not supported
```

**Impact:** Cannot currently test React components, services, or hooks due to transitive CSS imports through the module graph.

**Workaround:** Only isolated constants and utilities with zero imports can be tested. Service layer tests will be added once this issue is resolved.

**Tracking:**
- https://github.com/tailwindlabs/tailwindcss/issues/...
- Vitest v4 pool rework may help: https://vitest.dev/guide/migration#pool-rework

## Running Tests

```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm test

# Run with coverage
npm run test:coverage
```

## Current Tests

- ✅ Smoke tests (brand constants validation)
- ⏳ Component tests (blocked by Tailwind CSS v4 issue)
- ⏳ Hook tests (blocked by Tailwind CSS v4 issue)
- ⏳ Service layer tests (blocked by Tailwind CSS v4 issue - will be added once resolved)

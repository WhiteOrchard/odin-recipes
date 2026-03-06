# Concrete — Production Implementation Plan

> **App name**: Concrete
> **Branch**: `claude/luxury-property-manager-app-iVJdU`
> **Stack**: React 19 + TypeScript + Vite 7 + Tailwind CSS v4 + Supabase
> **Rule**: Commit after EVERY step. Run `npm run build` before each commit. Every new module gets unit tests.

---

## Context Files (provide before starting)

- **Branding**: `/home/user/odin-recipes/brand/` — colors, .ttf fonts in `brand/fonts/`, logos in `brand/logos/`, guidelines
- **Reference app**: [PATH — user to provide]
- **Wireframes**: [PATH — user to drop PNG exports from Figma]

Read brand/, reference app, and wireframes BEFORE starting any work.

---

## Key Architecture Decisions

**Service layer pattern**: Every entity gets a service file (`src/services/*.ts`) with `getAll`, `getById`, `create`, `update`, `delete`. Each function checks `isDemoMode` from `src/lib/supabase.ts`:
- **Demo mode**: read/write to localStorage (seeded from `mockData.ts` on first load)
- **Supabase mode**: call Supabase client with proper RLS

**Type mapping**: `src/types/database.ts` uses snake_case (Supabase). `src/types/index.ts` uses camelCase (frontend). `src/services/mappers.ts` converts between them.

**Hooks layer**: Each service is wrapped in a React hook (`src/hooks/use*.ts`) that manages loading/error/data state. Pages only talk to hooks, never directly to services.

**Mock data stays**: `src/data/mockData.ts` remains as seed data for demo mode, but NO page imports it directly — everything goes through hooks → services.

---

## Phase 0 — Foundation (3 commits)

### 0.1 Rebrand to Concrete

Create `brand/` folder structure. Rename all LuxeEstates/luxeestates references across every file.

**Create**:
- `brand/` directory (fonts/, logos/, colors.json, guidelines.md — placeholders for user assets)
- `src/brand/constants.ts` — `APP_NAME`, tagline, copyright

**Modify** (search-and-replace across codebase):
- `package.json` — name: "concrete"
- `index.html` — title
- `supabase/config.toml` — id/name
- `src/index.css` — rename `--color-mansion-*` → `--color-concrete-*`
- `src/components/Sidebar.tsx` — logo and text
- `src/pages/Login.tsx` — branding
- `src/context/ThemeContext.tsx` — localStorage key: `concrete-theme`
- `src/context/AuthContext.tsx` — demo email: `demo@concrete.app`
- `src/App.tsx` — loading text
- All files using `mansion-*` classes → `concrete-*`

**Commit**: `rebrand: rename to Concrete, create brand/ folder`

### 0.2 Install Vitest + React Testing Library

**Install**: vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom, @vitest/coverage-v8

**Create**:
- `vitest.config.ts` — jsdom env, path aliases, coverage config
- `src/test/setup.ts` — testing-library matchers, matchMedia mock
- `src/test/test-utils.tsx` — custom `render()` wrapping BrowserRouter + ThemeProvider + AuthProvider (mocked)
- `src/test/smoke.test.tsx` — basic smoke test

**Modify**:
- `package.json` — add scripts: `test`, `test:run`, `test:coverage`
- `tsconfig.app.json` — add `baseUrl: "."` and `paths: { "@/*": ["./src/*"] }`
- `.github/workflows/ci.yml` — add `npm run test:run` step

**Commit**: `infra: add Vitest + Testing Library, configure path aliases, add test CI step`

### 0.3 Add reusable UI primitives

**Create**:
- `src/components/ErrorBoundary.tsx` — catches render errors, shows retry UI
- `src/components/LoadingSkeleton.tsx` — pulse skeleton for loading states
- `src/components/EmptyState.tsx` — icon + title + description + CTA
- `src/components/Toast.tsx` — auto-dismiss success/error toasts
- `src/components/Modal.tsx` — generic modal with focus trap, Escape to close
- `src/components/ConfirmDialog.tsx` — "Are you sure?" confirmation modal
- Tests for each: `src/components/__tests__/*.test.tsx`

**Modify**:
- `src/App.tsx` — wrap ProtectedApp in ErrorBoundary

**Commit**: `feat: add ErrorBoundary, LoadingSkeleton, EmptyState, Toast, Modal, ConfirmDialog`

---

## Phase 1 — Service Layer (9 commits)

### 1.1 Base service utilities and type mappers

**Create**:
- `src/services/demoStore.ts` — localStorage CRUD engine: `getCollection<T>(key)`, `setCollection<T>(key, data)`, `getById<T>(key, id)`, `upsert<T>(key, item)`, `removeItem(key, id)`, `initializeDemoData()` (seeds from mockData on first load)
- `src/services/mappers.ts` — bidirectional mappers for every entity (snake_case ↔ camelCase). Handles: `monthly_rent` ↔ `monthlyRent`, `year_built` ↔ `yearBuilt`, `property_id` ↔ `propertyId`, `lat`/`lng` ↔ `coordinates: {lat, lng}`, `avatar_initials` ↔ `avatar`, `first_name`/`last_name` ↔ `firstName`/`lastName`, etc.
- `src/services/types.ts` — `ServiceResult<T>`, `ServiceListResult<T>`

**Modify**:
- `src/types/index.ts` — add `Document`, `FloorPlan`, `PhotoPin` interfaces (currently inline in page files)
- `src/types/database.ts` — add `documents`, `floor_plans`, `photo_pins` table types (migrations exist but types don't)

**Tests**: `src/services/__tests__/demoStore.test.ts`, `src/services/__tests__/mappers.test.ts`

**Commit**: `feat: add service layer foundation — demoStore, type mappers, ServiceResult types`

### 1.2 propertyService

**Create**: `src/services/propertyService.ts` — getAll, getById, create, update, delete
**Tests**: `src/services/__tests__/propertyService.test.ts`
**Commit**: `feat: add propertyService with demo/Supabase dual-mode CRUD`

### 1.3 tenantService + paymentService

**Create**: `src/services/tenantService.ts` (getAll joins payments into paymentHistory), `src/services/paymentService.ts`
**Tests**: `src/services/__tests__/tenantService.test.ts`, `src/services/__tests__/paymentService.test.ts`
**Commit**: `feat: add tenantService and paymentService`

### 1.4 maintenanceService

**Create**: `src/services/maintenanceService.ts`
**Tests**: `src/services/__tests__/maintenanceService.test.ts`
**Commit**: `feat: add maintenanceService`

### 1.5 calendarService

**Create**: `src/services/calendarService.ts` — includes `getByMonth(year, month)`
**Tests**: `src/services/__tests__/calendarService.test.ts`
**Commit**: `feat: add calendarService`

### 1.6 financialService

**Create**: `src/services/financialService.ts` — `getMonthlyFinancials()`, `getSummary()` (demo: returns mockData; Supabase: aggregates from payments+maintenance)
**Tests**: `src/services/__tests__/financialService.test.ts`
**Commit**: `feat: add financialService`

### 1.7 documentService + floorPlanService

**Create**: `src/services/documentService.ts` (upload/download/CRUD, Supabase Storage in live mode, blob URLs in demo), `src/services/floorPlanService.ts` (CRUD for plans + addPin/removePin)
**Tests**: `src/services/__tests__/documentService.test.ts`, `src/services/__tests__/floorPlanService.test.ts`
**Commit**: `feat: add documentService and floorPlanService with file storage`

### 1.8 settingsService

**Create**:
- `src/types/settings.ts` — `UserSettings` interface
- `src/services/settingsService.ts` — `getSettings()`, `updateSettings(partial)` (demo: localStorage; Supabase: user metadata)
- `supabase/migrations/20260206000002_user_settings.sql` — optional user_settings table

**Tests**: `src/services/__tests__/settingsService.test.ts`
**Commit**: `feat: add settingsService for user preferences`

### 1.9 Custom React hooks for all services

**Create**:
- `src/hooks/useProperties.ts` — `{ properties, loading, error, create, update, remove, refresh }`
- `src/hooks/useTenants.ts`
- `src/hooks/useMaintenanceRequests.ts`
- `src/hooks/useCalendarEvents.ts`
- `src/hooks/useFinancials.ts`
- `src/hooks/useDocuments.ts`
- `src/hooks/useFloorPlans.ts`
- `src/hooks/useSettings.ts`

**Tests**: at least `src/hooks/__tests__/useProperties.test.ts`, `src/hooks/__tests__/useSettings.test.ts`

**Commit**: `feat: add React hooks wrapping all services`

---

## Phase 2 — Auth (2 commits)

### 2.1 Production login flow

**Modify**:
- `src/context/AuthContext.tsx` — add `resetPassword(email)`. Remove auto-login setTimeout in demo mode; require explicit "Enter Demo Mode" click.
- `src/pages/Login.tsx` — add "Forgot Password?" link → email form → `resetPasswordForEmail()`. Apply Concrete branding.

**Create**:
- `src/pages/ResetPassword.tsx` — handles redirect from password reset email

**Modify**: `src/App.tsx` — add `/reset-password` route (outside protected routes)

**Tests**: `src/pages/__tests__/Login.test.tsx`, `src/context/__tests__/AuthContext.test.tsx`

**Commit**: `feat: production login with password reset, remove auto-login bypass`

### 2.2 Sign-out UI

**Modify**:
- `src/components/Header.tsx` — user area becomes a dropdown with Profile, Settings, divider, Sign Out. Display real user name from `user.user_metadata`. Wire Sign Out to `signOut()`.
- `src/components/Sidebar.tsx` — add Sign Out button at bottom when expanded

**Tests**: `src/components/__tests__/Header.test.tsx`, `src/components/__tests__/Sidebar.test.tsx`

**Commit**: `feat: add sign-out to Header dropdown and Sidebar`

---

## Phase 3 — Settings Persistence (1 commit)

### 3.1 Wire Settings page to settingsService

**Modify**: `src/pages/Settings.tsx` — complete rewrite of state management:
- All inputs become controlled via `useSettings()` hook
- "Save Changes" calls `updateSettings()` → shows Toast on success/error
- Notification toggles persist immediately
- Currency/dateFormat persist and apply globally
- "Enable 2FA" → toast in demo mode / `supabase.auth.mfa.enroll()` in live mode
- "Change Password" → modal form calling `supabase.auth.updateUser()`

**Create**: `src/components/ChangePasswordModal.tsx`

**Tests**: `src/pages/__tests__/Settings.test.tsx`

**Commit**: `feat: Settings page fully persistent with password change and 2FA`

---

## Phase 4 — Wire Pages to Services (8 commits)

Replace all direct `mockData.ts` imports with hooks. Add loading/error/empty states.

### 4.1 Dashboard → `useProperties`, `useTenants`, `useMaintenanceRequests`, `useCalendarEvents`, `useFinancials`
**Commit**: `feat: wire Dashboard to service layer`

### 4.2 Properties + PropertyDetail → `useProperties`
**Commit**: `feat: wire Properties pages to service layer`

### 4.3 Tenants → `useTenants`
**Commit**: `feat: wire Tenants page to service layer`

### 4.4 Maintenance → `useMaintenanceRequests`
**Commit**: `feat: wire Maintenance page to service layer`

### 4.5 Calendar → `useCalendarEvents`
**Commit**: `feat: wire Calendar page to service layer`

### 4.6 Financials → `useFinancials`
**Commit**: `feat: wire Financials page to service layer`

### 4.7 Documents → `useDocuments`
**Commit**: `feat: wire Documents page to service layer`

### 4.8 FloorMap → `useFloorPlans`
**Commit**: `feat: wire FloorMap page to service layer`

Each step: replace imports, use hook, add `<LoadingSkeleton />` for loading, error banner for errors, `<EmptyState />` for empty data. Write page render test.

---

## Phase 5 — CRUD Operations (6 commits)

### 5.1 Properties: create/edit/delete

**Create**: `src/components/PropertyFormModal.tsx` (used for both create and edit), add kebab menu to PropertyCard
**Modify**: `src/pages/Properties.tsx` (Add Property button), `src/pages/PropertyDetail.tsx` (Edit/Delete buttons)
**Tests**: `src/components/__tests__/PropertyFormModal.test.tsx`
**Commit**: `feat: add CRUD for Properties`

### 5.2 Tenants: create/edit/delete

**Create**: `src/components/TenantFormModal.tsx`
**Modify**: `src/pages/Tenants.tsx`
**Commit**: `feat: add CRUD for Tenants`

### 5.3 Maintenance: create/edit/status updates

**Create**: `src/components/MaintenanceFormModal.tsx`
**Modify**: `src/pages/Maintenance.tsx` — New Request button, status change dropdown
**Commit**: `feat: add CRUD for Maintenance requests`

### 5.4 Calendar: create/edit/delete events

**Create**: `src/components/EventFormModal.tsx`
**Modify**: `src/pages/Calendar.tsx` — Add Event button, click-to-edit
**Commit**: `feat: add CRUD for Calendar events`

### 5.5 Documents: real upload/download/delete

**Modify**: `src/pages/Documents.tsx` — upload calls `documentService.upload()`, download button gets `onClick` with blob download, delete calls service
**Commit**: `feat: wire document upload/download/delete to services`

### 5.6 FloorMap: persistent pins

**Modify**: `src/pages/FloorMap.tsx` — pin add/remove calls floorPlanService
**Commit**: `feat: persist FloorMap pins via service layer`

---

## Phase 6 — Header & Global UI (2 commits)

### 6.1 Global search

**Create**: `src/components/GlobalSearchResults.tsx`, `src/hooks/useGlobalSearch.ts`
**Modify**: `src/components/Header.tsx` — capture input, show categorized results dropdown, navigate on click, `/` keyboard shortcut
**Tests**: `src/hooks/__tests__/useGlobalSearch.test.ts`, `src/components/__tests__/GlobalSearchResults.test.tsx`
**Commit**: `feat: functional global search across properties, tenants, maintenance`

### 6.2 Notification system

**Create**: `src/components/NotificationDropdown.tsx`, `src/services/notificationService.ts` (derives notifications from: overdue payments, expiring leases < 60 days, urgent open maintenance)
**Modify**: `src/components/Header.tsx` — bell onClick toggles dropdown, badge shows real unread count
**Tests**: `src/services/__tests__/notificationService.test.ts`, `src/components/__tests__/NotificationDropdown.test.tsx`
**Commit**: `feat: data-driven notification system with dropdown`

---

## Phase 7 — Polish (4 commits)

### 7.1 Extract formatters, respect user currency

**Create**: `src/lib/formatters.ts` — move formatCurrency/formatFullCurrency from mockData.ts, accept currency param
**Modify**: all files importing formatters from mockData → import from lib/formatters
**Tests**: `src/lib/__tests__/formatters.test.ts`
**Commit**: `refactor: extract currency formatters, respect user settings`

### 7.2 Form validation

**Install**: zod
**Create**: `src/lib/validation.ts` — Zod schemas for all forms
**Modify**: all form modals — integrate validation, show inline field errors
**Tests**: `src/lib/__tests__/validation.test.ts`
**Commit**: `feat: add Zod form validation across all forms`

### 7.3 Consistent loading/error/empty states audit

**Modify**: every page — verify LoadingSkeleton, error banner, EmptyState with CTA
**Commit**: `fix: consistent loading, error, empty states across all pages`

### 7.4 Final CI + build verification

**Modify**: `.github/workflows/ci.yml` — verify test step, add coverage upload
**Run**: `npm run lint`, `npm run test:run`, `npm run build` — all must pass
**Commit**: `chore: final CI pipeline with tests and build verification`

---

## Dependency Graph

```
Phase 0: 0.1 → 0.2 → 0.3
Phase 1: 1.1 → 1.2..1.8 (parallel) → 1.9
Phase 2: 2.1 → 2.2              (depends on 0.1 for branding)
Phase 3: 3.1                     (depends on 1.8, 1.9, 0.3)
Phase 4: 4.1..4.8 (parallel)    (depends on 1.9, 0.3)
Phase 5: 5.1..5.6 (parallel)    (depends on respective Phase 4 step + 0.3 for Modal)
Phase 6: 6.1, 6.2 (parallel)    (depends on 1.9)
Phase 7: 7.1..7.4 (sequential)  (depends on Phase 5)
```

**Total: 35 commits**

---

## Critical Files Reference

| File | Role |
|------|------|
| `src/lib/supabase.ts` | `isDemoMode` flag — single source of truth for backend routing |
| `src/services/demoStore.ts` | localStorage CRUD engine for demo mode |
| `src/services/mappers.ts` | snake_case ↔ camelCase type conversion |
| `src/data/mockData.ts` | Seed data for demo mode (no direct page imports after Phase 4) |
| `src/types/index.ts` | All frontend types (needs Document, FloorPlan, PhotoPin additions) |
| `src/types/database.ts` | Supabase row types (needs documents, floor_plans, photo_pins additions) |
| `src/types/settings.ts` | UserSettings interface (to be created) |

## Verification

After each phase, verify:
1. `npm run build` — zero errors
2. `npm run test:run` — all tests pass
3. `npm run lint` — no lint errors
4. Manual check: `npm run dev` → test the affected features in browser

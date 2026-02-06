# Concrete — Production Implementation Plan

## Context Files
- Reference app codebase: /Users/cypriendebarros/Desktop/flutter_projects/concrete
- Wireframes: /home/user/odin-recipes/wireframes/
- Branding: /home/user/odin-recipes/brand/

Read the reference app and wireframes BEFORE starting any work.
Read brand/ before any UI work to apply correct colors, typography, logos.

## App Identity
- Name: **Concrete**
- Rename all references from LuxeEstates/luxeestates to Concrete

## Rules
- Commit after EVERY completed feature (not in batches)
- Run `npm run build` before each commit to catch errors
- Every new module must have unit tests
- Branch: claude/luxury-property-manager-app-iVJdU

---

## Phase 1 — Foundation & Testing Infrastructure

### 1.1 Install testing stack
- Install vitest, @testing-library/react, @testing-library/jest-dom,
  @testing-library/user-event, jsdom, msw
- Configure vitest.config.ts with jsdom environment
- Add test script to package.json
- Create src/test/setup.ts with testing-library matchers
- COMMIT: "Add testing infrastructure with Vitest and Testing Library"

### 1.2 Rebrand to Concrete
- Rename all LuxeEstates references across every file
- Update index.html title, Sidebar logo, Login page branding
- Apply brand/ assets (colors, fonts, logos) to Tailwind theme and components
- COMMIT: "Rebrand application to Concrete"

### 1.3 Create persistent settings store
- Create src/hooks/useSettings.ts using localStorage + React context
- Settings to persist: firstName, lastName, email, currency, dateFormat,
  language, all notification toggles
- Create SettingsContext with provider wrapping the app
- Write unit tests for useSettings (load, save, defaults, reset)
- COMMIT: "Add persistent settings store with localStorage"

### 1.4 Wire Settings page to store
- Replace all defaultValue inputs with controlled inputs from SettingsContext
- Save Changes button writes to context (which persists to localStorage)
- Currency and dateFormat selections apply globally via context
- Show success toast on save, error toast on failure
- Write tests: change a setting → save → reload → verify persisted
- COMMIT: "Wire Settings page to persistent store"

---

## Phase 2 — Fix All Non-Functional UI

### 2.1 Fix dark mode toggle in Settings
- Settings page toggle must use useTheme().toggle, verify it applies
  the `dark` class to <html>
- Test: click toggle → verify document.documentElement has class "dark"
- COMMIT: "Fix dark mode toggle in Settings page"

### 2.2 Build notification system
- Create src/context/NotificationContext.tsx
- Types: info, warning, success, maintenance, payment, lease
- Store notifications in state with read/unread/dismissed
- Create NotificationPanel dropdown component for Header bell icon
- Show unread count badge on bell
- Mark as read on click, "Mark all read" button
- Seed with mock notifications derived from maintenance/calendar data
- Write tests: add notification → verify count → mark read → verify
- COMMIT: "Add functional notification system with dropdown panel"

### 2.3 Fix Header search
- Make search bar functional: search across properties (name, city),
  tenants (name, email), maintenance (title)
- Show results dropdown with categorized sections
- Click result navigates to correct page
- Write tests for search matching logic
- COMMIT: "Add functional global search with navigation"

### 2.4 Add sign-out to UI
- Add sign out button to sidebar bottom or user menu in Header
- Wire to AuthContext.signOut()
- Test: click sign out → verify session cleared → login screen shown
- COMMIT: "Add sign-out button to UI"

### 2.5 Make all cosmetic buttons functional
- Settings: "Enable 2FA" → show setup modal or toast
- Settings: "Change Password" → show password change form
- Documents: "Download" button → trigger file download
- Property detail: add "Edit Property" capability
- Write tests for each interaction
- COMMIT: "Wire remaining cosmetic buttons to functional behavior"

---

## Phase 3 — Supabase Backend Integration

### 3.1 Create data service layer
- Create src/services/properties.ts, tenants.ts, maintenance.ts,
  calendar.ts, documents.ts, payments.ts
- Each service: CRUD functions that call Supabase when connected,
  fall back to localStorage mock data when in demo mode
- Interface: getAll(), getById(), create(), update(), delete()
- Write unit tests with MSW mocking Supabase responses
- COMMIT: "Add data service layer with Supabase/demo mode fallback"

### 3.2 Connect pages to services (replace static imports)
- Dashboard: fetch live data via services
- Properties/PropertyDetail: CRUD via services
- Tenants: CRUD via services
- Maintenance: CRUD via services
- Calendar: CRUD via services
- Documents: CRUD via services + Supabase Storage for file uploads
- Each page: loading states, error states, empty states
- COMMIT per page (7 commits)

### 3.3 Add create/edit forms
- Add Property form (modal or dedicated page)
- Add Tenant form
- Add Maintenance Request form
- Add Calendar Event form
- All forms with validation
- Write tests for form validation and submission
- COMMIT per form

### 3.4 Real-time subscriptions
- Use Supabase realtime to subscribe to changes on maintenance_requests
  and payments tables
- When a new maintenance request arrives, push a notification
- When a payment status changes, push a notification
- COMMIT: "Add Supabase realtime subscriptions for live updates"

---

## Phase 4 — Auth & Login Production-Ready

### 4.1 Production login flow
- Email/password sign up with email confirmation
- Password reset flow (forgot password → email → reset page)
- Add /auth/callback route for Supabase email redirects
- Session refresh handling
- Protected route wrapper that redirects to /login
- COMMIT: "Implement production auth flow with password reset"

### 4.2 Login page polish
- Apply Concrete branding from brand/ folder
- Match wireframe layout exactly
- Loading states, error messages, input validation
- "Remember me" checkbox using persistent session
- Write E2E-style tests for login/signup/logout flows
- COMMIT: "Polish login page with branding and validation"

---

## Phase 5 — Tests & Quality Gate

### 5.1 Unit test coverage
- Target: every context, hook, service, and utility has tests
- Target: every page has at least a render + key interaction test
- Run: `npx vitest run --coverage` must pass
- COMMIT: "Add comprehensive unit test coverage"

### 5.2 Build verification
- `npm run build` must succeed with zero errors
- `npm run lint` must pass
- All tests pass
- COMMIT: "Final build verification and lint cleanup"

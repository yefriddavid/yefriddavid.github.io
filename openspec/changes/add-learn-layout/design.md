## Context

The app registers one top-level layout per module directly in `src/App.js` (`FinanceLayout`, `MiscelaneaLayout`, `DomoticaLayout`, `TaxisLayout`, `SystemLayout`), each mounted on its own route prefix (`<Route path="/module/*" element={<ModuleLayout />} />`). Non-Finance modules (`Domotica`, `Taxis`) follow a consistent flat-file pattern: `src/layout/ModuleLayout.js` composing a module-specific `ModuleSidebar` + `ModuleContent`, `AppHeader`/`AppFooter` from shared components, and `NotificationToaster`. `ModuleContent` owns its own Firebase auth-state listener (redirects to `/login` when signed out) and a `<Routes>` block driven by a `routes.module.js` file, mirroring what `AppContent` does for the Finance module.

There is no existing `learn` capability or route today.

## Goals / Non-Goals

**Goals:**
- Add `LearnLayout` as a new top-level layout mounted at `/learn/*`, structurally consistent with `DomoticaLayout`/`TaxisLayout`.
- Render a single placeholder ("coming soon") view so the route resolves to real content instead of a blank page or 404.
- Make the module reachable via its own sidebar (`LearnSidebar`), even if it only lists the placeholder item for now.
- Keep the module mobile-compatible from day one (shared header/sidebar patterns already handle this).

**Non-Goals:**
- No real learning content, no Redux slice, no Firestore collection/service, no data fetching.
- No reuse of the global `_nav.js`/`AppSidebar` — consistent with how Domotica/Taxis keep their own sidebar rather than extending the Finance one.

## Decisions

- **Flat-file layout, module-owned sidebar/content** — mirror `DomoticaLayout.js` exactly (own `LearnSidebar`, own `LearnContent`, own `routes.learn.js`) rather than reusing `AppContent`/`AppSidebar` (the Finance-specific pair). Rationale: `AppContent`/`AppSidebar` are wired to Finance-specific nav (`_nav.js`) and behavior; duplicating the lighter Domotica/Taxis pattern is the established convention for a new independent module and keeps this change's blast radius to new files only.
- **Auth guard duplicated in `LearnContent`**, following `DomoticaContent`'s pattern (Firebase `onAuthChange` → redirect to `/login` when signed out), instead of inventing a shared guard. Rationale: this is the existing repo convention for secondary layouts; introducing a shared auth-guard abstraction is out of scope for a shell-only change.
- **Single placeholder route** (`/learn` index → "Learn - próximamente" view) instead of no routes at all, so `/learn/*` never falls through to a blank screen or the catch-all `/*` → `FinanceLayout` redirect.

## Risks / Trade-offs

- [Risk] Duplicating the auth-guard/content-shell pattern per module (already present 2x) grows a 3rd copy → [Mitigation] Accepted for now since it matches existing convention; flagged as a candidate for a future shared-abstraction change, not blocking this one.
- [Risk] Empty module with just a placeholder may look unfinished to end users if surfaced in nav prematurely → [Mitigation] Sidebar/nav entry only added once this change is applied; a follow-up change adds real content before wider visibility is expected.

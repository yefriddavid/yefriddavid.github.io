## 1. Routing & App registration

- [ ] 1.1 Add `LearnLayout` lazy import and `<Route path="/learn/*" element={<LearnLayout />} />` in `src/App.js`, placed alongside the other module routes (before the catch-all `/*` → `FinanceLayout`)
- [ ] 1.2 Create `src/routes.learn.js` with a single index route pointing to the placeholder view

## 2. Layout shell

- [ ] 2.1 Create `src/layout/LearnLayout.js` mirroring `src/layout/DomoticaLayout.js` (own sidebar + content, `AppHeader`, `AppFooter`, `NotificationToaster`, sets `document.title`)
- [ ] 2.2 Create `src/components/learn/LearnSidebar.js` with a single nav entry to the placeholder route, label sourced from i18n (not hardcoded)
- [ ] 2.3 Create `src/components/learn/LearnContent.js` mirroring `DomoticaContent.js`'s auth-guard pattern (Firebase `onAuthChange`, redirect to `/login` when signed out) and rendering `routes.learn.js` via `<Routes>`

## 3. Placeholder view

- [ ] 3.1 Create `src/views/Learn/ComingSoon.js` (or similar) rendering a simple "Aprender - próximamente" message, mobile-compatible
- [ ] 3.2 Add the Spanish i18n string(s) for the sidebar label and placeholder text

## 4. Verification

- [ ] 4.1 `npm run lint` passes
- [ ] 4.2 Manually verify: signed-in user navigating to `/learn` sees the layout + placeholder; signed-out user is redirected to `/login`
- [ ] 4.3 Check the new screen at a mobile viewport per the project's mobile-compatibility rule

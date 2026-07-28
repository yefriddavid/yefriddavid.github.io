## Why

The app currently has no place to host learning/reference content (guides, docs, courses) for its users. Before any such content exists, we need a dedicated layout to serve as its container — following the same pattern as the other module layouts (`FinanceLayout`, `TaxisLayout`, `DomoticaLayout`, `SystemLayout`).

## What Changes

- Add a new `LearnLayout` registered under the `/learn/*` route prefix in `src/App.js`, following the existing layout structure (header, sidebar, content outlet, `NotificationToaster`).
- Add an empty `src/routes/learn.js` (or equivalent) route table with a single placeholder route (e.g. a "coming soon" index page) so the layout renders something valid.
- Add a `Learn` entry to the sidebar navigation config so the module is reachable from the app shell.
- No content views, no Redux slice, no Firestore collection — this change only creates the shell. Actual learning content is out of scope and will be proposed separately.

## Capabilities

### New Capabilities
- `learn-layout`: A new app layout (`LearnLayout`) mounted at `/learn/*`, providing the container (header/sidebar/outlet/toaster) for a future Learn module, with no content views yet.

### Modified Capabilities
(none — no existing capability's requirements change)

## Impact

- **Affected code**: `src/App.js` (layout registration), new `src/layout/LearnLayout/` folder, new `src/routes/learn.js` (or route array appended to existing routing setup), `src/_nav.js` (sidebar entry).
- **No Redux, no Firestore, no services** — this is presentation/routing only, so none of the state-management or backend rules apply beyond mounting `NotificationToaster` in the new layout.
- **Mobile**: layout must be mobile-compatible per project rules (reuse existing header/sidebar shared components, no new desktop-only markup).

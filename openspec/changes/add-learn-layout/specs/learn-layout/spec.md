## ADDED Requirements

### Requirement: Learn module layout shell
The system SHALL provide a `LearnLayout` mounted at the `/learn/*` route prefix in `src/App.js`, structurally consistent with the other module layouts (`AppHeader`, `AppFooter`, a module sidebar, `NotificationToaster`).

#### Scenario: Navigating to the Learn module
- **WHEN** a signed-in user navigates to `/learn` (or any `/learn/*` path)
- **THEN** the system renders `LearnLayout` with header, sidebar, and content area, instead of falling through to the default `/*` → `FinanceLayout` route

#### Scenario: Signed-out user hits a Learn route
- **WHEN** a signed-out user navigates to any `/learn/*` path
- **THEN** the system redirects to `/login`, consistent with how `DomoticaContent`/`TaxisContent` guard their routes

### Requirement: Learn module placeholder page
The system SHALL render a placeholder ("coming soon") view as the index route of `/learn`, since no learning content exists yet.

#### Scenario: Viewing the empty Learn module
- **WHEN** a signed-in user lands on `/learn`
- **THEN** the system shows a placeholder view (e.g. "Aprender - próximamente") instead of a blank page or 404

### Requirement: Learn module sidebar entry
The system SHALL provide a `LearnSidebar` used only within `LearnLayout`, separate from the global `_nav.js`/`AppSidebar` used by `FinanceLayout`, following the same pattern as `DomoticaSidebar`/`TaxisSidebar`.

#### Scenario: Sidebar shows the module entry point
- **WHEN** `LearnLayout` renders
- **THEN** `LearnSidebar` shows at least one entry pointing to the `/learn` placeholder route, labeled with the Spanish i18n string (e.g. "Aprender"), not a hardcoded English literal

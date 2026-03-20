# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:3000
npm run build      # Production build (outputs to /build)
npm run serve      # Preview production build
npm run lint       # ESLint on src/**/*.js
npm run deploy     # Build + deploy to GitHub Pages
```

## Architecture

**React 18 SPA** using Vite, HashRouter, and CoreUI as the component framework. Built as a financial cash-flow management dashboard.

### State Management
Redux Toolkit + Redux-Saga + redux-act pattern:
- `src/actions/` — Action creators (redux-act style)
- `src/reducers/` — State slices (login, account, payment, paymentVaucher)
- `src/sagas/` — Async side effects via redux-saga
- `src/store/store.js` — Store config wiring it all together

Data flows: Component → dispatch action → saga intercepts → API call → reducer update → component re-renders.

### Routing & Auth
- **HashRouter** — all URLs are hash-based (`#/path`)
- **Auth guard** in `src/components/AppContent.js` — checks `localStorage.getItem('token')`, redirects to `/login` if absent
- Route definitions in `src/routes.js`; sidebar nav config in `src/_nav.js`

### Backend / API
Dual backend:
1. **Google Apps Script** (primary) — POST requests with FormData (`action`, `token`, params). Base URL configured in `src/services/providers/api/utilApi.js`. Auth token stored in `localStorage`.
2. **Firebase Firestore** — Used for payment vouchers. Config in `src/services/providers/firebase/settings.js`.

### Layout
`DefaultLayout` (`src/layout/DefaultLayout.js`) wraps all authenticated pages with `AppSidebar + AppHeader + AppContent + AppFooter`. Public pages (login, register, 404) render outside this layout.

### Styling
SCSS with CoreUI variables. Custom overrides in `src/scss/_custom.scss` and `src/scss/_variables.scss`. Prettier enforces: no semicolons, single quotes, trailing commas, 100-char line width, 2-space indent.

### i18n
`i18next` with Spanish (`es`) as default. Translation files loaded via HTTP backend. Use `useTranslation()` hook and `t('key')` in components.

### Key Libraries
- **DevExtreme / DevExpress** — DataGrid (`Accounts.js`) and reporting views
- **Chart.js + CoreUI Charts** — Dashboard charts
- **React Hook Form** — Form handling
- **Moment.js** — Date manipulation

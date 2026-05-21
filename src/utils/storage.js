// Centralized localStorage facade.
// All keys are defined here — never use raw string keys elsewhere.

export const STORAGE_KEYS = {
  // Auth session
  TOKEN: 'token',
  USERNAME: 'username',
  SESSION_ID: 'sessionId',
  LANDING_PAGE: 'landingPage',
  // UI persistence
  APP_THEME: 'app-theme',
  APP_THEME_MODE: 'app-theme-mode',
  SIDEBAR_SHOW: 'sidebar-show',
  HEADER_SHOW: 'header-show',
  FULLSCREEN: 'fullscreen',
  AVATAR: 'cached-avatar',
  // User preferences
  LANG: 'lang',
}

// ── Auth session ───────────────────────────────────────────────────────────────

export const authStorage = {
  getToken: () => localStorage.getItem(STORAGE_KEYS.TOKEN),
  getUsername: () => localStorage.getItem(STORAGE_KEYS.USERNAME),
  getSessionId: () => localStorage.getItem(STORAGE_KEYS.SESSION_ID),
  getLandingPage: () => localStorage.getItem(STORAGE_KEYS.LANDING_PAGE),

  setSession: ({ token, username, sessionId, landingPage }) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
    localStorage.setItem(STORAGE_KEYS.USERNAME, username)
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId)
    localStorage.setItem(STORAGE_KEYS.LANDING_PAGE, landingPage)
  },

  setLandingPage: (v) => localStorage.setItem(STORAGE_KEYS.LANDING_PAGE, v),

  clearSession: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USERNAME)
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID)
    localStorage.removeItem(STORAGE_KEYS.LANDING_PAGE)
  },
}

// ── UI persistence ─────────────────────────────────────────────────────────────

export const uiStorage = {
  getTheme: () => localStorage.getItem(STORAGE_KEYS.APP_THEME) || 'yellow',
  setTheme: (v) => localStorage.setItem(STORAGE_KEYS.APP_THEME, v),

  getThemeMode: () => localStorage.getItem(STORAGE_KEYS.APP_THEME_MODE) || 'auto',
  setThemeMode: (v) => localStorage.setItem(STORAGE_KEYS.APP_THEME_MODE, v),

  getSidebarShow: () => localStorage.getItem(STORAGE_KEYS.SIDEBAR_SHOW),
  setSidebarShow: (v) => localStorage.setItem(STORAGE_KEYS.SIDEBAR_SHOW, String(v)),

  getHeaderShow: () => localStorage.getItem(STORAGE_KEYS.HEADER_SHOW),
  setHeaderShow: (v) => localStorage.setItem(STORAGE_KEYS.HEADER_SHOW, String(v)),

  getFullscreen: () => localStorage.getItem(STORAGE_KEYS.FULLSCREEN) === 'true',
  setFullscreen: (v) => localStorage.setItem(STORAGE_KEYS.FULLSCREEN, String(v)),

  getAvatar: () => localStorage.getItem(STORAGE_KEYS.AVATAR),
  setAvatar: (v) => localStorage.setItem(STORAGE_KEYS.AVATAR, v),
  clearAvatar: () => localStorage.removeItem(STORAGE_KEYS.AVATAR),
}

// ── User preferences ───────────────────────────────────────────────────────────

export const prefStorage = {
  getLang: () => localStorage.getItem(STORAGE_KEYS.LANG) || 'es',
  setLang: (v) => localStorage.setItem(STORAGE_KEYS.LANG, v),
}

module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  globals: {
    __COMMIT_HASH__: 'readonly',
    __COMMIT_MESSAGE__: 'readonly',
    __BUILD_DATE__: 'readonly',
    __APP_VERSION__: 'readonly',
  },
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['react', 'react-hooks'],
  rules: {
    // ── React ──────────────────────────────────────────────────────────────────
    'react/react-in-jsx-scope': 'off',       // React 17+ new JSX transform
    'react/prop-types': 'off',               // project uses no PropTypes/TypeScript
    'react/display-name': 'warn',

    // ── Hooks ──────────────────────────────────────────────────────────────────
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // ── Variables ──────────────────────────────────────────────────────────────
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': ['warn', { destructuring: 'all' }],

    // ── Quality ────────────────────────────────────────────────────────────────
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'no-duplicate-imports': 'error',
    'no-else-return': 'warn',
  },
  overrides: [
    // ── Test files ─────────────────────────────────────────────────────────────
    {
      files: ['src/**/__tests__/**/*.js', 'src/**/*.test.js'],
      env: { node: true },
      rules: {
        'no-unused-vars': 'off',
        'react-hooks/rules-of-hooks': 'off',
      },
    },
    // ── Service workers ────────────────────────────────────────────────────────
    {
      files: ['src/sw/*.js'],
      env: { serviceworker: true },
      rules: {
        'no-console': 'off',
        'no-unused-vars': 'off',
      },
    },
  ],
}

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
    'react/react-in-jsx-scope': 'off',  // React 17+ new JSX transform
    'react/prop-types': 'off',          // project uses no PropTypes/TypeScript
    'react/display-name': 'off',        // noise: anonymous render functions are intentional

    // ── Hooks ──────────────────────────────────────────────────────────────────
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // ── Variables ──────────────────────────────────────────────────────────────
    'no-undef': 'error',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': ['warn', { destructuring: 'all' }],
    'no-shadow': ['warn', { builtinGlobals: false, allow: ['resolve', 'reject', 'error'] }],

    // ── Control flow ───────────────────────────────────────────────────────────
    'no-fallthrough': 'error',
    'no-unreachable': 'error',
    'no-constant-condition': 'warn',
    'no-else-return': 'warn',

    // ── Quality ────────────────────────────────────────────────────────────────
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-empty': ['warn', { allowEmptyCatch: true }],
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'no-duplicate-imports': 'error',
  },
  overrides: [
    // ── Test files ─────────────────────────────────────────────────────────────
    {
      files: [
        'src/**/__tests__/**/*.{js,jsx}',
        'src/**/*.test.{js,jsx}',
        'src/**/*.spec.{js,jsx}',
      ],
      env: { node: true },
      globals: {
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        suite: 'readonly',
      },
      rules: {
        'no-unused-vars': 'off',
        'no-undef': 'error',
        'react-hooks/rules-of-hooks': 'off',
        'no-shadow': 'off',
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

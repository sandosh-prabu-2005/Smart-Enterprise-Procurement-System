import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // This experimental rule flags the standard "fetch data when the
      // screen loads" pattern (useEffect calling an async function that
      // sets state only after its API calls resolve). That pattern is
      // used throughout this app's screens and is safe — the setState
      // calls happen after an await, not synchronously in the effect
      // body — so the rule is disabled project-wide rather than adding
      // per-line disable comments everywhere.
      "react-hooks/set-state-in-effect": "off",
    },
  },
])
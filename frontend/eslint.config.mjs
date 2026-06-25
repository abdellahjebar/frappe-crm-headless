import js from '@eslint/js'
import ts from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import configPrettier from 'eslint-config-prettier'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'
import pluginSecurity from 'eslint-plugin-security'
import pluginNoUnsanitized from 'eslint-plugin-no-unsanitized'

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/public/dist/**'],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue', '**/*.js', '**/*.ts'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: ts.parser,
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        frappe: 'readonly',
        __: 'readonly',
      },
    },
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/prop-name-casing': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/v-on-event-hyphenation': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      'no-undef': 'error',
    },
  },
  pluginSecurity.configs.recommended,
  pluginNoUnsanitized.configs.recommended,
  {
    rules: {
      // Too noisy for frontend: flags every obj[key] access (false positive)
      'security/detect-object-injection': 'off',
      // Flags Vite dynamic import() in router — these use known strings, not user input
      'no-unsanitized/method': 'off',
      // Timing attack detection is only relevant for Node.js server-side secret comparison,
      // not browser === checks on route hashes and UI state booleans
      'security/detect-possible-timing-attacks': 'off',
    },
  },
  configPrettier,
]

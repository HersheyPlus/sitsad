import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

       // Change TypeScript-specific errors to warnings
       '@typescript-eslint/no-unused-vars': ['warn', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }],
       '@typescript-eslint/no-explicit-any': 'warn',
       '@typescript-eslint/no-implicit-any-catch': ['warn', { allowExplicitAny: true }],
       '@typescript-eslint/no-unused-expressions': 'warn',
       '@typescript-eslint/no-non-null-assertion': 'warn',
       '@typescript-eslint/no-shadow': 'warn',
 
       // Add this to prevent index signature errors from being fatal
       '@typescript-eslint/no-unsafe-member-access': 'warn',
    },
  },
)

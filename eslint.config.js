import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config([
	{ ignores: ['dist'] },
	{
		files: ['**/*.{ts,tsx}'],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs['recommended-latest'],
			reactRefresh.configs.vite,
		],
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/explicit-function-return-type': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',
			'prefer-const': 'error',
			'react-hooks/rules-of-hooks': 'error',
			'no-console': 'warn',
			quotes: ['error', 'single'],
			semi: ['error', 'always'],
		},
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
	},
]);

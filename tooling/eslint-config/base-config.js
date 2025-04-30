import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import turboConfig from 'eslint-config-turbo/flat';
import tseslint from 'typescript-eslint';

const baseEslintConfig = tseslint.config(
  eslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'require-await': 'error',
    },
  },
  turboConfig,
  prettierConfig,
  {
    ignores: ['node_modules/**', 'dist/**', '.next/**'],
  }
);

export default baseEslintConfig;

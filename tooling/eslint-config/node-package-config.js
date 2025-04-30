import baseConfig from './base-config.js';
import tseslint from 'typescript-eslint';

const nodePackageEslintConfig = tseslint.config(baseConfig, tseslint.configs.strict, {
  rules: {
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
});

export default nodePackageEslintConfig;

import tseslint from 'typescript-eslint';
import baseEslintConfig from './base-config.js';

const nextJsConfig = tseslint.config(baseEslintConfig, {
  extends: ['next/core-web-vitals', 'next/typescript'],
});

export default nextJsConfig;

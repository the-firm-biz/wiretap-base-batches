import tseslint from 'typescript-eslint';
import baseEslintConfig from './base-config.js';

const nodePackagesConfig = tseslint.config(tseslint.configs.strict, { extends: baseEslintConfig });

export default nodePackagesConfig;

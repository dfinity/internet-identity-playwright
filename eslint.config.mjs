import {default as config} from '@dfinity/eslint-config-oisy-wallet';

export default [
  ...config,
  {
    ignores: ['**/dist']
  }
];

import juno from '@junobuild/vite-plugin';
import {defineConfig} from 'vite';
import {nodePolyfills} from 'vite-plugin-node-polyfills';

/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [nodePolyfills(), juno({container: true})]
});

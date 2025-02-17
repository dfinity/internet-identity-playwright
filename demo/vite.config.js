import juno from '@junobuild/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import {defineConfig} from 'vite';

/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [juno({container: true}), tailwindcss()]
});

import esbuild from 'esbuild';
import {existsSync, mkdirSync, readFileSync} from 'node:fs';
import {join} from 'node:path';

const dist = join(process.cwd(), 'dist');

if (!existsSync(dist)) {
  mkdirSync(dist);
}

// Skip peer dependencies
const peerDependencies = (packageJson) => {
  const json = readFileSync(packageJson, 'utf8');
  const {peerDependencies} = JSON.parse(json);
  return peerDependencies ?? {};
};

const libPeerDependencies = peerDependencies(join(process.cwd(), 'package.json'));

await esbuild.build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  minify: true,
  format: 'esm',
  platform: 'node',
  external: [...Object.keys(libPeerDependencies)]
});

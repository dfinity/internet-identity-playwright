import {defineConfig} from '@junobuild/config';

/** @type {import('@junobuild/config').JunoConfig} */
export default defineConfig({
  satellite: {
    ids: {
      development: 'jx5yt-yyaaa-aaaal-abzbq-cai',
      production: '<PROD_SATELLITE_ID>'
    },
    source: 'build',
    predeploy: ['npm run build'],
    collections: {
      datastore: [
        {
          collection: 'notes',
          read: 'managed',
          write: 'managed',
          memory: 'stable'
        }
      ],
      storage: [
        {
          collection: 'images',
          read: 'managed',
          write: 'managed',
          memory: 'stable'
        }
      ]
    }
  },
  emulator: {
    runner: {
      type: 'docker'
    },
    satellite: {}
  }
});

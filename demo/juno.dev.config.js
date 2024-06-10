import {defineDevConfig} from '@junobuild/config';

/** @type {import('@junobuild/config').JunoDevConfig} */
export default defineDevConfig(() => ({
  satellite: {
    collections: {
      db: [
        {
          collection: 'notes',
          read: 'managed',
          write: 'managed',
          memory: 'stable',
          mutablePermissions: true
        }
      ],
      storage: [
        {
          collection: 'images',
          read: 'managed',
          write: 'managed',
          memory: 'stable',
          mutablePermissions: true
        }
      ]
    }
  }
}));

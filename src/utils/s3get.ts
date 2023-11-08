import {createSyncFn} from 'synckit';

export function s3Get(url: string): string {
  const syncFn = createSyncFn(require.resolve('./s3getworker.js'), {
    timeout: 30000,
  });

  return syncFn(url);
}

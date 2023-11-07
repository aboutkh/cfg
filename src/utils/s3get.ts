import {createSyncFn} from 'synckit';

export function s3Get(url: string): string {
  const syncFn = createSyncFn(require.resolve('./s3getworker.js'), {
    timeout: 5000,
  });

  return syncFn(url);
}

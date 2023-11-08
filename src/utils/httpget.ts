import {createSyncFn} from 'synckit';

export function httpGet(url: string): string {
  const syncFn = createSyncFn(require.resolve('./httpgetworker.js'), {
    timeout: 30000,
  });

  return syncFn(url);
}

const fetch = require('node-fetch');
const {runAsWorker} = require('synckit');

runAsWorker(async (...args) => {
  if (args.length === 0) {
    throw new Error('url is not provided');
  }
  const url = args[0];
  if (typeof url !== 'string') {
    throw new Error('url must be a string');
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Response status ${response.status}`);
  }
  const data = await response.text();
  return data;
});

const {S3} = require('@aws-sdk/client-s3');
const {runAsWorker} = require('synckit');

const client = new S3();

function parseS3Url(s3Url) {
  const parts = s3Url.replace('s3://', '').split('/');
  const bucketName = parts[0];
  const objectKey = parts.slice(1).join('/');

  return {bucketName, objectKey};
}

runAsWorker(async (...args) => {
  if (args.length === 0) {
    throw new Error('url is not provided');
  }
  const url = args[0];
  if (typeof url !== 'string') {
    throw new Error('url must be a string');
  }
  try {
    const {bucketName, objectKey} = parseS3Url(url);
    const response = await client.getObject({
      Bucket: bucketName,
      Key: objectKey,
    });

    return response.Body.transformToString('utf-8');
  } catch (err) {
    throw new Error(`get file ${url} error: ${err}`);
  }
});

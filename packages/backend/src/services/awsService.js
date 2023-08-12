const config = require('config');
const fs = require('fs');
const AWS = require('aws-sdk');
const uuid = require('uuid').v4;

const {
  region, endpoint, imageBucket, videoBucket,
} = config.yos;

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.YOS_ACCESS_KEY_ID,
  secretAccessKey: process.env.YOS_SECRET_ACCESS_KEY,
  region,
  endpoint,
});
const s3 = new AWS.S3();

const upload = async (file) => {
  if (!file) return Promise.reject(new Error('Bad file'));
  const params = {
    Bucket: imageBucket,
    Key: file.filename,
    Body: fs.createReadStream(file.path),
  };

  const response = await s3.upload(params).promise();

  console.log(response);

  return response.Location;
};

const getPreSignedUrl = async (userId) => {
  try {
    const videoKey = `users/${userId}/videos/${uuid()}.mp4`;
    const MINUTES_15 = 900;

    const params = {
      Bucket: videoBucket,
      Key: videoKey,
      Expires: MINUTES_15,
      ContentType: 'video/mp4',
      ACL: 'public-read',
    };

    // Get pre-signed URL
    const preSignedUrl = s3.getSignedUrl('putObject', params);

    return {
      preSignedUrl,
      videoKey,
    };
  } catch (err) {
    console.error('Error generating pre-signed URL:', err);
    return Promise.reject(new Error('Failed to generate pre-signed URL'));
  }
};

const videoExistsInS3 = async (videoKey) => {
  try {
    const s3Params = {
      Bucket: videoBucket,
      Key: videoKey,
    };
    const headObject = await s3.headObject(s3Params).promise();
    return !!(headObject && headObject.ContentLength);
  } catch (err) {
    if (err.code === 'NotFound') {
      return false;
    }
    throw err; // rethrow other unexpected errors
  }
};

module.exports = {
  upload,
  getPreSignedUrl,
  videoExistsInS3,
};

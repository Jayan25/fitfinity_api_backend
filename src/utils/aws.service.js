const AWS = require('aws-sdk');

async function generateSignedUploadUrl(payload) {
  let { bucketName, expiresIn, key } = payload;
  AWS.config.update({
      accessKeyId:  process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
      region: process.env.REGION,
  });
 
  const s3 = new AWS.S3();
 
  const params = {
      Bucket: bucketName,
      Key: key,
      Expires: expiresIn,
      ContentType: 'image/jpg',
  };
 
  try {
    const url = await s3.getSignedUrlPromise('putObject', params);
    return url;
  } catch (error) {
    throw new Error(`Error generating signed URL: ${error.message}`);
  }
}

async function generateOrderSignedUploadUrl(payload) {
    try {
      let { bucketName, expiresIn, key } = payload;
 
      const uploadUrl = await generateSignedUploadUrl({ bucketName, expiresIn: +expiresIn, key });
 
      return {
        statusCode: 200,
        message: 'Pre-signed upload URL generated successfully.',
        response: { url: uploadUrl },
      };
 
    } catch (error) {
      throw new NotFoundException("Error generating pre-signed URL:', error")
    }
  }
 
 

  module.exports = { generateSignedUploadUrl, generateOrderSignedUploadUrl };
const AWS = require('aws-sdk');

export async function generateSignedUploadUrl(payload) {
  let { bucketName, expiresIn, key } = payload;
  AWS.config.update({
      accessKeyId: 'AKIAW3MED4D62TMUNEWN',
      secretAccessKey: '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',
      // region: process.env.AWS_REGION,
  });
 
  const s3 = new AWS.S3();
 
  const params = {
      Bucket: bucketName,
      Key: key,
      Expires: expiresIn,
      ContentType: 'image/jpg',
  };
 
  return new Promise((resolve, reject) => {
      s3.getSignedUrl('putObject', params, (err, url) => {
          if (err) {
              return reject(err);
          }
          resolve(url);
      });
  });
}


export async function generateOrderSignedUploadUrl(payload) {
    try {
      let { bucketName, expiresIn, key } = payload;
 
      const uploadUrl = await generateSignedUploadUrl({ bucketName, expiresIn: +expiresIn, key });
 
      return {
        statusCode: HttpStatusCode.Ok,
        message: 'driver Pre-Signed SignUp URL created',
        response: { url: uploadUrl },
      };
 
    } catch (error) {
      throw new NotFoundException("Error generating pre-signed URL:', error")
    }
  }
 
 
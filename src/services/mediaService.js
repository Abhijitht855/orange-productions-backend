const ImageKit = require("imagekit");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const uploadFile = (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    imagekit.upload(
      { file: fileBuffer, fileName },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.url);
      }
    );
  });
};

module.exports = { uploadFile };

import { v2 as cloudinary } from 'cloudinary';

const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
};

if (!config.cloud_name || !config.api_key || !config.api_secret) {
    console.warn("⚠️ Cloudinary config is missing environment variables. Uploads will fail.");
    console.warn("Details:", {
        hasCloudName: !!config.cloud_name,
        hasApiKey: !!config.api_key,
        hasApiSecret: !!config.api_secret
    });
}

cloudinary.config(config);

export default cloudinary;

export async function uploadToCloudinary(fileBuffer, options = {}) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'parsomen',
                ...options,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        // Write buffer to stream
        const bufferStream = require('stream').Readable.from(fileBuffer);
        bufferStream.pipe(uploadStream);
    });
}

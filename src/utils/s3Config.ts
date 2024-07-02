export const s3Config = {
        bucketName: 'arcadia-bucket',
        dirName: "" || "",
        region: 'eu-west-3',
        accessKeyId: import.meta.env.VITE_ACCESS_KEY_ID || "",
        secretAccessKey: import.meta.env.VITE_SECRET_ACCESS_KEY || "",
    };

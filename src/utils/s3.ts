import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const ACCESS_KEY_ID = import.meta.env.VITE_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = import.meta.env.VITE_SECRET_ACCESS_KEY;
const s3 = new S3Client({ region: "eu-west-3", credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY }});
const BUCKET = "arcadia-bucket";

export const uploadToS3 = async (file: File, key: string) => {
    const command = new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: file, ContentType: file.type });

    try {
        await s3.send(command);
    } catch (error) {
        console.error("Error uploading file: ", error);
    }
}
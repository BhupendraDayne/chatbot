import ImageKit from "imagekit";   // ← fixed casing
import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "IMAGEKIT_PUBLIC_KEY",
  "IMAGEKIT_PRIVATE_KEY",
  "IMAGEKIT_URL_ENDPOINT",
];

const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `ImageKit config error: Missing environment variables -> ${missing.join(", ")}`
  );
}

const imagekit = new ImageKit({   // ← consistent with import
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export default imagekit;
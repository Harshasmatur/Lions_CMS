import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { env } from "../../config/env";
import { AppError } from "../../common/errors";

const uploadRoot = path.resolve(process.cwd(), env.uploadDir);
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
]);

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadRoot);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: env.maxUploadSizeMb * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(AppError.badRequest(`Unsupported file type: ${file.mimetype}`) as unknown as null);
      return;
    }
    cb(null, true);
  },
}).single("file");

export function publicUrlForUpload(filename: string): string {
  return `${env.apiPublicUrl}/uploads/${filename}`;
}

export function absoluteUploadPath(filename: string): string {
  return path.join(uploadRoot, filename);
}

export { uploadRoot };

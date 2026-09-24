import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  port: parseInt(process.env.PORT || "4000", 10),

  databaseUrl: required("DATABASE_URL"),

  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",

  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),

  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  uploadDir: process.env.UPLOAD_DIR || "uploads",
  maxUploadSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB || "10", 10),

  apiPublicUrl: process.env.API_PUBLIC_URL || "http://localhost:4000",
};

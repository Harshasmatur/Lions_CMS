import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { corsMiddleware } from "./config/cors";
import { requestId } from "./middleware/request-id.middleware";
import { apiLimiter } from "./middleware/rate-limit.middleware";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware";
import { env } from "./config/env";
import apiRouter from "./routes";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(requestId);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(corsMiddleware);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.isProduction ? "combined" : "dev"));
app.use(apiLimiter);

// Serve uploaded media files.
app.use("/uploads", express.static(path.resolve(process.cwd(), env.uploadDir)));

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

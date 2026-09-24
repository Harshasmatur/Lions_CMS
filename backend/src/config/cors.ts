import cors, { CorsOptions } from "cors";
import { env } from "./env";

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients (no Origin header) and whitelisted origins.
    if (!origin || env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);

import rateLimit from "express-rate-limit";

// General API limiter.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for the login endpoint to slow down brute-force attempts.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "TOO_MANY_ATTEMPTS", message: "Too many login attempts. Try again later." },
  },
});

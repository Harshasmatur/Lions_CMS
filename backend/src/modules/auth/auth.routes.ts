import { Router } from "express";
import { loginHandler, meHandler, changePasswordHandler } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { loginSchema, changePasswordSchema } from "./auth.validation";
import { requireAuth } from "../../middleware/auth.middleware";
import { loginLimiter } from "../../middleware/rate-limit.middleware";

const router = Router();

router.post("/login", loginLimiter, validate({ body: loginSchema }), loginHandler);
router.get("/me", requireAuth, meHandler);
router.post(
  "/change-password",
  requireAuth,
  validate({ body: changePasswordSchema }),
  changePasswordHandler
);

export default router;

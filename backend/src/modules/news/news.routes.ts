import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  listNewsHandler,
  publicListNewsHandler,
  getNewsHandler,
  publicGetNewsBySlugHandler,
  createNewsHandler,
  updateNewsHandler,
  changeNewsStatusHandler,
  deleteNewsHandler,
} from "./news.controller";
import {
  createNewsSchema,
  updateNewsSchema,
  changeStatusSchema,
  listNewsQuerySchema,
  publicListNewsQuerySchema,
  idParamSchema,
  slugParamSchema,
} from "./news.validation";

// --- Admin (authenticated) routes ---
const adminRouter = Router();
adminRouter.use(requireAuth);

adminRouter.get("/", validate({ query: listNewsQuerySchema }), listNewsHandler);
adminRouter.get("/:id", validate({ params: idParamSchema }), getNewsHandler);
adminRouter.post("/", validate({ body: createNewsSchema }), createNewsHandler);
adminRouter.put("/:id", validate({ params: idParamSchema, body: updateNewsSchema }), updateNewsHandler);
adminRouter.patch(
  "/:id/status",
  validate({ params: idParamSchema, body: changeStatusSchema }),
  changeNewsStatusHandler
);
adminRouter.delete("/:id", validate({ params: idParamSchema }), deleteNewsHandler);

// --- Public (unauthenticated) routes ---
const publicRouter = Router();
publicRouter.get("/", validate({ query: publicListNewsQuerySchema }), publicListNewsHandler);
publicRouter.get("/:slug", validate({ params: slugParamSchema }), publicGetNewsBySlugHandler);

export { adminRouter as newsAdminRouter, publicRouter as newsPublicRouter };

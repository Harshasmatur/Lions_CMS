import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import { newsAdminRouter, newsPublicRouter } from "../modules/news/news.routes";
import { eventsAdminRouter, eventsPublicRouter } from "../modules/events/events.routes";
import mediaRoutes from "../modules/media/media.routes";

const router = Router();

router.get("/health", (_req, res) => res.json({ success: true, status: "ok" }));

// Admin (JWT-protected) API — used by the CMS frontend.
router.use("/auth", authRoutes);
router.use("/news", newsAdminRouter);
router.use("/events", eventsAdminRouter);
router.use("/media", mediaRoutes);

// Public (unauthenticated) API — used by the existing Lions website to
// pull published news/events without exposing drafts or admin data.
router.use("/public/news", newsPublicRouter);
router.use("/public/events", eventsPublicRouter);

export default router;

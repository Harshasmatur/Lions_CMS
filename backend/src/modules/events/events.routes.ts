import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  listEventsHandler,
  publicListEventsHandler,
  getEventHandler,
  publicGetEventBySlugHandler,
  createEventHandler,
  updateEventHandler,
  changeEventStatusHandler,
  deleteEventHandler,
} from "./events.controller";
import {
  createEventSchema,
  updateEventSchema,
  changeStatusSchema,
  listEventsQuerySchema,
  publicListEventsQuerySchema,
  idParamSchema,
  slugParamSchema,
} from "./events.validation";

const adminRouter = Router();
adminRouter.use(requireAuth);

adminRouter.get("/", validate({ query: listEventsQuerySchema }), listEventsHandler);
adminRouter.get("/:id", validate({ params: idParamSchema }), getEventHandler);
adminRouter.post("/", validate({ body: createEventSchema }), createEventHandler);
adminRouter.put("/:id", validate({ params: idParamSchema, body: updateEventSchema }), updateEventHandler);
adminRouter.patch(
  "/:id/status",
  validate({ params: idParamSchema, body: changeStatusSchema }),
  changeEventStatusHandler
);
adminRouter.delete("/:id", validate({ params: idParamSchema }), deleteEventHandler);

const publicRouter = Router();
publicRouter.get("/", validate({ query: publicListEventsQuerySchema }), publicListEventsHandler);
publicRouter.get("/:slug", validate({ params: slugParamSchema }), publicGetEventBySlugHandler);

export { adminRouter as eventsAdminRouter, publicRouter as eventsPublicRouter };

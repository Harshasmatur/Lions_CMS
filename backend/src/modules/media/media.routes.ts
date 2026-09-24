import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  uploadMediaHandler,
  addExternalMediaHandler,
  listMediaHandler,
  deleteMediaHandler,
  reorderMediaHandler,
} from "./media.controller";
import {
  addExternalMediaSchema,
  reorderMediaSchema,
  mediaIdParamSchema,
} from "./media.validation";
import { z } from "zod";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  validate({
    query: z.object({
      entityType: z.enum(["NEWS", "EVENT"]),
      entityId: z.coerce.number().int().positive(),
    }),
  }),
  listMediaHandler
);

// multipart/form-data — body validated inside the handler after multer parses it.
router.post("/upload", uploadMediaHandler);

router.post("/external", validate({ body: addExternalMediaSchema }), addExternalMediaHandler);

router.patch("/reorder", validate({ body: reorderMediaSchema }), reorderMediaHandler);

router.delete("/:id", validate({ params: mediaIdParamSchema }), deleteMediaHandler);

export default router;

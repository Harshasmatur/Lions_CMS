import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { sendSuccess } from "../../common/responses/ApiResponse";
import { AppError } from "../../common/errors";
import * as mediaService from "./media.service";
import { uploadMiddleware } from "./media.upload";

export const uploadMediaHandler = asyncHandler(async (req: Request, res: Response) => {
  await new Promise<void>((resolve, reject) => {
    uploadMiddleware(req, res, (err) => (err ? reject(err) : resolve()));
  });

  if (!req.file) throw AppError.badRequest("No file was uploaded (expected field 'file')");
  const { entityType, entityId, altText } = req.body;

  const media = await mediaService.addUploadedMedia(req.user!.id, {
    entityType,
    entityId: Number(entityId),
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    altText,
  });

  sendSuccess(res, media, 201);
});

export const addExternalMediaHandler = asyncHandler(async (req: Request, res: Response) => {
  const media = await mediaService.addExternalMedia(req.user!.id, req.body);
  sendSuccess(res, media, 201);
});

export const listMediaHandler = asyncHandler(async (req: Request, res: Response) => {
  const { entityType, entityId } = req.query as unknown as { entityType: "NEWS" | "EVENT"; entityId: number };
  const media = await mediaService.listMedia(entityType, Number(entityId));
  sendSuccess(res, media);
});

export const deleteMediaHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  await mediaService.deleteMedia(req.user!.id, Number(id));
  sendSuccess(res, { message: "Media deleted" });
});

export const reorderMediaHandler = asyncHandler(async (req: Request, res: Response) => {
  await mediaService.reorderMedia(req.user!.id, req.body);
  sendSuccess(res, { message: "Media reordered" });
});

import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { sendSuccess } from "../../common/responses/ApiResponse";
import { buildMeta } from "../../common/utils/pagination";
import * as eventsService from "./events.service";

export const listEventsHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as {
    page: number;
    pageSize: number;
    status?: any;
    search?: string;
  };
  const { items, total } = await eventsService.listEvents(query);
  sendSuccess(res, items, 200, buildMeta(total, query.page, query.pageSize));
});

export const publicListEventsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, pageSize, upcomingOnly } = req.query as unknown as {
    page: number;
    pageSize: number;
    upcomingOnly: boolean;
  };
  const { items, total } = await eventsService.listPublishedEvents(page, pageSize, upcomingOnly);
  sendSuccess(res, items, 200, buildMeta(total, page, pageSize));
});

export const getEventHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const event = await eventsService.getEventById(Number(id));
  sendSuccess(res, event);
});

export const publicGetEventBySlugHandler = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const event = await eventsService.getPublishedEventBySlug(slug);
  sendSuccess(res, event);
});

export const createEventHandler = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventsService.createEvent(req.user!.id, req.body);
  sendSuccess(res, event, 201);
});

export const updateEventHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const event = await eventsService.updateEvent(req.user!.id, Number(id), req.body);
  sendSuccess(res, event);
});

export const changeEventStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const event = await eventsService.changeEventStatus(req.user!.id, Number(id), req.body.status);
  sendSuccess(res, event);
});

export const deleteEventHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  await eventsService.deleteEvent(req.user!.id, Number(id));
  sendSuccess(res, { message: "Event deleted" });
});

import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { sendSuccess } from "../../common/responses/ApiResponse";
import { buildMeta } from "../../common/utils/pagination";
import * as newsService from "./news.service";

export const listNewsHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as {
    page: number;
    pageSize: number;
    status?: any;
    search?: string;
  };
  const { items, total } = await newsService.listNews(query);
  sendSuccess(res, items, 200, buildMeta(total, query.page, query.pageSize));
});

export const publicListNewsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { page, pageSize } = req.query as unknown as { page: number; pageSize: number };
  const { items, total } = await newsService.listPublishedNews(page, pageSize);
  sendSuccess(res, items, 200, buildMeta(total, page, pageSize));
});

export const getNewsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const news = await newsService.getNewsById(Number(id));
  sendSuccess(res, news);
});

export const publicGetNewsBySlugHandler = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const news = await newsService.getPublishedNewsBySlug(slug);
  sendSuccess(res, news);
});

export const createNewsHandler = asyncHandler(async (req: Request, res: Response) => {
  const news = await newsService.createNews(req.user!.id, req.body);
  sendSuccess(res, news, 201);
});

export const updateNewsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const news = await newsService.updateNews(req.user!.id, Number(id), req.body);
  sendSuccess(res, news);
});

export const changeNewsStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const news = await newsService.changeNewsStatus(req.user!.id, Number(id), req.body.status);
  sendSuccess(res, news);
});

export const deleteNewsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  await newsService.deleteNews(req.user!.id, Number(id));
  sendSuccess(res, { message: "News article deleted" });
});

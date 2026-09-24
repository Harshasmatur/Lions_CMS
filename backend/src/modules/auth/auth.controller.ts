import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { sendSuccess } from "../../common/responses/ApiResponse";
import * as authService from "./auth.service";
import { AppError } from "../../common/errors";

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  sendSuccess(res, result);
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  const user = await authService.getCurrentUser(req.user.id);
  sendSuccess(res, user);
});

export const changePasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);
  sendSuccess(res, { message: "Password updated" });
});

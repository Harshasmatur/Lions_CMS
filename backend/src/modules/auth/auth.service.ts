import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../common/errors";
import { logAudit } from "../../common/services/audit.service";
import { AUDIT_ACTIONS, ENTITY_TYPES } from "../../common/constants";

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as jwt.SignOptions
  );

  await logAudit({
    userId: user.id,
    action: AUDIT_ACTIONS.LOGIN,
    entityType: ENTITY_TYPES.USER,
    entityId: user.id,
  });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function getCurrentUser(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });
  if (!user) throw AppError.notFound("User not found");
  return user;
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound("User not found");

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) throw AppError.badRequest("Current password is incorrect");

  const passwordHash = await bcrypt.hash(newPassword, env.bcryptSaltRounds);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

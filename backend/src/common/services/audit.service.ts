import { prisma } from "../../config/database";

interface LogAuditParams {
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  metadata?: Record<string, unknown>;
}

// Fire-and-forget style audit logging used by every module that mutates content.
// Failures here are logged but never block the primary operation's response.
export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata as any,
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to write audit log:", err);
  }
}

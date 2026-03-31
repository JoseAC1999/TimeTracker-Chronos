import { Prisma, type AuditAction, type AuditEntity } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/observability/logger";

type AuditPayload = {
  workspaceId: string;
  userId?: string | null;
  entity: AuditEntity;
  entityId: string;
  action: AuditAction;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  context?: Prisma.InputJsonValue;
};

export async function logAuditEvent(payload: AuditPayload) {
  try {
    await prisma.auditLog.create({
      data: {
        workspaceId: payload.workspaceId,
        userId: payload.userId ?? null,
        entity: payload.entity,
        entityId: payload.entityId,
        action: payload.action,
        before: payload.before,
        after: payload.after,
        context: payload.context,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return;
    }

    logger.warn({
      event: "audit.write.failure",
      message: error instanceof Error ? error.message : "No se pudo escribir evento de auditoría",
      context: {
        workspaceId: payload.workspaceId,
        userId: payload.userId ?? null,
        entity: payload.entity,
        entityId: payload.entityId,
        action: payload.action,
      },
    });
  }
}

"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { captureError } from "@/lib/observability/capture";
import { logger } from "@/lib/observability/logger";
import { incrementMetric } from "@/lib/observability/metrics";
import { consumeRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { registerSchema } from "@/lib/validations/auth";

function slugifyWorkspace(name: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function registerUser(_: { error?: string } | undefined, formData: FormData) {
  try {
    const requestHeaders = await headers();
    const ip = getClientIp(requestHeaders);
    const rate = await consumeRateLimit(`register:${ip}`, {
      limit: 4,
      windowMs: 30 * 60 * 1000,
      blockMs: 60 * 60 * 1000,
    });

    if (!rate.allowed) {
      incrementMetric("auth.register.rate_limited");
      logger.warn({
        event: "auth.register.rate_limited",
        message: "Register blocked by rate limiter",
        context: { ip, retryAfterSec: rate.retryAfterSec },
      });
      return { error: `Demasiados intentos de registro. Inténtalo de nuevo en ${rate.retryAfterSec} segundos.` };
    }

    const raw = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? "").toLowerCase(),
      password: String(formData.get("password") ?? ""),
    };

    const data = registerSchema.parse(raw);
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { error: "Ya existe una cuenta con ese correo." };
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
      },
    });

    const workspace = await prisma.workspace.create({
      data: {
        name: `TimeTracker Chronos de ${data.name.split(" ")[0]}`,
        slug: slugifyWorkspace(data.name),
        ownerId: user.id,
        users: {
          connect: { id: user.id },
        },
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { workspaceId: workspace.id },
    });

    await prisma.userSetting.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
      },
    });
    incrementMetric("auth.register.success");
    logger.info({
      event: "auth.register.success",
      message: "User registered successfully",
      context: { userId: user.id, email: data.email, workspaceId: workspace.id, ip },
    });
  } catch (error) {
    captureError(error, "auth.register.failure");
    if (error instanceof Error && error.message.includes("[")) {
      return { error: "Revisa los campos del formulario." };
    }

    return { error: error instanceof Error ? error.message : "No se pudo crear la cuenta." };
  }

  redirect("/login?registered=1");
}

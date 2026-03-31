import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { logAuditEvent } from "@/lib/audit/audit-service";
import { prisma } from "@/lib/db/prisma";
import { getAppUrl, getAuthSecret } from "@/lib/env";
import { logger } from "@/lib/observability/logger";
import { incrementMetric } from "@/lib/observability/metrics";
import { consumeRateLimit, getClientIp, resetRateLimit } from "@/lib/security/rate-limit";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: getAuthSecret(),
  debug: false,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  pages: {
    signIn: "/login",
  },
  useSecureCookies: getAppUrl().startsWith("https://"),
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Credenciales inválidas");
        }

        const email = credentials.email.toLowerCase();
        const ip = getClientIp(req.headers);
        const rateKey = `login:${ip}:${email}`;
        const rate = await consumeRateLimit(rateKey, {
          limit: 5,
          windowMs: 10 * 60 * 1000,
          blockMs: 15 * 60 * 1000,
        });

        if (!rate.allowed) {
          incrementMetric("auth.login.rate_limited");
          logger.warn({
            event: "auth.login.rate_limited",
            message: "Login blocked by rate limiter",
            context: { email, ip, retryAfterSec: rate.retryAfterSec },
          });
          throw new Error(`Demasiados intentos. Vuelve a probar en ${rate.retryAfterSec} s.`);
        }

        const user = await prisma.user.findUnique({
          where: { email: email },
        });

        if (!user) {
          incrementMetric("auth.login.invalid_user");
          throw new Error("Credenciales inválidas");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          incrementMetric("auth.login.invalid_password");
          throw new Error("Credenciales inválidas");
        }

        await resetRateLimit(rateKey);
        incrementMetric("auth.login.success");
        logger.info({
          event: "auth.login.success",
          message: "User logged in successfully",
          context: { userId: user.id, email, ip },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.email = token.email;
        session.user.name = token.name;
      }

      return session;
    },
  },
  events: {
    async signIn({ user }) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { workspaceId: true },
      });

      if (!dbUser?.workspaceId) return;

      await logAuditEvent({
        workspaceId: dbUser.workspaceId,
        userId: user.id,
        entity: "AUTH_SESSION",
        entityId: user.id,
        action: "CREATE",
        after: {
          event: "sign_in",
          email: user.email ?? null,
        },
      });
    },
  },
};

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function getServerAuthSession() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      settings: true,
      workspace: true,
    },
  });

  if (!user || !user.workspaceId) {
    redirect("/login");
  }

  return user;
}

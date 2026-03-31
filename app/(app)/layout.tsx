import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const activeEntry = await prisma.timeEntry.findFirst({
    where: { workspaceId: user.workspaceId!, userId: user.id, isRunning: true },
    include: { project: true, task: true },
    orderBy: { startedAt: "desc" },
  });

  return <AppShell user={user} activeEntry={activeEntry}>{children}</AppShell>;
}

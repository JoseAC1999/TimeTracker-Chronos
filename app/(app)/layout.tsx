import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/session";
import { getActiveEntry } from "@/services/time-entries/time-entry-service";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const activeEntry = await getActiveEntry(user.workspaceId!, user.id);

  return <AppShell user={user} activeEntry={activeEntry}>{children}</AppShell>;
}

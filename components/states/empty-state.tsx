import Link from "next/link";
import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="border-dashed bg-gradient-to-br from-white via-white to-teal-50/40">
      <CardContent className="flex flex-col items-start gap-4 p-8">
        <div className="inline-flex size-14 items-center justify-center rounded-3xl bg-teal-500/10 text-teal-700">
          <Inbox className="size-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
        </div>
        {actionLabel && actionHref ? (
          <Button asChild variant="secondary">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : actionLabel && onAction ? (
          <Button variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

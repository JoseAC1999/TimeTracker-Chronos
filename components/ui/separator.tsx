import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils/cn";

export function Separator({ className, ...props }: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return <SeparatorPrimitive.Root className={cn("h-px w-full bg-slate-200", className)} {...props} />;
}

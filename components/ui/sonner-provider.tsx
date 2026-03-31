"use client";

import { Toaster } from "sonner";

export function SonnerProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "!rounded-3xl !border !border-slate-200 !bg-white !text-slate-950 !shadow-xl",
          description: "!text-slate-500",
        },
      }}
    />
  );
}

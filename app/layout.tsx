import type { Metadata } from "next";
import "./globals.css";
import { SonnerProvider } from "@/components/ui/sonner-provider";

export const metadata: Metadata = {
  title: "TimeTracker Chronos",
  description: "TimeTracker Chronos te ayuda a controlar tiempo por proyecto, tarea y sesión con una interfaz clara y segura.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.14),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef6f6_100%)] text-slate-900">
        {children}
        <SonnerProvider />
      </body>
    </html>
  );
}

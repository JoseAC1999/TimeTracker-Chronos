"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/states/error-state";

export default function Error({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        event: "app.route_error",
        message: error.message,
        digest: error.digest,
      }),
    );
  }, [error]);

  return <ErrorState title="Algo salió mal" description={error.message || "Ha ocurrido un error inesperado al cargar esta vista."} />;
}

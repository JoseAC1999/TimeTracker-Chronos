import { Card, CardContent } from "@/components/ui/card";

export function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-rose-100 bg-rose-50/70">
      <CardContent className="p-6">
        <h3 className="font-semibold text-rose-900">{title}</h3>
        <p className="mt-2 text-sm text-rose-700">{description}</p>
      </CardContent>
    </Card>
  );
}

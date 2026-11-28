// app/(main)/cancellation/page.tsx
import CancellationHero from "@/components/cancellation/CancellationHero";
import CancellationGuideSections from "@/components/cancellation/CancellationGuideSections";

export default function CancellationPage() {
  return (
    <main className="min-h-screen bg-gray-50/60 dark:bg-gray-950">
      <CancellationHero />
      <CancellationGuideSections />
    </main>
  );
}
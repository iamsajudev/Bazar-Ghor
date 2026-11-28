// app/(main)/pre-order/page.tsx
import PreOrderHero from "@/components/pre-order/PreOrderHero";
import PreOrderGuideSections from "@/components/pre-order/PreOrderGuideSections";

export default function PreOrderPage() {
    return (
        <main className="min-h-screen bg-gray-50/60 dark:bg-gray-950">
            <PreOrderHero />
            <PreOrderGuideSections />
        </main>
    );
}
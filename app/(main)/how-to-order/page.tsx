// app/(main)/how-to-order/page.tsx
import HowToOrderHero from "@/components/how-to-order/HowToOrderHero";
import HowToOrderSections from "@/components/how-to-order/HowToOrderSections";

export default function HowToOrderPage() {
    return (
        <main className="min-h-screen bg-gray-50/60 dark:bg-gray-950">
            <HowToOrderHero />
            <HowToOrderSections />
        </main>
    );
}
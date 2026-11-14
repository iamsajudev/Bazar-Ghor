import { CartDrawer } from "@/components/Products/CartDrawer";
import { Footer } from "@/components/shared/Footer/Footer";
import { Header } from "@/components/shared/Header/Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <CartDrawer />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
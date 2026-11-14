import { TopFooter } from "./TopFooter";
import { PaymentPartners } from "./PaymentPartners";
import { BottomFooter } from "./BottomFooter";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-green-100 to-green-50 dark:from-gray-900 dark:to-gray-950 border-t border-green-200 dark:border-gray-800 w-full">
      <div className="container mx-auto px-4">
        <TopFooter />
        <PaymentPartners />
        <BottomFooter />
      </div>
    </footer>
  );
};
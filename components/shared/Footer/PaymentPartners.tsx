export const PaymentPartners = () => {
  return (
    <div className="border-t border-gray-200 dark:border-gray-800 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span className="font-semibold text-gray-800 dark:text-gray-200">Pay With</span>
        {/* পেমেন্ট আইকনের প্লেসহোল্ডার (পরে আসল ইমেজ বসাবেন) */}
        <div className="flex gap-1.5 flex-wrap">
            <div className="h-6 w-10 bg-white border border-gray-200 rounded flex items-center justify-center text-[8px] font-bold text-blue-800">VISA</div>
            <div className="h-6 w-10 bg-white border border-gray-200 rounded flex items-center justify-center text-[8px] font-bold text-red-500">MC</div>
            <div className="h-6 w-10 bg-white border border-gray-200 rounded flex items-center justify-center text-[8px] font-bold text-pink-600">bKash</div>
            <div className="h-6 w-10 bg-white border border-gray-200 rounded flex items-center justify-center text-[8px] font-bold text-orange-500">Nagad</div>
            <div className="h-6 w-10 bg-white border border-gray-200 rounded flex items-center justify-center text-[8px] font-bold text-blue-600">Rocket</div>
        </div>
      </div>
      
      <div className="text-sm text-gray-500">
        Verified by <span className="font-bold text-blue-800 text-base italic">SSLCommerz</span>
      </div>
    </div>
  );
};
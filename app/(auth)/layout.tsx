import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      {/* উপরে ছোট লোগো */}
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="text-3xl font-bold text-green-700 dark:text-green-500">
          Bazar<span className="text-gray-900 dark:text-white">Ghor</span>
        </span>
      </Link>
      
      {/* লগইন/রেজিস্টার ফর্মের বক্স */}
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-800">
        {children}
      </div>
    </div>
  );
}
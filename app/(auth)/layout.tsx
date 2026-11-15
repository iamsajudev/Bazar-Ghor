import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 overflow-hidden">
      <Link href="/" className="mb-8 flex items-center gap-2 z-10">
        <span className="text-3xl font-bold text-green-700 dark:text-green-500">
          Bazar<span className="text-gray-900 dark:text-white">Ghor</span>
        </span>
      </Link>
      <div className="w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
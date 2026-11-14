import Link from "next/link";

export default function LoginPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">লগইন করুন</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">মোবাইল নম্বর</label>
          <input type="text" className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white" placeholder="01XXXXXXXXX" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">পাসওয়ার্ড</label>
          <input type="password" className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white" placeholder="********" />
        </div>
        <button type="submit" className="w-full bg-green-700 text-white p-2 rounded-md hover:bg-green-800 transition-colors">লগইন</button>
      </form>
      <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
        অ্যাকাউন্ট নেই? <Link href="/register" className="text-green-600 font-bold hover:underline">রেজিস্টার করুন</Link>
      </p>
    </div>
  );
}
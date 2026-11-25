"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AccountSettingsPage() {
    const router = useRouter();
    const { logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        router.push("/");
        router.refresh();
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                Account Settings
            </h2>
            <div className="space-y-3">
                <button
                    type="button"
                    disabled
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed"
                >
                    <div className="text-left">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block">
                            Change Password
                        </span>
                        <span className="text-xs text-gray-400">
                            Use &quot;Forgot password&quot; on the login page for now
                        </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>

                <button
                    type="button"
                    disabled
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed"
                >
                    <div className="text-left">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block">
                            Manage Addresses
                        </span>
                        <span className="text-xs text-gray-400">
                            Coming soon — address is entered at checkout
                        </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer mt-4"
                >
                    <LogOut className="h-4 w-4" /> Sign Out
                </button>
            </div>
        </div>
    );
}
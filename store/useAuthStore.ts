import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: "customer" | "admin";
}

interface AuthStore {
    user: User | null;
    isAuthenticated: boolean;
    isHydrated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
    setHydrated: () => void;
}

// ডেমো ইউজার (লগইন টেস্ট করার জন্য)
const DEMO_USER: User = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+8801700000000",
    role: "customer",
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isHydrated: false,

            login: async (email, password) => {
                // ডেমো লগইন (পরে API-তে কানেক্ট করবেন)
                await new Promise((r) => setTimeout(r, 800));
                if (email === "john@example.com" && password === "123456") {
                    set({ user: DEMO_USER, isAuthenticated: true });
                    return { success: true, message: "Login successful!" };
                }
                return { success: false, message: "Invalid email or password" };
            },

            register: async (name, email, password) => {
                await new Promise((r) => setTimeout(r, 800));
                const newUser: User = {
                    id: Date.now(),
                    name,
                    email,
                    role: "customer",
                };
                set({ user: newUser, isAuthenticated: true });
                return { success: true, message: "Registration successful!" };
            },

            logout: () => set({ user: null, isAuthenticated: false }),

            setHydrated: () => set({ isHydrated: true }),
        }),
        {
            name: "auth-storage",
            onRehydrateStorage: () => (state) => {
                state?.setHydrated();
            },
        }
    )
);
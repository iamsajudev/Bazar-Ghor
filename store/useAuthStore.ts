import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    phone?: string;
    avatar?: string;
}

interface AuthStore {
    user: User | null;
    isAuthenticated: boolean;
    isHydrated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    register: (
        name: string,
        email: string,
        password: string,
        passwordConfirmation?: string
    ) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    validateSession: () => Promise<void>;
}

async function readMessage(res: Response, fallback: string): Promise<string> {
    try {
        const body = await res.json();
        return body?.message ?? fallback;
    } catch {
        return fallback;
    }
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isHydrated: false,

            login: async (email, password) => {
                try {
                    const res = await fetch("/api/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password }),
                    });

                    if (!res.ok) {
                        return {
                            success: false,
                            message: await readMessage(res, "Invalid email or password"),
                        };
                    }

                    const body = await res.json();
                    set({ user: body.data ?? null, isAuthenticated: Boolean(body.data) });
                    return { success: true, message: "Login successful!" };
                } catch {
                    return { success: false, message: "Network error. Please try again." };
                }
            },

            register: async (name, email, password, passwordConfirmation) => {
                try {
                    const res = await fetch("/api/auth/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name,
                            email,
                            password,
                            password_confirmation: passwordConfirmation ?? password,
                        }),
                    });

                    if (!res.ok) {
                        return {
                            success: false,
                            message: await readMessage(res, "Registration failed"),
                        };
                    }

                    const body = await res.json();
                    if (body.data) {
                        set({ user: body.data, isAuthenticated: true });
                        return { success: true, message: "Registration successful!" };
                    }
                    // অ্যাকাউন্ট তৈরি হয়েছে কিন্তু অটো-লগইন হয়নি
                    return { success: true, message: body.message ?? "Account created! Please sign in." };
                } catch {
                    return { success: false, message: "Network error. Please try again." };
                }
            },

            logout: async () => {
                try {
                    await fetch("/api/auth/logout", { method: "POST" });
                } finally {
                    set({ user: null, isAuthenticated: false });
                }
            },

            validateSession: async () => {
                if (typeof window === "undefined") return;
                try {
                    const res = await fetch("/api/auth/me", { cache: "no-store" });
                    if (res.ok) {
                        const body = await res.json();
                        set({ user: body.data ?? null, isAuthenticated: Boolean(body.data) });
                    } else if (res.status === 401) {
                        // শুধু সার্ভার নিশ্চিতভাবে reject করলেই logout
                        set({ user: null, isAuthenticated: false });
                    }
                    // 404/502/নেটওয়ার্ক এরর → সেশন অক্ষত থাকে (আসল সুরক্ষা সার্ভার গার্ডে)
                } catch {
                    // ignore
                } finally {
                    set({ isHydrated: true });
                }
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({ user: state.user }),

            // ⭐ মূল ফিক্স: rehydrate হওয়ার সাথে সাথেই isAuthenticated ঠিক করা
            // (আগে এটা false থাকত → reload-এ /login-এ পাঠিয়ে দিত)
            merge: (persistedState, currentState) => {
                const persisted = (persistedState ?? {}) as { user?: User | null };
                return {
                    ...currentState,
                    user: persisted.user ?? null,
                    isAuthenticated: Boolean(persisted.user),
                };
            },

            onRehydrateStorage: () => (state) => {
                state?.validateSession();
            },
        }
    )
);
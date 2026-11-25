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

export interface AuthActionResult {
    success: boolean;
    message: string;
}

interface AuthStore {
    user: User | null;
    isAuthenticated: boolean;
    isHydrated: boolean;
    setUser: (user: User | null) => void;
    login: (email: string, password: string) => Promise<AuthActionResult>;
    register: (
        name: string,
        email: string,
        password: string,
        passwordConfirmation?: string
    ) => Promise<AuthActionResult>;
    logout: () => Promise<void>;
    validateSession: () => Promise<void>;
}

interface ApiErrorPayload {
    message?: string;
}

interface AuthUserResponse {
    data?: User | null;
}

async function readMessage(res: Response, fallback: string): Promise<string> {
    try {
        const body = (await res.json()) as ApiErrorPayload;
        return typeof body?.message === "string" && body.message.trim()
            ? body.message
            : fallback;
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

            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: Boolean(user),
                    isHydrated: true,
                }),

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

                    const body = (await res.json()) as AuthUserResponse;
                    const nextUser = body?.data ?? null;

                    set({
                        user: nextUser,
                        isAuthenticated: Boolean(nextUser),
                        isHydrated: true,
                    });

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

                    const body = (await res.json()) as AuthUserResponse;
                    if (body?.data) {
                        set({
                            user: body.data,
                            isAuthenticated: true,
                            isHydrated: true,
                        });
                        return { success: true, message: "Registration successful!" };
                    }

                    return {
                        success: true,
                        message: await readMessage(res, "Account created! Please sign in."),
                    };
                } catch {
                    return { success: false, message: "Network error. Please try again." };
                }
            },

            logout: async () => {
                try {
                    await fetch("/api/auth/logout", { method: "POST" });
                } finally {
                    set({
                        user: null,
                        isAuthenticated: false,
                        isHydrated: true,
                    });
                }
            },

            validateSession: async () => {
                if (typeof window === "undefined") return;

                const controller = new AbortController();
                const timeoutId = window.setTimeout(() => controller.abort(), 6000);

                try {
                    const res = await fetch("/api/auth/me", {
                        cache: "no-store",
                        signal: controller.signal,
                    });

                    if (res.ok) {
                        const body = (await res.json()) as AuthUserResponse;
                        const nextUser = body?.data ?? null;
                        set({
                            user: nextUser,
                            isAuthenticated: Boolean(nextUser),
                        });
                    } else if (res.status === 401) {
                        set({
                            user: null,
                            isAuthenticated: false,
                        });
                    }
                } catch {
                    // Network/timeout/404/502 error-e existing persisted session intact thake
                } finally {
                    window.clearTimeout(timeoutId);
                    set({ isHydrated: true });
                }
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({ user: state.user }),
            merge: (persistedState, currentState) => {
                const persisted = (persistedState ?? {}) as { user?: User | null };
                return {
                    ...currentState,
                    user: persisted.user ?? null,
                    isAuthenticated: Boolean(persisted.user),
                };
            },
            onRehydrateStorage: () => (state) => {
                void state?.validateSession();
            },
        }
    )
);
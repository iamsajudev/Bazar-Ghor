// ⚠️ শুধু সার্ভারে ব্যবহার হবে (route handlers / server components)

export const AUTH_COOKIE = "bazar_auth_token";

// ✅ ৩ দিন — browser বন্ধ/খুললেও থাকবে; শুধু logout বা 401-এ মুছবে
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 3;

export const authCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
};

// কুকি মুছে ফেলার অপশন (logout / token revoked)
export const clearCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
};

export function getApiBase(): string {
    const base =
        process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
    return base.replace(/\/+$/, "");
}

export async function laravelFetch(path: string, init: RequestInit = {}) {
    return fetch(`${getApiBase()}${path}`, {
        ...init,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(init.headers ?? {}),
        },
        cache: "no-store",
    });
}

export async function extractError(res: Response): Promise<{
    message: string;
    errors?: Record<string, string[]>;
}> {
    try {
        const body = await res.json();
        if (body?.errors) {
            const first = Object.values(body.errors as Record<string, string[]>)[0]?.[0];
            return { message: first ?? body.message ?? "Validation failed", errors: body.errors };
        }
        return { message: body?.message ?? `Request failed (${res.status})` };
    } catch {
        return { message: `Request failed (${res.status})` };
    }
}
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { laravelFetch, AUTH_COOKIE } from "@/lib/server/api";
import AccountOverviewClient from "@/components/Account/AccountOverviewClient";

export const instant = false;

export default async function AccountOverviewPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;

    if (!token) {
        redirect("/login?redirect=/account");
    }

    const res = await laravelFetch("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    if (!res.ok) {
        redirect("/login?redirect=/account");
    }

    return <AccountOverviewClient />;
}
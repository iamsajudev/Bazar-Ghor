import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { laravelFetch, AUTH_COOKIE } from "@/lib/server/api";
import AccountPage from "@/components/Account/AccountPage";

export const instant = false;

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;

    if (!token) redirect("/login?redirect=/account");

    const res = await laravelFetch("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) redirect("/login?redirect=/account");

    return <AccountPage />;
}
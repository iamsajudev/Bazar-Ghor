import { Suspense } from "react";
import LoginPage from "@/components/Authentication/Login/LoginPage";

export default function Page() {
    return (
        <Suspense>
            <LoginPage />
        </Suspense>
    );
}
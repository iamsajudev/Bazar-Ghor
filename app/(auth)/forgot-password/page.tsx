import ForgotPasswordPage from "@/components/Authentication/Login/ForgotPassword/ForgotPasswordPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f76b1c]"></div>
      </div>
    }>
      <ForgotPasswordPage />
    </Suspense>
  );
}



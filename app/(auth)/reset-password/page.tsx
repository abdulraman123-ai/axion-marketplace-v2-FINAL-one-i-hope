import { Suspense } from "react";
import ResetPasswordClient from "./reset-password-client";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen max-w-sm flex-1 flex-col justify-center px-6">
          <p className="text-sm text-text-secondary">Loading...</p>
        </main>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}

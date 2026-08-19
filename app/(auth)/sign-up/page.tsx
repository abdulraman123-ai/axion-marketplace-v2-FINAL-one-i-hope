import { Suspense } from "react";
import SignUpClient from "./sign-up-client";

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen max-w-sm flex-1 flex-col justify-center px-6">
          <p className="text-sm text-text-secondary">Loading...</p>
        </main>
      }
    >
      <SignUpClient />
    </Suspense>
  );
}

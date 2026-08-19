import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";

export default function CookiePolicyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-12">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-text-primary">
          Cookie Policy
        </h1>
        <p className="mt-4 text-base leading-7 text-text-secondary">
          We use cookies to improve your experience on our marketplace.
        </p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-text-secondary">
          <p>
            Cookies are small text files stored on your device. We use essential
            cookies to maintain your session and authenticate your account. We
            may also use analytics cookies to understand how our site is used.
          </p>
          <p>
            You can control cookies through your browser settings. Disabling
            essential cookies may prevent you from using certain features of our
            marketplace.
          </p>
        </div>
        <div className="mt-8">
          <Link href="/">
            <Button variant="outline">Back to home</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

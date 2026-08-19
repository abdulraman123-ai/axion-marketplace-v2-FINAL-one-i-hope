import { SiteNav } from "@/components/site-nav";
import ContactForm from "./contact-form";

export default function ContactPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-12">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-text-primary">
          Contact
        </h1>
        <p className="mt-4 text-base leading-7 text-text-secondary">
          Have a question or need help? Reach out and we&apos;ll get back to you.
        </p>
        <ContactForm />
      </main>
    </div>
  );
}

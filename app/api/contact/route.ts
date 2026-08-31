import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";
import { emailProvider } from "@/lib/email/provider";
import { contactNotificationEmail } from "@/lib/email/templates/contact-notification";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitHits = new Map<string, number[]>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const hits = rateLimitHits.get(key) ?? [];
  const recentHits = hits.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  rateLimitHits.set(key, recentHits);
  return recentHits.length < RATE_LIMIT_MAX;
}

function recordRateLimitHit(key: string): void {
  const hits = rateLimitHits.get(key) ?? [];
  hits.push(Date.now());
  rateLimitHits.set(key, hits);
}

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }
  recordRateLimitHit(clientIp);
  try {
    const body = await request.json();
    const { name, email, subject, message } = body as {
      name?: unknown;
      email?: unknown;
      subject?: unknown;
      message?: unknown;
    };

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof subject !== "string" ||
      !subject.trim() ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const supabaseUrl = getSupabaseUrl();
    const serviceRoleKey = getSupabaseServiceRoleKey();

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Server is not configured yet." },
        { status: 500 }
      );
    }

    const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

    const { error } = await serviceClient
      .from("contact_submissions")
      .insert({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

    if (error) {
      return NextResponse.json(
        { error: "Failed to submit contact form." },
        { status: 500 }
      );
    }

    try {
      const notification = contactNotificationEmail({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      await emailProvider.sendEmail(notification);
    } catch (emailError) {
      console.error("Contact notification email failed (non-fatal):", emailError);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}

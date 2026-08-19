import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getCurrentUserRoles } from "@/lib/admin";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.getUser();

  // Authoritative server-side authorization: must be an admin (role system).
  // Only an admin can add another founder email.
  const roles = await getCurrentUserRoles();
  if (!roles.includes("admin")) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Server storage is not configured yet." },
      { status: 500 }
    );
  }

  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

  const { error } = await serviceClient
    .from("founder_emails")
    .insert({ email: String(email).toLowerCase() });

  if (error) {
    // 23505 = unique_violation — this email is already a founder.
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "That email is already a founder." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
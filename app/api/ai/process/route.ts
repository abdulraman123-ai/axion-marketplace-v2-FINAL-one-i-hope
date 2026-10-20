import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      available: false,
      mode: "clientlaunch-local-workspace",
      model: null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST() {
  return NextResponse.json(
    {
      error: "ClientLaunch does not send AI requests. Use the optional copy-and-paste prompts with an AI product you already use, or work directly with the built-in templates.",
    },
    {
      status: 410,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

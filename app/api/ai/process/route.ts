import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      available: false,
      mode: "chatgpt-skill-package",
      model: null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST() {
  return NextResponse.json(
    {
      error: "VoxKit has moved to a ChatGPT workflow package. This website does not send AI requests. Download the package from the homepage.",
    },
    {
      status: 410,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

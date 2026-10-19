import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // This branch is the standalone VoxKit product preview, not the Axion shop.
  // Deny legacy marketplace/auth/admin/checkout routes inherited from Axion.
  // Allow only the product UI, its opt-in AI status/process endpoint, and assets.
  const pathname = request.nextUrl.pathname;
  const normalizedPath =
    pathname.length > 1 ? pathname.replace(/\\/+$/, "") : pathname;
  const isProductRoute =
    normalizedPath === "/" ||
    normalizedPath === "/studio" ||
    normalizedPath === "/api/ai/process";
  const isStaticAsset =
    normalizedPath.startsWith("/_next/") ||
    /\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml|css|js|woff|woff2|ttf|otf|pdf)$/i.test(
      normalizedPath,
    );

  if (!isProductRoute && !isStaticAsset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: CookieOptions }[],
        headers
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );

        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value)
        );
      },
    },
  });

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    try {
      const { data, error } = await supabase.auth.getClaims();

      if (error) {
        throw error;
      }

      const claims = data?.claims ?? null;

      if (!claims) {
        const url = request.nextUrl.clone();
        url.pathname = "/sign-in";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }
    } catch {
      // Session refresh failed — pass through rather than breaking the route.
    }
  }

  return supabaseResponse;
}

export const matcher = [
  "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
];

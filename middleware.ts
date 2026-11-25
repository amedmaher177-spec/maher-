import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Redirects logged-out visitors away from private pages. The API guards are the real security check.
export async function middleware(req: NextRequest) {
  try {
    const token = req.cookies.get("unilost_token")?.value;
    if (!token) throw new Error("no token");
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
}

export const config = { matcher: ["/my-reports/:path*", "/my-claims/:path*", "/report/:path*", "/admin/:path*"] };

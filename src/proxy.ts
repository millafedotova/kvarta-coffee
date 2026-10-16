import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale, localeCookie } from "@/i18n/config";

export function proxy(request: NextRequest) {
  const preference = request.cookies.get(localeCookie)?.value;
  const locale = isLocale(preference) ? preference : defaultLocale;
  const destination = request.nextUrl.clone();
  destination.pathname = `/${locale}`;
  const response = NextResponse.redirect(destination, 307);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Vary", "Cookie");
  return response;
}

export const config = { matcher: ["/"] };

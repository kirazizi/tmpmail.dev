import { NextRequest, NextResponse } from "next/server";

function generateNonce() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function proxy(request: NextRequest) {
  const nonce = generateNonce();
  const csp = [
    `default-src 'self'`,
    `script-src 'nonce-${nonce}' 'strict-dynamic' 'self'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https:`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `frame-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
  ].join("; ");

  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("x-nonce", nonce);
  return response;
}

export const config = {
  matcher: ["/((?!.*\\.(?:ico|png|jpg|jpeg|svg|webp|gif|woff|woff2|ttf|eot|css)$).*)"],
};

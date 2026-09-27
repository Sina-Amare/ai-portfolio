import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  experimental: {
    // The router learns "/[lang]" from /fa and then guesses that English /projects
    // and /privacy are that route too, so their prefetch 404s (the proxy rewrites
    // them to /en/...). Ask the server for each route instead.
    optimisticRouting: false,
  },
  // Baseline hardening on every route. No CSP yet: the inline JSON-LD and theme
  // script would need nonces (parked in docs/yagni.md).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;

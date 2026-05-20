/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Bunny Stream + Bunny CDN
      { protocol: "https", hostname: "**.b-cdn.net" },
      { protocol: "https", hostname: "iframe.mediadelivery.net" },
      // YouTube + Rumble thumbnails (auto-generated when you embed)
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "sp.rmbl.ws" },
      { protocol: "https", hostname: "**.rumble.com" },
      // Site itself (logos, local /uploads/)
      { protocol: "https", hostname: "deamaclub.com" },
      { protocol: "https", hostname: "**.deamaclub.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

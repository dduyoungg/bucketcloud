import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BucketCloud",
    short_name: "BucketCloud",
    description: "내 꿈들이 둥둥 떠다니는 버킷리스트 다이어리",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fffaf3",
    theme_color: "#fffaf3",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  };
}

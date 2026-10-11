import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Image uploads go through server actions; images are resized in the
    // browser first, so this is just headroom.
    serverActions: { bodySizeLimit: "4mb" },
  },
  async redirects() {
    return [{ source: "/execs", destination: "/team", permanent: true }];
  },
};

export default nextConfig;

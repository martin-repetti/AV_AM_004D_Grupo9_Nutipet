import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // La página cambió de nombre con la marca (NutriPet -> HuellaFit).
      { source: "/sobre-nutripet", destination: "/sobre-huellafit", permanent: true },
    ];
  },
};

export default nextConfig;

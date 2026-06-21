import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "wagmi",
      "@rainbow-me/rainbowkit",
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@react-native-async-storage\/async-storage$/,
      })
    );
    config.externals.push("pino-pretty", "lokijs", "encoding");
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        "@react-native-async-storage/async-storage": false,
      };
    }
    return config;
  },
  serverExternalPackages: [
    "@0gfoundation/0g-compute-ts-sdk",
    "@0gfoundation/0g-storage-ts-sdk",
  ],
};

export default nextConfig;
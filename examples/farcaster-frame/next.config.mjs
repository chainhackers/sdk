/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silence warnings
  // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  async redirects() {
    const redirects = [];

    if (process.env.FARCASTER_MANIFEST_URL) {
      redirects.push({
        source: "/.well-known/farcaster.json",
        destination: process.env.FARCASTER_MANIFEST_URL,
        permanent: false,
      });
    }

    return redirects;
  },
};

export default nextConfig;

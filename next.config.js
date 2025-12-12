/** @type {import('next').NextConfig} */
const nextConfig = {
  // Empty turbopack config to silence the warning
  // Most apps work fine with Turbopack without additional config
  turbopack: {},
  
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": __dirname,
    };
    return config;
  },
};

module.exports = nextConfig;
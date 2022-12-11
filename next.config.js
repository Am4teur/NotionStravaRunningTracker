/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: "/authorize",
        destination: "http://www.strava.com/oauth/authorize",
        permanent: false,
      },
      {
        source: "/token",
        destination: "http://www.strava.com/oauth/token",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    '/api/export-pdf': ['./node_modules/@sparticuz/chromium/bin/**'],
  },
};

module.exports = nextConfig;

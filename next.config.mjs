/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // This setting allows production builds to successfully complete even if there are ESLint errors
      ignoreDuringBuilds: true,
    },
  };
  
  export default nextConfig;
  
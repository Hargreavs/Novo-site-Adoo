import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Additional configuration for handling hydration issues
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Disable ESLint during build temporarily
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript checking during build temporarily
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.estrategiaconcursos.com.br' },
      { protocol: 'https', hostname: 'www.direcaoconcursos.com.br' },
      { protocol: 'https', hostname: 'www.grancursosonline.com.br' },
      { protocol: 'https', hostname: 'www.grupoq.online' },
      { protocol: 'https', hostname: 'www.alfaconcursos.com.br' },
      { protocol: 'https', hostname: 'estrategiaconcursos.com.br' },
      { protocol: 'https', hostname: 'direcaoconcursos.com.br' },
      { protocol: 'https', hostname: 'grancursosonline.com.br' },
      { protocol: 'https', hostname: 'grupoq.online' },
      { protocol: 'https', hostname: 'alfaconcursos.com.br' },
    ],
  },
};

export default nextConfig;

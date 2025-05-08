/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['pepetubes.io', 'airdrop.pepetubes.io', 'app.pepetubes.io'],
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NODE_ENV === 'production' 
      ? 'https://airdrop.pepetubes.io' 
      : 'http://localhost:3000',
    NEXT_PUBLIC_STAKING_URL: process.env.NODE_ENV === 'production' 
      ? 'https://app.pepetubes.io' 
      : 'http://localhost:3001',
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || '56', // BSC = 56
  },
};

module.exports = nextConfig;

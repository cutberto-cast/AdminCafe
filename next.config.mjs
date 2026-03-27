/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'navlqwascciipojccevg.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            }
        ],
    },
};

export default nextConfig;

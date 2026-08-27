/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sharp'],
  async headers() {
    return [
      {
        source: '/:file(script|styles|admin).(js|css)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=300, must-revalidate' }],
      },
    ];
  },
};

export default nextConfig;

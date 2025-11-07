/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permitir acceso desde cualquier host (necesario para acceso móvil)
  experimental: {
    // Deshabilitar strict mode para mejor compatibilidad
  },
  // Configuración para desarrollo en red local
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

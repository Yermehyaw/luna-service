import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Luna Business',
    short_name: 'Luna',
    description: 'Your customer relationships and social workspace',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f6f2',
    theme_color: '#291e29',
    icons: [{ src: '/brand/luna-icon-purple.png', sizes: 'any', type: 'image/png', purpose: 'any' }],
  };
}

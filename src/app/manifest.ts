import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '써본사람',
    short_name: '써본사람',
    description: '믿을 수 있는 사람의 실제 사용 경험',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f8f5',
    theme_color: '#216754',
    lang: 'ko',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}

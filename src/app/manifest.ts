import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SwapShield - Vetted Gadget Escrow',
    short_name: 'SwapShield',
    description: 'Nigeria\'s Premier Vetted Gadget Swap & 48-Hour Inspection Escrow Hub',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#059669',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ]
  };
}

'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            if (process.env.NODE_ENV !== 'production') {
              console.log('SwapShield Service Worker registered:', registration.scope);
            }
          })
          .catch((error) => {
            console.warn('SwapShield Service Worker registration error:', error);
          });
      });
    }
  }, []);

  return null;
}

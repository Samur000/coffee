'use client';

import { useEffect } from 'react';
import { initializePWA } from '@/lib/pwa';

export function PWAInitializer() {
  useEffect(() => {
    initializePWA();
  }, []);

  return null;
}

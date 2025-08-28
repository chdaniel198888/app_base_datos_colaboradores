'use client';

import { useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { syncWithServer } from '@/lib/db/indexedDB';
import { useServiceWorker } from '@/hooks/useServiceWorker';

export default function Home() {
  // Registrar Service Worker
  useServiceWorker();
  
  useEffect(() => {
    // Sincronizar datos al cargar la página
    syncWithServer().then((success) => {
      if (success) {
        console.log('✅ Datos sincronizados con éxito');
      }
    });
  }, []);
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto py-8 sm:py-12">
        <SearchBar />
      </div>
    </main>
  );
}
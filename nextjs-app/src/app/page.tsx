'use client';

import { useEffect, useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import ChatAssistantAI from '@/components/ChatAssistantAI';
import ChatAssistantFast from '@/components/ChatAssistantFast';
import { syncWithServer } from '@/lib/db/indexedDB';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { Search, Sparkles, Zap } from 'lucide-react';

export default function Home() {
  // Registrar Service Worker
  useServiceWorker();
  
  const [activeTab, setActiveTab] = useState<'search' | 'chat-ai' | 'chat-fast'>('search');
  
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
        {/* Tab Content */}
        {activeTab === 'search' ? (
          <SearchBar activeTab={activeTab} setActiveTab={setActiveTab} />
        ) : activeTab === 'chat-ai' ? (
          <div className="max-w-5xl mx-auto px-4">
            <ChatAssistantAI activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto px-4">
            <ChatAssistantFast activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        )}
      </div>
    </main>
  );
}
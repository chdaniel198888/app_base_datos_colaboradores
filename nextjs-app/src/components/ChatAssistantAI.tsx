'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, Sparkles, AlertCircle, Settings, Search, Zap } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  functionCalled?: string;
}

interface ChatAssistantAIProps {
  activeTab: 'search' | 'chat-ai' | 'chat-fast';
  setActiveTab: (tab: 'search' | 'chat-ai' | 'chat-fast') => void;
}

export default function ChatAssistantAI({ activeTab, setActiveTab }: ChatAssistantAIProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asistente inteligente para gestión de colaboradores. Puedo ayudarte con:\n\n' +
        '• 🔍 Buscar información de cualquier colaborador\n' +
        '• 📊 Analizar estadísticas del equipo\n' +
        '• 🏢 Mostrar organigramas y estructuras\n' +
        '• 📋 Filtrar por ubicación, cargo, área o estado\n' +
        '• 💡 Responder preguntas complejas sobre el equipo\n\n' +
        '¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}`);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          sessionId 
        })
      });

      const data = await response.json();

      if (data.needsConfiguration) {
        setShowConfiguration(true);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Lo siento, no pude procesar tu solicitud.',
        timestamp: new Date(),
        functionCalled: data.functionCalled
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Error al procesar tu solicitud. Por favor, intenta nuevamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Ejemplos de consultas inteligentes
  const exampleQueries = [
    '¿Cuántas personas trabajan en cada restaurante?',
    '¿Quién es el jefe de producción?',
    'Muéstrame el equipo de marketing',
    '¿Cuáles son los colaboradores más nuevos?',
    'Analiza la distribución por áreas',
    '¿Quién reporta a Daniel Chamorro?'
  ];

  const handleExampleClick = (query: string) => {
    setInput(query);
  };

  return (
    <div>
      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="flex bg-white rounded-lg shadow-sm p-1">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="font-medium">Búsqueda</span>
          </button>
          <button
            onClick={() => setActiveTab('chat-ai')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition ${
              activeTab === 'chat-ai'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Asistente IA</span>
          </button>
          <button
            onClick={() => setActiveTab('chat-fast')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition relative ${
              activeTab === 'chat-fast'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Zap className="w-5 h-5" />
            <span className="font-medium">IA Ultra-Rápida</span>
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-xs px-1.5 py-0.5 rounded-full text-gray-800 font-bold animate-pulse">
              ⚡NEW
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-col h-[700px] bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-2xl overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="w-8 h-8" />
              <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Asistente IA Avanzado</h2>
              <p className="text-xs text-purple-200">Powered by GPT • Contexto inteligente</p>
            </div>
          </div>
          <button
            onClick={() => setShowConfiguration(!showConfiguration)}
            className="p-2 hover:bg-white/20 rounded-lg transition"
            title="Configuración"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Panel de configuración */}
      {showConfiguration && (
        <div className="bg-amber-50 border-b border-amber-200 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900">Configuración de OpenAI requerida</p>
              <p className="text-amber-700 mt-1">
                Para habilitar el chat inteligente con IA:
              </p>
              <ol className="list-decimal list-inside text-amber-700 mt-2 space-y-1">
                <li>Obtén una API key en <a href="https://platform.openai.com/api-keys" target="_blank" className="underline">platform.openai.com</a></li>
                <li>Agrégala en <code className="bg-amber-100 px-1 py-0.5 rounded">.env.local</code>: <code className="bg-amber-100 px-1 py-0.5 rounded">OPENAI_API_KEY=tu_key</code></li>
                <li>Reinicia el servidor</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Messages con diseño mejorado */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } animate-fadeIn`}
          >
            <div
              className={`flex gap-3 max-w-[85%] ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                    : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-6 h-6" />
                ) : (
                  <Bot className="w-6 h-6" />
                )}
              </div>
              <div>
                <div
                  className={`rounded-2xl px-5 py-3 shadow-md ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
                <div className="flex items-center gap-2 mt-1 px-2">
                  <p
                    className={`text-xs ${
                      message.role === 'user' ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('es-EC', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {message.functionCalled && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      🔧 {message.functionCalled}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start animate-fadeIn">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="bg-white rounded-2xl px-5 py-3 shadow-md border border-gray-200">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 text-purple-600 animate-spin" />
                <span className="text-gray-600 text-sm">Pensando...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Example queries con diseño mejorado */}
      {messages.length === 1 && (
        <div className="px-6 pb-3 bg-gradient-to-t from-gray-50 to-transparent">
          <p className="text-sm font-semibold text-gray-700 mb-3">💡 Prueba estas consultas inteligentes:</p>
          <div className="grid grid-cols-2 gap-2">
            {exampleQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(query)}
                className="text-left text-sm bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 
                         text-gray-700 px-3 py-2 rounded-lg transition-all hover:shadow-md border border-gray-200"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input mejorado */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hazme cualquier pregunta sobre el equipo..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     placeholder-gray-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl 
                     hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed 
                     transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Conversación con contexto • IA procesando lenguaje natural
        </p>
      </form>
      </div>
    </div>
  );
}

// Agregar estilos de animación (solo en el cliente)
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
  `;
  if (!document.getElementById('chat-animations')) {
    style.id = 'chat-animations';
    document.head.appendChild(style);
  }
}
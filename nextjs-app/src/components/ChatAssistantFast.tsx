'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, Zap, RefreshCw, CheckCircle, Search, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  functionCalled?: string;
  executionTime?: number;
  isStreaming?: boolean;
}

interface ChatAssistantFastProps {
  activeTab: 'search' | 'chat-ai' | 'chat-fast';
  setActiveTab: (tab: 'search' | 'chat-ai' | 'chat-fast') => void;
}

export default function ChatAssistantFast({ activeTab, setActiveTab }: ChatAssistantFastProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asistente ultra-rápido con IA. Respondo instantáneamente gracias al cache inteligente.\n\n' +
        '⚡ Velocidad optimizada con:\n' +
        '• Cache en memoria (0ms de latencia)\n' +
        '• Streaming de respuestas en tiempo real\n' +
        '• GPT-3.5 Turbo optimizado\n\n' +
        '¿En qué puedo ayudarte?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}`);
  const [cacheStatus, setCacheStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Verificar estado del cache al montar
  useEffect(() => {
    fetch('/api/chat-ai-fast')
      .then(res => res.json())
      .then(data => {
        if (data.cacheStatus === 'ready') {
          setCacheStatus('ready');
        }
      })
      .catch(() => setCacheStatus('error'));
  }, []);

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

    // Crear mensaje del asistente vacío para streaming
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };
    
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Crear un AbortController para poder cancelar si es necesario
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/chat-ai-fast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          sessionId 
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta');
      }

      // Si es streaming
      if (response.headers.get('content-type')?.includes('event-stream')) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let functionInfo: any = null;

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data === '[DONE]') {
                  // Finalizar streaming
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId
                      ? { ...msg, isStreaming: false, ...functionInfo }
                      : msg
                  ));
                  break;
                }

                try {
                  const parsed = JSON.parse(data);
                  
                  if (parsed.type === 'metadata') {
                    functionInfo = {
                      functionCalled: parsed.functionCalled,
                      executionTime: parsed.executionTime
                    };
                  } else if (parsed.type === 'content' && parsed.content) {
                    // Actualizar el mensaje con streaming
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMessageId
                        ? { ...msg, content: msg.content + parsed.content }
                        : msg
                    ));
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e);
                }
              }
            }
          }
        }
      } else {
        // Respuesta JSON normal (en caso de error o configuración)
        const data = await response.json();
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId
            ? { ...msg, content: data.response || 'Error procesando respuesta', isStreaming: false }
            : msg
        ));
      }

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error:', error);
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId
            ? { ...msg, content: '❌ Error al procesar tu solicitud.', isStreaming: false }
            : msg
        ));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Cancelar streaming si está en progreso
  const cancelStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  // Refrescar cache
  const refreshCache = async () => {
    setCacheStatus('loading');
    try {
      const res = await fetch('/api/chat-ai-fast?refresh=true');
      if (res.ok) {
        setCacheStatus('ready');
      }
    } catch {
      setCacheStatus('error');
    }
  };

  const exampleQueries = [
    '¿Cuántos colaboradores hay?',
    'Análisis por áreas',
    'Busca a Daniel',
    'Organigrama completo',
    'Estadísticas por ubicación',
    'Quién tiene más reportes'
  ];

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

      <div className="flex flex-col h-[700px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-2xl overflow-hidden">
        {/* Header con indicador de velocidad */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="w-8 h-8" />
              <Zap className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Chat Ultra-Rápido
                {cacheStatus === 'ready' && (
                  <span className="text-xs bg-green-500/30 px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Cache Activo
                  </span>
                )}
              </h2>
              <p className="text-xs text-green-200">Streaming + Cache = Respuestas Instantáneas</p>
            </div>
          </div>
          <button
            onClick={refreshCache}
            className="p-2 hover:bg-white/20 rounded-lg transition"
            title="Actualizar cache"
          >
            <RefreshCw className={`w-5 h-5 ${cacheStatus === 'loading' ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Messages con indicadores de velocidad */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`flex gap-3 max-w-[85%] ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                    : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
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
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                    {message.isStreaming && <span className="animate-pulse">▊</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1 px-2">
                  <p className="text-xs text-gray-400">
                    {message.timestamp.toLocaleTimeString('es-EC', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {message.functionCalled && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {message.functionCalled} ({message.executionTime}ms)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-3 justify-start">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="bg-white rounded-2xl px-5 py-3 shadow-md border border-gray-200">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 text-green-600 animate-spin" />
                <span className="text-gray-600 text-sm">Conectando...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sugerencias rápidas */}
      {messages.length === 1 && (
        <div className="px-6 pb-3 bg-gradient-to-t from-gray-50 to-transparent">
          <p className="text-sm font-semibold text-gray-700 mb-3">⚡ Pruebas rápidas:</p>
          <div className="grid grid-cols-3 gap-2">
            {exampleQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => setInput(query)}
                className="text-left text-sm bg-white hover:bg-green-50 text-gray-700 px-3 py-2 rounded-lg 
                         transition-all hover:shadow-md border border-gray-200 hover:border-green-300"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input con indicador de velocidad */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta... (respuesta instantánea)"
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl 
                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                     placeholder-gray-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || cacheStatus !== 'ready'}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl 
                     hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed 
                     transition-all transform hover:scale-105 active:scale-95 shadow-lg
                     flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          </button>
          {isLoading && (
            <button
              type="button"
              onClick={cancelStreaming}
              className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
            >
              Cancelar
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center flex items-center justify-center gap-2">
          <Zap className="w-3 h-3 text-green-500" />
          Cache en memoria • Streaming activo • Latencia &lt; 100ms
        </p>
      </form>
      </div>
    </div>
  );
}
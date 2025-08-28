'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Filter, Loader2, User, Phone, Mail, MapPin, Briefcase, Building2, Calendar, Hash, Users, Grid3x3, List, LayoutGrid, Menu, Sparkles, Zap } from 'lucide-react';
import { useSearch, useFilterOptions } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';
import { SyncButton } from '@/components/SyncButton';
import { CompactListView } from '@/components/CompactListView';

interface SearchBarProps {
  activeTab: 'search' | 'chat-ai' | 'chat-fast';
  setActiveTab: (tab: 'search' | 'chat-ai' | 'chat-fast') => void;
}

export function SearchBar({ activeTab, setActiveTab }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showResults, setShowResults] = useState(true); // Cambiado a true para mostrar siempre
  const [viewType, setViewType] = useState<'cards' | 'list'>('cards');
  const [filters, setFilters] = useState({
    centro_costo: '',
    marca: '',
    area: '',
  });
  
  const { results, isLoading, source, responseTime, hasLocalData, sync } = useSearch(query, { filters });
  const { options } = useFilterOptions();
  
  // Cargar preferencia de vista desde localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('viewPreference') as 'cards' | 'list';
    if (savedView && (savedView === 'cards' || savedView === 'list')) {
      setViewType(savedView);
    }
  }, []);
  
  // Guardar preferencia de vista
  const toggleView = (type: 'cards' | 'list') => {
    setViewType(type);
    localStorage.setItem('viewPreference', type);
  };
  
  // Función para obtener el teléfono (solo hay celular, no corporativo)
  const getPhoneNumber = (colaborador: any) => {
    return colaborador.celular || '';
  };
  
  // Función para formatear el teléfono para WhatsApp
  const formatWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.startsWith('593') ? cleaned : `593${cleaned.substring(1)}`;
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Header con gradiente */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-center mb-2">
              Directorio de Colaboradores
            </h1>
            <p className="text-center text-gray-600">Encuentra rápidamente a cualquier miembro del equipo</p>
          </div>
          <div className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0">
            <SyncButton />
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Después del título */}
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
      
      {/* Barra de búsqueda principal */}
      <div className="relative mb-6">
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-gray-400 w-5 h-5 pointer-events-none z-10" />
          
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Buscar por nombre, código, cargo, cédula o ubicación..."
            className={cn(
              "w-full pl-12 pr-24 py-4",
              "bg-white/90 backdrop-blur-lg",
              "border-2 border-purple-200",
              "rounded-2xl",
              "text-gray-800 placeholder-gray-400",
              "focus:ring-4 focus:ring-purple-400/20",
              "focus:border-purple-400",
              "focus:bg-white",
              "transition-all duration-200",
              "text-base sm:text-lg",
              "shadow-lg"
            )}
          />
          
          {/* Botones de acción */}
          <div className="absolute right-2 flex items-center gap-1">
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setShowResults(true); // Mantener resultados visibles
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                showFilters 
                  ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg" 
                  : "hover:bg-gray-100 text-gray-500"
              )}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Indicador de estado */}
        <div className="absolute -bottom-6 left-4 flex items-center gap-2 text-xs text-gray-500">
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Buscando...</span>
            </>
          ) : (
            <>
              <span className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                source === 'local' ? "bg-green-500" : "bg-blue-500"
              )}/>
              <span>
                {results.length} colaborador{results.length !== 1 ? 'es' : ''} 
                {source === 'local' ? ' (offline)' : ' (en línea)'}
                {responseTime && ` • ${responseTime.toFixed(0)}ms`}
                {query && ` • Filtrado por: "${query}"`}
              </span>
            </>
            
          )}
          
          {!hasLocalData && (
            <button
              onClick={sync}
              className="ml-2 text-purple-600 hover:text-purple-700 underline text-xs"
            >
              Sincronizar datos
            </button>
          )}
        </div>
      </div>
      
      {/* Panel de filtros con animación */}
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        showFilters ? "max-h-32 opacity-100 mb-8" : "max-h-0 opacity-0"
      )}>
        <div className="p-4 bg-white/80 backdrop-blur-lg rounded-2xl border-2 border-purple-100 shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={filters.centro_costo}
              onChange={(e) => setFilters({...filters, centro_costo: e.target.value})}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
            >
              <option value="">📍 Todas las ubicaciones</option>
              {options.centrosCosto.map(centro => (
                <option key={centro} value={centro}>{centro}</option>
              ))}
            </select>
            
            <select
              value={filters.marca}
              onChange={(e) => setFilters({...filters, marca: e.target.value})}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
            >
              <option value="">🏢 Todas las marcas</option>
              {options.marcas.map(marca => (
                <option key={marca} value={marca}>{marca}</option>
              ))}
            </select>
            
            <select
              value={filters.area}
              onChange={(e) => setFilters({...filters, area: e.target.value})}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
            >
              <option value="">👥 Todas las áreas</option>
              {options.areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Toggle de vista y resultados - Siempre mostrar */}
      {showResults && !isLoading && (
        <div className="space-y-4 animate-slide-in">
          {results.length > 0 ? (
            <>
              {/* Controles de vista */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 font-medium">
                  Mostrando {viewType === 'list' ? Math.min(50, results.length) : Math.min(20, results.length)} de {results.length} resultados
                </p>
                
                {/* Toggle de vista */}
                <div className="flex items-center gap-1 bg-white rounded-lg shadow-md p-1 border border-purple-100">
                  <button
                    onClick={() => toggleView('cards')}
                    className={cn(
                      "p-2 rounded transition-all duration-200",
                      viewType === 'cards'
                        ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-md"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    )}
                    title="Vista de tarjetas"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => toggleView('list')}
                    className={cn(
                      "p-2 rounded transition-all duration-200",
                      viewType === 'list'
                        ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-md"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    )}
                    title="Vista de lista compacta"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Renderizado condicional según tipo de vista */}
              {viewType === 'list' ? (
                <CompactListView colaboradores={results} />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {results.slice(0, 20).map((colaborador) => (
                    <div
                    key={colaborador.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] p-4 sm:p-6 border-2 border-transparent hover:border-purple-200"
                  >
                    {/* Header de la card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-purple-500" />
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {colaborador.nombre}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Hash className="w-3 h-3" />
                          <span className="font-mono">{colaborador.codigo}</span>
                          {colaborador.sexo && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                              {colaborador.sexo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Información principal */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{colaborador.cargo}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{colaborador.ubicacion}</span>
                      </div>
                      
                      {colaborador.area && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{colaborador.area}</span>
                        </div>
                      )}
                      
                      {colaborador.jefe && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 text-xs">Reporta a: {colaborador.jefe}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Información adicional */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 text-xs rounded-lg bg-blue-100 text-blue-700">
                        {colaborador.empresa}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-lg bg-green-100 text-green-700">
                        {colaborador.etapa}
                      </span>
                      {colaborador.permanenciaMeses && (
                        <span className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-700">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {colaborador.permanenciaMeses} {colaborador.permanenciaMeses === 1 ? 'mes' : 'meses'}
                        </span>
                      )}
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      {getPhoneNumber(colaborador) && (
                        <>
                          <a
                            href={`tel:${getPhoneNumber(colaborador)}`}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <Phone className="w-4 h-4" />
                            <span className="hidden sm:inline">Llamar</span>
                          </a>
                          
                          <a
                            href={`https://wa.me/${formatWhatsApp(getPhoneNumber(colaborador))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            <span className="hidden sm:inline">WhatsApp</span>
                          </a>
                        </>
                      )}
                      
                      {colaborador.correo && (
                        <a
                          href={`mailto:${colaborador.correo}`}
                          className="bg-white border-2 border-purple-200 text-purple-600 px-4 py-2 rounded-xl font-medium hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 flex items-center justify-center"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    
                    {/* Mostrar datos de contacto - SOLO los campos que definiste */}
                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      {colaborador.celular && (
                        <p>📱 Celular: {colaborador.celular}</p>
                      )}
                      {colaborador.cedula && (
                        <p>🆔 Cédula: {colaborador.cedula}</p>
                      )}
                      {colaborador.direccion && (
                        <p className="mt-1">📍 {colaborador.direccion}</p>
                      )}
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron colaboradores</p>
              <p className="text-sm text-gray-400 mt-2">Intenta con otros términos de búsqueda</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
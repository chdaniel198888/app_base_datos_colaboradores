# 🚀 IMPLEMENTACIÓN BÚSQUEDA ULTRA-RÁPIDA (<3 SEGUNDOS)
## Sistema de Búsqueda en Tiempo Real para App de Colaboradores

---

## 📊 ARQUITECTURA DE LA SOLUCIÓN

### Flujo de Datos Optimizado
```
Usuario escribe → Debounce (150ms) → Cliente (React Query) → 
→ Caché Local (IndexedDB) → Si no hay match → API (Edge Function) →
→ Caché Redis → Si no hay match → PostgreSQL con índices →
→ Respuesta → Actualizar caché → Mostrar resultados
```

### Estrategia de 3 Capas de Velocidad
1. **Capa 1 (0-50ms)**: Búsqueda en memoria del navegador
2. **Capa 2 (50-200ms)**: IndexedDB + Service Worker
3. **Capa 3 (200-500ms)**: API con caché Redis
4. **Fallback (<3s)**: PostgreSQL con índices optimizados

---

## 🗄️ PASO 1: ESTRUCTURA DE BASE DE DATOS OPTIMIZADA

### Schema PostgreSQL Optimizado

```sql
-- Tabla principal con datos desnormalizados para búsqueda
CREATE TABLE colaboradores_search (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_trabajador VARCHAR(20) UNIQUE NOT NULL,
    
    -- Campos de búsqueda principales
    nombre_completo VARCHAR(255) NOT NULL,
    nombre_search TEXT GENERATED ALWAYS AS (
        lower(unaccent(nombre_completo))
    ) STORED,
    
    cargo VARCHAR(100),
    cargo_search TEXT GENERATED ALWAYS AS (
        lower(unaccent(cargo))
    ) STORED,
    
    centro_costo VARCHAR(100),
    marca VARCHAR(50),
    area VARCHAR(100),
    
    -- Datos de contacto
    celular VARCHAR(20),
    celular_corporativo VARCHAR(20),
    correo VARCHAR(100),
    
    -- Ubicación
    direccion_domicilio TEXT,
    sector_domicilio VARCHAR(100),
    coordenadas POINT,
    
    -- Campos para filtros
    empresa VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'Activo',
    tipo_trabajador VARCHAR(50),
    jefe_directo VARCHAR(255),
    
    -- Vectores de búsqueda full-text
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('spanish', coalesce(nombre_completo, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(cargo, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(centro_costo, '')), 'C') ||
        setweight(to_tsvector('spanish', coalesce(sector_domicilio, '')), 'D')
    ) STORED,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sync_airtable_at TIMESTAMPTZ
);

-- Índices críticos para velocidad
CREATE INDEX idx_search_vector ON colaboradores_search USING gin(search_vector);
CREATE INDEX idx_nombre_search ON colaboradores_search USING gin(nombre_search gin_trgm_ops);
CREATE INDEX idx_cargo_search ON colaboradores_search USING gin(cargo_search gin_trgm_ops);
CREATE INDEX idx_centro_costo ON colaboradores_search(centro_costo);
CREATE INDEX idx_marca ON colaboradores_search(marca);
CREATE INDEX idx_area ON colaboradores_search(area);
CREATE INDEX idx_estado ON colaboradores_search(estado);
CREATE INDEX idx_coordenadas ON colaboradores_search USING gist(coordenadas);

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Tabla de búsquedas frecuentes para machine learning
CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    results_count INT,
    clicked_result_id UUID,
    response_time_ms INT,
    user_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_analytics_query ON search_analytics(query);
CREATE INDEX idx_search_analytics_created ON search_analytics(created_at DESC);
```

---

## 💾 PASO 2: IMPLEMENTACIÓN DE CACHÉ MULTINIVEL

### 2.1 Configuración de IndexedDB (Cliente)

```typescript
// utils/db/indexedDB.ts
import Dexie, { Table } from 'dexie';

interface ColaboradorCache {
  id: string;
  codigo_trabajador: string;
  nombre_completo: string;
  cargo: string;
  centro_costo: string;
  marca: string;
  area: string;
  celular: string;
  celular_corporativo?: string;
  correo: string;
  direccion_domicilio: string;
  sector_domicilio: string;
  lat?: number;
  lng?: number;
  search_terms: string; // Campo concatenado para búsqueda
  last_updated: Date;
}

class ColaboradoresDB extends Dexie {
  colaboradores!: Table<ColaboradorCache>;
  searchCache!: Table<{
    query: string;
    results: string[];
    timestamp: Date;
  }>;

  constructor() {
    super('ColaboradoresDB');
    
    this.version(1).stores({
      colaboradores: 'id, codigo_trabajador, *search_terms, centro_costo, marca, area',
      searchCache: 'query, timestamp'
    });
  }
}

export const db = new ColaboradoresDB();

// Función de precarga de datos
export async function preloadColaboradores(data: ColaboradorCache[]) {
  // Preparar datos para búsqueda
  const processedData = data.map(col => ({
    ...col,
    search_terms: `${col.nombre_completo} ${col.cargo} ${col.centro_costo} ${col.area}`.toLowerCase(),
    last_updated: new Date()
  }));
  
  await db.colaboradores.bulkPut(processedData);
}

// Búsqueda ultrarrápida en IndexedDB
export async function searchLocalDB(query: string): Promise<ColaboradorCache[]> {
  const startTime = performance.now();
  const searchTerm = query.toLowerCase();
  
  // Buscar en caché de queries previas
  const cachedResult = await db.searchCache
    .where('query')
    .equals(searchTerm)
    .and(item => {
      const age = Date.now() - item.timestamp.getTime();
      return age < 5 * 60 * 1000; // Cache válido por 5 minutos
    })
    .first();
  
  if (cachedResult) {
    const results = await db.colaboradores
      .where('id')
      .anyOf(cachedResult.results)
      .toArray();
    
    console.log(`Cache hit! Time: ${performance.now() - startTime}ms`);
    return results;
  }
  
  // Búsqueda en datos locales
  const results = await db.colaboradores
    .filter(col => {
      const searchFields = col.search_terms;
      return searchFields.includes(searchTerm) ||
             searchTerm.split(' ').every(term => searchFields.includes(term));
    })
    .limit(50)
    .toArray();
  
  // Guardar en caché
  if (results.length > 0) {
    await db.searchCache.put({
      query: searchTerm,
      results: results.map(r => r.id),
      timestamp: new Date()
    });
  }
  
  console.log(`Local search time: ${performance.now() - startTime}ms`);
  return results;
}
```

### 2.2 Service Worker para Caché Offline

```javascript
// public/sw.js
const CACHE_NAME = 'colaboradores-v1';
const urlsToCache = [
  '/',
  '/api/colaboradores/all', // Precarga inicial
];

// Instalar y precargar
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Estrategia de cache-first para búsquedas
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/search')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            // Actualizar caché en background
            fetch(event.request).then(freshResponse => {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, freshResponse.clone());
              });
            });
            return response;
          }
          
          return fetch(event.request).then(response => {
            if (!response || response.status !== 200) {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
            
            return response;
          });
        })
    );
  }
});
```

---

## 🎯 PASO 3: API OPTIMIZADA CON EDGE FUNCTIONS

### 3.1 API Route con Múltiples Estrategias

```typescript
// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { sql } from '@vercel/postgres';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const runtime = 'edge'; // Edge function para menor latencia

interface SearchParams {
  q: string;
  filters?: {
    centro_costo?: string;
    marca?: string;
    area?: string;
    estado?: string;
  };
  limit?: number;
  offset?: number;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;
  
  const params: SearchParams = {
    q: searchParams.get('q') || '',
    filters: {
      centro_costo: searchParams.get('centro_costo') || undefined,
      marca: searchParams.get('marca') || undefined,
      area: searchParams.get('area') || undefined,
      estado: searchParams.get('estado') || 'Activo',
    },
    limit: parseInt(searchParams.get('limit') || '20'),
    offset: parseInt(searchParams.get('offset') || '0'),
  };
  
  // Validación de entrada
  if (params.q.length < 2) {
    return NextResponse.json({ 
      error: 'Query debe tener al menos 2 caracteres' 
    }, { status: 400 });
  }
  
  try {
    // 1. Intentar obtener de Redis (caché distribuido)
    const cacheKey = `search:${JSON.stringify(params)}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      console.log(`Redis cache hit: ${Date.now() - startTime}ms`);
      return NextResponse.json({
        results: cached,
        cached: true,
        responseTime: Date.now() - startTime
      });
    }
    
    // 2. Búsqueda en PostgreSQL optimizada
    const results = await performPostgresSearch(params);
    
    // 3. Guardar en Redis con TTL de 5 minutos
    await redis.setex(cacheKey, 300, JSON.stringify(results));
    
    // 4. Analytics para mejorar búsquedas futuras
    await trackSearch(params.q, results.length, Date.now() - startTime);
    
    return NextResponse.json({
      results,
      cached: false,
      responseTime: Date.now() - startTime
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ 
      error: 'Error en búsqueda',
      fallback: true 
    }, { status: 500 });
  }
}

async function performPostgresSearch(params: SearchParams) {
  const { q, filters, limit, offset } = params;
  
  // Construir query dinámico con diferentes estrategias
  let query = sql`
    WITH ranked_results AS (
      SELECT 
        *,
        -- Ranking por relevancia
        ts_rank(search_vector, plainto_tsquery('spanish', ${q})) as rank_fulltext,
        similarity(nombre_search, ${q.toLowerCase()}) as rank_trigram,
        CASE 
          WHEN nombre_search LIKE ${q.toLowerCase() + '%'} THEN 1
          WHEN nombre_search LIKE ${'%' + q.toLowerCase() + '%'} THEN 0.5
          ELSE 0
        END as rank_prefix
      FROM colaboradores_search
      WHERE 
        estado = ${filters?.estado || 'Activo'}
        AND (
          -- Full-text search
          search_vector @@ plainto_tsquery('spanish', ${q})
          OR 
          -- Trigram similarity
          similarity(nombre_search, ${q.toLowerCase()}) > 0.2
          OR
          -- Búsqueda parcial
          nombre_search LIKE ${'%' + q.toLowerCase() + '%'}
          OR
          cargo_search LIKE ${'%' + q.toLowerCase() + '%'}
        )
  `;
  
  // Agregar filtros dinámicos
  if (filters?.centro_costo) {
    query = sql`${query} AND centro_costo = ${filters.centro_costo}`;
  }
  if (filters?.marca) {
    query = sql`${query} AND marca = ${filters.marca}`;
  }
  if (filters?.area) {
    query = sql`${query} AND area = ${filters.area}`;
  }
  
  // Ordenar por relevancia combinada y limitar
  query = sql`
    ${query}
    )
    SELECT * FROM ranked_results
    ORDER BY 
      (rank_fulltext * 0.4 + rank_trigram * 0.4 + rank_prefix * 0.2) DESC,
      nombre_completo ASC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
  
  const result = await query;
  return result.rows;
}

async function trackSearch(query: string, resultsCount: number, responseTime: number) {
  try {
    await sql`
      INSERT INTO search_analytics (query, results_count, response_time_ms)
      VALUES (${query}, ${resultsCount}, ${responseTime})
    `;
  } catch (error) {
    console.error('Error tracking search:', error);
  }
}
```

---

## 🎨 PASO 4: COMPONENTE DE BÚSQUEDA REACT

### 4.1 Hook Personalizado con React Query

```typescript
// hooks/useSearch.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebouncedValue } from '@mantine/hooks';
import { searchLocalDB } from '@/utils/db/indexedDB';
import { useEffect, useState } from 'react';

interface SearchFilters {
  centro_costo?: string;
  marca?: string;
  area?: string;
  estado?: string;
}

interface UseSearchOptions {
  enabled?: boolean;
  filters?: SearchFilters;
  limit?: number;
}

export function useSearch(query: string, options: UseSearchOptions = {}) {
  const [debouncedQuery] = useDebouncedValue(query, 150);
  const [localResults, setLocalResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();
  
  // Búsqueda local inmediata
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsSearching(true);
      searchLocalDB(debouncedQuery).then(results => {
        setLocalResults(results);
        setIsSearching(false);
      });
    } else {
      setLocalResults([]);
      setIsSearching(false);
    }
  }, [debouncedQuery]);
  
  // Búsqueda en servidor (fallback)
  const serverQuery = useQuery({
    queryKey: ['search', debouncedQuery, options.filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: debouncedQuery,
        limit: String(options.limit || 20),
        ...options.filters
      });
      
      const response = await fetch(`/api/search?${params}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      return response.json();
    },
    enabled: debouncedQuery.length >= 2 && localResults.length === 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });
  
  // Combinar resultados con preferencia a locales
  const results = localResults.length > 0 
    ? { data: localResults, source: 'local' }
    : serverQuery.data 
    ? { data: serverQuery.data.results, source: 'server' }
    : { data: [], source: null };
  
  return {
    results: results.data,
    source: results.source,
    isLoading: isSearching || serverQuery.isLoading,
    isError: serverQuery.isError,
    error: serverQuery.error,
    responseTime: serverQuery.data?.responseTime,
  };
}
```

### 4.2 Componente de Búsqueda UI

```tsx
// components/SearchBar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2, Filter, MapPin, Phone, Briefcase } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    centro_costo: '',
    marca: '',
    area: '',
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, isLoading, source, responseTime } = useSearch(query, { filters });
  
  // Auto-focus en mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Barra de búsqueda principal */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-gray-400 w-5 h-5 pointer-events-none" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, cargo, tienda o ubicación..."
            className={cn(
              "w-full pl-12 pr-24 py-4",
              "bg-white/80 backdrop-blur-lg",
              "border-2 border-purple-200",
              "rounded-2xl",
              "text-gray-800 placeholder-gray-400",
              "focus:ring-4 focus:ring-purple-400/20",
              "focus:border-purple-400",
              "focus:bg-white",
              "transition-all duration-200",
              "text-base sm:text-lg"
            )}
          />
          
          {/* Botones de acción */}
          <div className="absolute right-2 flex items-center gap-1">
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                showFilters 
                  ? "bg-purple-100 text-purple-600" 
                  : "hover:bg-gray-100 text-gray-500"
              )}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Indicador de estado */}
        {query.length >= 2 && (
          <div className="absolute -bottom-6 left-4 flex items-center gap-2 text-xs text-gray-500">
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  source === 'local' ? "bg-green-500" : "bg-blue-500"
                )}/>
                <span>
                  {results.length} resultados 
                  {source === 'local' ? ' (local)' : ' (servidor)'}
                  {responseTime && ` • ${responseTime}ms`}
                </span>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Panel de filtros */}
      {showFilters && (
        <div className="mt-4 p-4 bg-white/80 backdrop-blur-lg rounded-xl border-2 border-purple-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={filters.centro_costo}
              onChange={(e) => setFilters({...filters, centro_costo: e.target.value})}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
            >
              <option value="">Todas las tiendas</option>
              <option value="Santo Cachón Real Audiencia">Santo Cachón Real Audiencia</option>
              <option value="Chios CCI">Chios CCI</option>
              <option value="Santo Cachón Portugal">Santo Cachón Portugal</option>
            </select>
            
            <select
              value={filters.marca}
              onChange={(e) => setFilters({...filters, marca: e.target.value})}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
            >
              <option value="">Todas las marcas</option>
              <option value="Santo Cachon">Santo Cachon</option>
              <option value="Chios">Chios</option>
              <option value="Oficina y Planta">Oficina y Planta</option>
            </select>
            
            <select
              value={filters.area}
              onChange={(e) => setFilters({...filters, area: e.target.value})}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
            >
              <option value="">Todas las áreas</option>
              <option value="Cocina">Cocina</option>
              <option value="Servicio">Servicio</option>
              <option value="Administrativa">Administrativa</option>
            </select>
          </div>
        </div>
      )}
      
      {/* Resultados de búsqueda */}
      {query.length >= 2 && !isLoading && results.length > 0 && (
        <div className="mt-8 space-y-3">
          {results.slice(0, 10).map((colaborador) => (
            <div
              key={colaborador.id}
              className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {highlightMatch(colaborador.nombre_completo, query)}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {highlightMatch(colaborador.cargo, query)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {colaborador.centro_costo}
                    </span>
                  </div>
                </div>
                
                <button className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Función helper para resaltar coincidencias
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  
  return (
    <>
      {parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 font-semibold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
```

---

## ⚡ PASO 5: OPTIMIZACIONES DE RENDIMIENTO

### 5.1 Precarga Inteligente

```typescript
// utils/preload.ts
export async function preloadEssentialData() {
  // Cargar los primeros 500 colaboradores más buscados
  const response = await fetch('/api/colaboradores/top');
  const data = await response.json();
  
  // Guardar en IndexedDB
  await preloadColaboradores(data);
  
  // Precargar imágenes de contacto
  data.forEach((col: any) => {
    if (col.foto_url) {
      const img = new Image();
      img.src = col.foto_url;
    }
  });
  
  // Preparar Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
}

// Llamar en el layout principal
export default function RootLayout({ children }) {
  useEffect(() => {
    preloadEssentialData();
  }, []);
  
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### 5.2 Búsqueda Predictiva con Machine Learning

```typescript
// utils/predictive-search.ts
class PredictiveSearch {
  private searchHistory: Map<string, string[]> = new Map();
  private popularSearches: string[] = [];
  
  async getSuggestions(partial: string): Promise<string[]> {
    // 1. Historial del usuario
    const userHistory = this.getUserSuggestions(partial);
    
    // 2. Búsquedas populares
    const popular = await this.getPopularSearches(partial);
    
    // 3. Autocompletado inteligente
    const predictions = await this.getPredictions(partial);
    
    // Combinar y deduplicar
    return [...new Set([...userHistory, ...popular, ...predictions])].slice(0, 5);
  }
  
  private getUserSuggestions(partial: string): string[] {
    const suggestions: string[] = [];
    
    this.searchHistory.forEach((results, query) => {
      if (query.toLowerCase().startsWith(partial.toLowerCase())) {
        suggestions.push(query);
      }
    });
    
    return suggestions.slice(0, 3);
  }
  
  private async getPopularSearches(partial: string): Promise<string[]> {
    const cached = localStorage.getItem('popular_searches');
    if (cached) {
      const searches = JSON.parse(cached);
      return searches.filter((s: string) => 
        s.toLowerCase().includes(partial.toLowerCase())
      );
    }
    
    // Obtener del servidor
    const response = await fetch(`/api/search/popular?q=${partial}`);
    const data = await response.json();
    
    localStorage.setItem('popular_searches', JSON.stringify(data));
    return data;
  }
  
  private async getPredictions(partial: string): Promise<string[]> {
    // Usar TensorFlow.js o similar para predicciones
    // Por ahora, usar lógica simple
    const commonSuffixes = {
      'pol': ['polifuncional', 'polifuncional cocina', 'polifuncional servicio'],
      'caj': ['cajero', 'cajera', 'caja'],
      'coc': ['cocina', 'cocinero', 'cocina principal'],
    };
    
    const prefix = partial.toLowerCase().slice(0, 3);
    return commonSuffixes[prefix] || [];
  }
  
  recordSearch(query: string, results: any[]) {
    this.searchHistory.set(query, results.map(r => r.id));
    
    // Guardar en localStorage
    const history = JSON.parse(localStorage.getItem('search_history') || '[]');
    history.unshift({ query, timestamp: Date.now() });
    localStorage.setItem('search_history', JSON.stringify(history.slice(0, 50)));
  }
}

export const predictiveSearch = new PredictiveSearch();
```

---

## 🔬 PASO 6: TESTING Y MÉTRICAS

### 6.1 Tests de Rendimiento

```typescript
// __tests__/search-performance.test.ts
import { measureSearchPerformance } from '@/utils/testing';

describe('Search Performance', () => {
  it('debe completar búsqueda local en menos de 50ms', async () => {
    const startTime = performance.now();
    const results = await searchLocalDB('Juan');
    const duration = performance.now() - startTime;
    
    expect(duration).toBeLessThan(50);
    expect(results.length).toBeGreaterThan(0);
  });
  
  it('debe completar búsqueda en servidor en menos de 500ms', async () => {
    const response = await fetch('/api/search?q=Maria');
    const data = await response.json();
    
    expect(data.responseTime).toBeLessThan(500);
  });
  
  it('debe manejar 100 búsquedas concurrentes', async () => {
    const promises = Array.from({ length: 100 }, (_, i) => 
      fetch(`/api/search?q=test${i}`)
    );
    
    const startTime = Date.now();
    const responses = await Promise.all(promises);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(3000); // Menos de 3 segundos para 100 requests
    expect(responses.every(r => r.ok)).toBe(true);
  });
});
```

### 6.2 Monitoreo en Producción

```typescript
// utils/monitoring.ts
export function trackSearchMetrics(query: string, results: any[], timing: {
  local?: number;
  server?: number;
  total: number;
}) {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: query,
      results_count: results.length,
      response_time: timing.total,
      source: timing.local ? 'local' : 'server'
    });
  }
  
  // Custom metrics API
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify({
      event: 'search',
      query,
      results_count: results.length,
      timing,
      timestamp: Date.now()
    })
  });
  
  // Performance API
  if ('performance' in window) {
    performance.mark('search-complete');
    performance.measure('search-duration', 'search-start', 'search-complete');
  }
}
```

---

## 📈 RESULTADOS ESPERADOS

### Métricas de Rendimiento Target

| Métrica | Target | Actual Esperado |
|---------|--------|----------------|
| **Búsqueda Local (Cache)** | < 50ms | 10-30ms |
| **Búsqueda IndexedDB** | < 100ms | 30-80ms |
| **Búsqueda API (Redis)** | < 200ms | 100-180ms |
| **Búsqueda PostgreSQL** | < 500ms | 200-400ms |
| **Tiempo Total P95** | < 3s | 0.5-1.5s |

### Capacidad del Sistema

- **Usuarios concurrentes**: 1,000+
- **Búsquedas por segundo**: 100+
- **Tamaño de datos**: 10,000+ colaboradores
- **Disponibilidad**: 99.9% (incluso offline)

---

## 🚀 DEPLOYMENT Y CONFIGURACIÓN

### Variables de Entorno Necesarias

```env
# .env.local
DATABASE_URL=postgresql://user:pass@host:5432/dbname
UPSTASH_REDIS_URL=https://xxx.upstash.io
UPSTASH_REDIS_TOKEN=xxx
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx

# Optimizaciones Vercel
VERCEL_REGION=iad1  # Región más cercana
NEXT_PUBLIC_VERCEL_ENV=production
```

### Script de Inicialización

```bash
#!/bin/bash
# setup.sh

# 1. Instalar dependencias
npm install

# 2. Configurar base de datos
npm run db:migrate
npm run db:seed

# 3. Generar índices de búsqueda
npm run search:index

# 4. Precompilar assets
npm run build

# 5. Iniciar con PM2
pm2 start npm --name "colaboradores-app" -- start
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Configurar PostgreSQL con extensiones
- [ ] Crear índices de búsqueda
- [ ] Implementar IndexedDB
- [ ] Configurar Service Worker
- [ ] Crear API con Edge Functions
- [ ] Implementar caché Redis
- [ ] Desarrollar componente SearchBar
- [ ] Agregar debounce y throttle
- [ ] Implementar búsqueda predictiva
- [ ] Configurar analytics
- [ ] Testing de rendimiento
- [ ] Optimizar bundle size
- [ ] Deploy en Vercel
- [ ] Monitoreo con Datadog/New Relic
- [ ] A/B testing de algoritmos
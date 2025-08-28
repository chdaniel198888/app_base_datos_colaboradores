import { useState, useEffect, useCallback, useRef } from 'react';
import { searchLocalDB, hasLocalData, syncWithServer } from '@/lib/db/indexedDB';
import { ColaboradorCache } from '@/lib/db/indexedDB';

interface UseSearchOptions {
  filters?: {
    centro_costo?: string;
    marca?: string;
    area?: string;
    cargo?: string;
  };
  enabled?: boolean;
}

export function useSearch(query: string, options: UseSearchOptions = {}) {
  const [results, setResults] = useState<ColaboradorCache[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'local' | 'server' | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [hasLocal, setHasLocal] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const lastQueryRef = useRef<string>('');
  
  // Verificar si hay datos locales al montar
  useEffect(() => {
    hasLocalData().then(setHasLocal);
  }, []);
  
  // Función de búsqueda con debounce
  const performSearch = useCallback(async (searchQuery: string, filters?: any) => {
    const startTime = performance.now();
    setIsLoading(true);
    setIsError(false);
    setError(null);
    
    try {
      // Primero intentar búsqueda local
      const localResults = await searchLocalDB(searchQuery, filters);
      
      if (localResults.length > 0) {
        setResults(localResults);
        setSource('local');
        setResponseTime(performance.now() - startTime);
        setIsLoading(false);
        return;
      }
      
      // Si no hay resultados locales y no hay datos en IndexedDB, buscar en servidor
      if (!hasLocal || localResults.length === 0) {
        const params = new URLSearchParams();
        if (searchQuery) params.append('q', searchQuery);
        if (filters?.centro_costo) params.append('centro_costo', filters.centro_costo);
        if (filters?.marca) params.append('marca', filters.marca);
        if (filters?.area) params.append('area', filters.area);
        
        const response = await fetch(`/api/colaboradores?${params}`);
        
        if (!response.ok) {
          throw new Error('Error al buscar colaboradores');
        }
        
        const data = await response.json();
        setResults(data.data || []);
        setSource('server');
        setResponseTime(performance.now() - startTime);
        
        // Si obtuvimos datos del servidor, sincronizar con IndexedDB
        if (data.data && data.data.length > 0) {
          syncWithServer().then(() => {
            setHasLocal(true);
          });
        }
      }
      
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setIsError(true);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [hasLocal]);
  
  // Efecto para búsqueda con debounce
  useEffect(() => {
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Si no está habilitado, no buscar
    if (options.enabled === false) {
      return;
    }
    
    // Siempre buscar, incluso sin query (mostrar todos)
    // Removemos la condición que limpiaba resultados
    
    // Evitar búsquedas duplicadas (pero permitir búsqueda inicial vacía)
    const currentSearch = query + JSON.stringify(options.filters);
    if (currentSearch === lastQueryRef.current && results.length > 0 && query !== '') {
      return;
    }
    
    lastQueryRef.current = currentSearch;
    
    // Debounce de 150ms solo para búsquedas con texto, inmediato para carga inicial
    const debounceTime = query.length > 0 ? 150 : 0;
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query, options.filters);
    }, debounceTime);
    
    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, options.filters, options.enabled, performSearch]);
  
  // Función para sincronizar manualmente
  const sync = useCallback(async () => {
    setIsLoading(true);
    const success = await syncWithServer();
    if (success) {
      setHasLocal(true);
      // Reejecutar búsqueda actual con datos nuevos
      if (query || options.filters) {
        await performSearch(query, options.filters);
      }
    }
    setIsLoading(false);
    return success;
  }, [query, options.filters, performSearch]);
  
  return {
    results,
    isLoading,
    isError,
    error,
    source,
    responseTime,
    hasLocalData: hasLocal,
    sync,
  };
}

// Hook para obtener opciones de filtros
export function useFilterOptions() {
  const [options, setOptions] = useState({
    centrosCosto: [] as string[],
    marcas: [] as string[],
    areas: [] as string[],
    cargos: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/colaboradores/filters');
        if (response.ok) {
          const data = await response.json();
          setOptions(data.data);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOptions();
  }, []);
  
  return { options, isLoading };
}
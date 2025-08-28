import Dexie, { Table } from 'dexie';

export interface ColaboradorCache {
  id: string;
  nombre: string;
  codigo: string;
  cargo: string;
  ubicacion: string;
  telefono: string;
  celular?: string;
  celularCorporativo?: string;
  correo?: string;
  empresa: string;
  jefe?: string;
  etapa: string;
  sexo: string;
  cedula?: string;
  marca: string;
  area: string;
  tipo: string;
  direccion?: string;
  sector?: string;
  permanenciaDias?: number;
  permanenciaMeses?: number;
  fechaIngreso?: string;
  // Campo concatenado para búsqueda rápida
  searchTerms: string;
  lastUpdated: Date;
}

export interface SearchCache {
  query: string;
  filters: string;
  results: string[];
  timestamp: Date;
}

class ColaboradoresDB extends Dexie {
  colaboradores!: Table<ColaboradorCache>;
  searchCache!: Table<SearchCache>;
  metadata!: Table<{ key: string; value: any; timestamp: Date }>;

  constructor() {
    super('ColaboradoresDB');
    
    this.version(1).stores({
      colaboradores: 'id, codigo, *searchTerms, ubicacion, marca, area, cargo',
      searchCache: '[query+filters], timestamp',
      metadata: 'key'
    });
  }
}

export const db = new ColaboradoresDB();

// Función para preparar datos para búsqueda
function prepareSearchTerms(colaborador: any): string {
  const terms = [
    colaborador.nombre,
    colaborador.codigo,
    colaborador.cargo,
    colaborador.ubicacion,
    colaborador.area,
    colaborador.marca,
    colaborador.empresa,
    colaborador.jefe,
    colaborador.cedula,
    colaborador.correo,
    colaborador.sector
  ].filter(Boolean).join(' ').toLowerCase();
  
  // Eliminar acentos para búsqueda
  return terms.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Precargar todos los colaboradores
export async function preloadColaboradores(data: any[]) {
  try {
    const processedData = data.map(col => ({
      ...col,
      searchTerms: prepareSearchTerms(col),
      lastUpdated: new Date()
    }));
    
    await db.colaboradores.bulkPut(processedData);
    
    // Guardar metadata
    await db.metadata.put({
      key: 'lastSync',
      value: new Date().toISOString(),
      timestamp: new Date()
    });
    
    console.log(`✅ ${processedData.length} colaboradores guardados en IndexedDB`);
  } catch (error) {
    console.error('Error al guardar en IndexedDB:', error);
  }
}

// Búsqueda ultrarrápida en IndexedDB
export async function searchLocalDB(
  query: string,
  filters?: {
    centro_costo?: string;
    marca?: string;
    area?: string;
    cargo?: string;
  }
): Promise<ColaboradorCache[]> {
  const startTime = performance.now();
  
  // Si no hay query ni filtros, devolver todos los colaboradores
  if (!query && !filters?.centro_costo && !filters?.marca && !filters?.area && !filters?.cargo) {
    const results = await db.colaboradores.limit(200).toArray();
    console.log(`⚡ Local search (all): ${(performance.now() - startTime).toFixed(2)}ms`);
    return results;
  }
  
  const searchTerm = query?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || '';
  const cacheKey = JSON.stringify({ query: searchTerm, filters });
  
  // Buscar en caché de queries previas
  const cached = await db.searchCache
    .where('[query+filters]')
    .equals([searchTerm, JSON.stringify(filters)])
    .and(item => {
      const age = Date.now() - item.timestamp.getTime();
      return age < 5 * 60 * 1000; // Cache válido por 5 minutos
    })
    .first();
  
  if (cached) {
    const results = await db.colaboradores
      .where('id')
      .anyOf(cached.results)
      .toArray();
    
    console.log(`⚡ Cache hit: ${(performance.now() - startTime).toFixed(2)}ms`);
    return results;
  }
  
  // Búsqueda en datos locales
  let collection = db.colaboradores;
  let results = await collection.toArray();
  
  // Aplicar filtros primero
  if (filters) {
    if (filters.centro_costo) {
      results = results.filter(c => c.ubicacion === filters.centro_costo);
    }
    if (filters.marca) {
      results = results.filter(c => c.marca === filters.marca);
    }
    if (filters.area) {
      results = results.filter(c => c.area === filters.area);
    }
    if (filters.cargo) {
      results = results.filter(c => c.cargo === filters.cargo);
    }
  }
  
  // Luego aplicar búsqueda de texto
  if (searchTerm) {
    const searchWords = searchTerm.split(' ').filter(Boolean);
    
    results = results.filter(col => {
      // Búsqueda en searchTerms (ya normalizado)
      const matches = searchWords.every(word => 
        col.searchTerms.includes(word)
      );
      
      if (matches) return true;
      
      // Búsqueda exacta en campos específicos
      const exactMatch = 
        col.codigo?.toLowerCase() === searchTerm ||
        col.cedula?.toLowerCase().includes(searchTerm);
      
      return exactMatch;
    });
    
    // Ordenar por relevancia (los que empiezan con el término primero)
    results.sort((a, b) => {
      const aStartsWith = a.nombre.toLowerCase().startsWith(searchTerm) ? -1 : 0;
      const bStartsWith = b.nombre.toLowerCase().startsWith(searchTerm) ? -1 : 0;
      return aStartsWith - bStartsWith;
    });
  }
  
  // Limitar resultados
  results = results.slice(0, 50);
  
  // Guardar en caché
  if (results.length > 0) {
    await db.searchCache.put({
      query: searchTerm,
      filters: JSON.stringify(filters),
      results: results.map(r => r.id),
      timestamp: new Date()
    });
  }
  
  console.log(`⚡ Local search: ${(performance.now() - startTime).toFixed(2)}ms - ${results.length} resultados`);
  return results;
}

// Verificar si hay datos locales
export async function hasLocalData(): Promise<boolean> {
  const count = await db.colaboradores.count();
  return count > 0;
}

// Limpiar datos antiguos
export async function clearOldCache() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  await db.searchCache
    .where('timestamp')
    .below(oneHourAgo)
    .delete();
}

// Obtener metadata
export async function getLastSync(): Promise<Date | null> {
  const meta = await db.metadata.get('lastSync');
  return meta ? new Date(meta.value) : null;
}

// Sincronizar con servidor
export async function syncWithServer(): Promise<{ 
  success: boolean; 
  message: string; 
  newRecords?: number;
  updatedRecords?: number;
  totalRecords?: number;
}> {
  try {
    console.log('[SYNC] Iniciando sincronización con el servidor...');
    
    // Obtener datos actuales antes de sincronizar
    const currentData = await db.colaboradores.toArray();
    const currentCount = currentData.length;
    const lastSync = await getLastSync();
    
    console.log(`[SYNC] Datos locales actuales: ${currentCount} colaboradores`);
    
    const response = await fetch('/api/colaboradores', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      console.error('[SYNC] Error en respuesta del servidor:', response.status);
      return {
        success: false,
        message: 'Error al conectar con el servidor'
      };
    }
    
    const { data } = await response.json();
    console.log(`[SYNC] Datos recibidos del servidor: ${data?.length || 0} colaboradores`);
    
    if (!data || data.length === 0) {
      return {
        success: false,
        message: 'No se recibieron datos del servidor'
      };
    }
    
    // Crear mapa de datos existentes por ID para comparación rápida
    const existingMap = new Map(
      currentData.map(col => [col.id, col])
    );
    
    // Identificar registros nuevos y actualizados
    const newRecords: any[] = [];
    const updatedRecords: any[] = [];
    let hasChanges = false;
    
    for (const serverRecord of data) {
      const existingRecord = existingMap.get(serverRecord.id);
      
      if (!existingRecord) {
        // Es un registro nuevo
        newRecords.push(serverRecord);
        hasChanges = true;
      } else {
        // Verificar si hay cambios comparando campos clave
        const fieldsToCheck: (keyof ColaboradorCache)[] = ['nombre', 'cargo', 'ubicacion', 'celular', 'correo', 'jefe', 'area', 'marca'];
        const hasFieldChanges = fieldsToCheck.some(field => 
          existingRecord[field] !== serverRecord[field]
        );
        
        if (hasFieldChanges) {
          updatedRecords.push(serverRecord);
          hasChanges = true;
        }
      }
    }
    
    // Solo actualizar si hay cambios reales
    if (hasChanges || currentCount !== data.length) {
      await preloadColaboradores(data);
      // Limpiar caché de búsquedas para forzar actualización
      await db.searchCache.clear();
    }
    
    const newCount = await db.colaboradores.count();
    
    // Determinar mensaje basado en cambios
    let message = '';
    if (newRecords.length === 0 && updatedRecords.length === 0 && currentCount === newCount) {
      message = 'Ya tienes los datos más recientes ✓';
    } else if (newRecords.length > 0) {
      message = `${newRecords.length} nuevo${newRecords.length !== 1 ? 's' : ''} colaborador${newRecords.length !== 1 ? 'es' : ''} agregado${newRecords.length !== 1 ? 's' : ''}`;
    } else if (updatedRecords.length > 0) {
      message = `${updatedRecords.length} colaborador${updatedRecords.length !== 1 ? 'es' : ''} actualizado${updatedRecords.length !== 1 ? 's' : ''}`;
    } else if (currentCount !== newCount) {
      message = 'Base de datos sincronizada';
    } else {
      message = 'Sincronización completada';
    }
    
    console.log(`[SYNC] Sincronización completada: ${message}`);
    console.log(`[SYNC] Nuevos: ${newRecords.length}, Actualizados: ${updatedRecords.length}, Total: ${newCount}`);
    
    return {
      success: true,
      message,
      newRecords: newRecords.length,
      updatedRecords: updatedRecords.length,
      totalRecords: newCount
    };
  } catch (error) {
    console.error('[SYNC] Error sincronizando:', error);
    return {
      success: false,
      message: 'Error de conexión. Verifica tu internet'
    };
  }
}

// Verificar si hay actualizaciones disponibles
export async function checkForUpdates(): Promise<boolean> {
  try {
    const response = await fetch('/api/colaboradores?count=true');
    if (!response.ok) return false;
    
    const { total } = await response.json();
    const localCount = await db.colaboradores.count();
    
    return total !== localCount;
  } catch (error) {
    return false;
  }
}
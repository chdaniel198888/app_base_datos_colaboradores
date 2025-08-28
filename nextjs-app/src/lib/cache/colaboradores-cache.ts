import Airtable from 'airtable';

interface CachedColaborador {
  id: string;
  nombre: string;
  cargo?: string;
  ubicacion?: string;
  estado?: string;
  area?: string;
  marca?: string;
  jefe?: string;
  celular?: string;
  correo?: string;
  fecha_ingreso?: string;
  edad?: number;
  direccion?: string;
  empresa?: string;
  salario?: number;
  permanencia_meses?: number;
}

class ColaboradoresCache {
  private static instance: ColaboradoresCache;
  private cache: CachedColaborador[] = [];
  private lastUpdate: Date | null = null;
  private isLoading: boolean = false;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  
  private constructor() {}

  static getInstance(): ColaboradoresCache {
    if (!ColaboradoresCache.instance) {
      ColaboradoresCache.instance = new ColaboradoresCache();
    }
    return ColaboradoresCache.instance;
  }

  private async loadFromAirtable(): Promise<void> {
    if (this.isLoading) return;
    
    this.isLoading = true;
    console.log('🔄 Cargando datos de Airtable en caché...');
    
    try {
      const base = new Airtable({ 
        apiKey: process.env.AIRTABLE_API_KEY 
      }).base(process.env.AIRTABLE_BASE_ID!);

      const records = await base(process.env.AIRTABLE_TABLE_ID!)
        .select({
          view: process.env.AIRTABLE_VIEW_ID,
        })
        .all();

      this.cache = records.map((record) => ({
        id: record.id,
        nombre: record.get('nombre') as string,
        cargo: record.get('cargo') as string,
        ubicacion: record.get('centro_costo_copia') as string,
        estado: record.get('estado') as string,
        area: record.get('area') as string,
        marca: record.get('marca') as string,
        jefe: record.get('jefe_directo') as string,
        celular: record.get('celular') as string,
        correo: record.get('correo') as string,
        fecha_ingreso: record.get('fecha_ingreso') as string,
        edad: record.get('edad') as number,
        direccion: record.get('direccion_domicilio') as string,
        empresa: record.get('empresa') as string,
        salario: record.get('salario') as number,
        permanencia_meses: record.get('permanencia_meses') as number,
      }));

      this.lastUpdate = new Date();
      console.log(`✅ Cache actualizado: ${this.cache.length} colaboradores`);
    } catch (error) {
      console.error('❌ Error cargando caché:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async getColaboradores(): Promise<CachedColaborador[]> {
    // Si el cache está vacío o expirado, recargar
    if (!this.cache.length || this.isExpired()) {
      await this.loadFromAirtable();
    }
    
    return this.cache;
  }

  private isExpired(): boolean {
    if (!this.lastUpdate) return true;
    return Date.now() - this.lastUpdate.getTime() > this.CACHE_DURATION;
  }

  // Búsqueda rápida en memoria
  searchColaboradores(query: string): CachedColaborador[] {
    const lowerQuery = query.toLowerCase();
    return this.cache.filter(c => 
      c.nombre?.toLowerCase().includes(lowerQuery) ||
      c.cargo?.toLowerCase().includes(lowerQuery) ||
      c.ubicacion?.toLowerCase().includes(lowerQuery) ||
      c.area?.toLowerCase().includes(lowerQuery) ||
      c.marca?.toLowerCase().includes(lowerQuery)
    );
  }

  // Filtrado rápido en memoria
  filterColaboradores(filters: {
    estado?: string;
    ubicacion?: string;
    cargo?: string;
    area?: string;
    marca?: string;
  }): CachedColaborador[] {
    return this.cache.filter(c => {
      if (filters.estado && c.estado !== filters.estado) return false;
      if (filters.ubicacion && c.ubicacion !== filters.ubicacion) return false;
      if (filters.cargo && c.cargo !== filters.cargo) return false;
      if (filters.area && c.area !== filters.area) return false;
      if (filters.marca && c.marca !== filters.marca) return false;
      return true;
    });
  }

  // Estadísticas rápidas en memoria
  getEstadisticas(tipo: string): any {
    switch (tipo) {
      case 'total':
        const activos = this.cache.filter(c => c.estado === 'Activo').length;
        const inactivos = this.cache.filter(c => c.estado === 'Inactivo').length;
        return {
          total: this.cache.length,
          activos,
          inactivos,
          otros: this.cache.length - activos - inactivos,
        };

      case 'por_estado':
        const porEstado: Record<string, number> = {};
        this.cache.forEach(c => {
          const estado = c.estado || 'Sin estado';
          porEstado[estado] = (porEstado[estado] || 0) + 1;
        });
        return porEstado;

      case 'por_ubicacion':
        const porUbicacion: Record<string, number> = {};
        this.cache.forEach(c => {
          const ubicacion = c.ubicacion || 'Sin ubicación';
          porUbicacion[ubicacion] = (porUbicacion[ubicacion] || 0) + 1;
        });
        return porUbicacion;

      case 'por_cargo':
        const porCargo: Record<string, number> = {};
        this.cache.forEach(c => {
          const cargo = c.cargo || 'Sin cargo';
          porCargo[cargo] = (porCargo[cargo] || 0) + 1;
        });
        return porCargo;

      case 'por_area':
        const porArea: Record<string, number> = {};
        this.cache.forEach(c => {
          const area = c.area || 'Sin área';
          porArea[area] = (porArea[area] || 0) + 1;
        });
        return porArea;

      default:
        return { error: 'Tipo no válido' };
    }
  }

  // Organigrama rápido en memoria
  getOrganigrama(jefe?: string): any {
    const organigrama: Record<string, any[]> = {};

    this.cache.forEach((c) => {
      if (c.jefe) {
        if (!organigrama[c.jefe]) {
          organigrama[c.jefe] = [];
        }
        organigrama[c.jefe].push({
          nombre: c.nombre,
          cargo: c.cargo,
          ubicacion: c.ubicacion,
        });
      }
    });

    if (jefe) {
      return {
        jefe,
        equipo: organigrama[jefe] || [],
        totalReportes: organigrama[jefe]?.length || 0,
      };
    }

    return organigrama;
  }

  // Detalle rápido en memoria
  getColaboradorDetalle(nombre: string): CachedColaborador | null {
    return this.cache.find(c => c.nombre === nombre) || null;
  }

  // Forzar recarga del cache
  async refresh(): Promise<void> {
    this.cache = [];
    this.lastUpdate = null;
    await this.loadFromAirtable();
  }

  // Pre-calentar el cache (llamar al inicio de la app)
  async warmUp(): Promise<void> {
    if (!this.cache.length) {
      await this.loadFromAirtable();
    }
  }
}

export const colaboradoresCache = ColaboradoresCache.getInstance();
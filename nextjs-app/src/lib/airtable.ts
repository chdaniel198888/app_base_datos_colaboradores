import Airtable from 'airtable';
import { Colaborador } from '@/types/colaborador';

// Configuración correcta de Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!
}).base(process.env.AIRTABLE_BASE_ID!);

const table = base(process.env.AIRTABLE_TABLE_ID!);

export class AirtableService {
  // Obtener todos los colaboradores
  static async getAllColaboradores(): Promise<Colaborador[]> {
    try {
      const records: Colaborador[] = [];
      
      await table
        .select({
          view: process.env.AIRTABLE_VIEW_ID,
          maxRecords: 1000,
        })
        .eachPage((pageRecords, fetchNextPage) => {
          pageRecords.forEach((record) => {
            records.push({
              id: record.id,
              fields: record.fields as any,
              createdTime: record._rawJson.createdTime,
            });
          });
          fetchNextPage();
        });
      
      return records;
    } catch (error) {
      console.error('Error fetching from Airtable:', error);
      throw error;
    }
  }
  
  // Búsqueda con filtros
  static async searchColaboradores(query: string, filters?: any): Promise<Colaborador[]> {
    try {
      const filterFormulas: string[] = [];
      
      // Filtro de estado activo por defecto
      filterFormulas.push(`{estado} = 'Activo'`);
      
      // Agregar búsqueda por nombre si hay query (escapando comillas)
      if (query) {
        const escapedQuery = query.replace(/"/g, '\\"');
        filterFormulas.push(
          `OR(
            SEARCH(LOWER("${escapedQuery}"), LOWER({nombre})),
            SEARCH(LOWER("${escapedQuery}"), LOWER({cargo})),
            SEARCH("${escapedQuery}", {codigo_trabajador}),
            SEARCH(LOWER("${escapedQuery}"), LOWER({centro_costo_copia})),
            SEARCH("${escapedQuery}", {cedula})
          )`
        );
      }
      
      // Agregar filtros adicionales (escapando comillas simples)
      if (filters?.centro_costo) {
        const escapedValue = filters.centro_costo.replace(/'/g, "\\'");
        filterFormulas.push(`{centro_costo_copia} = '${escapedValue}'`);
      }
      if (filters?.marca) {
        const escapedValue = filters.marca.replace(/'/g, "\\'");
        filterFormulas.push(`{marca} = '${escapedValue}'`);
      }
      if (filters?.area) {
        const escapedValue = filters.area.replace(/'/g, "\\'");
        filterFormulas.push(`{area} = '${escapedValue}'`);
      }
      
      const formula = filterFormulas.length > 0 
        ? `AND(${filterFormulas.join(', ')})`
        : '';
      
      const records: Colaborador[] = [];
      
      await table
        .select({
          view: process.env.AIRTABLE_VIEW_ID,
          filterByFormula: formula,
          maxRecords: 100,
          sort: [{ field: 'nombre', direction: 'asc' }],
        })
        .eachPage((pageRecords, fetchNextPage) => {
          pageRecords.forEach((record) => {
            records.push({
              id: record.id,
              fields: record.fields as any,
              createdTime: record._rawJson.createdTime,
            });
          });
          fetchNextPage();
        });
      
      return records;
    } catch (error) {
      console.error('Error searching in Airtable:', error);
      throw error;
    }
  }
  
  // Obtener valores únicos para filtros
  static async getFilterOptions() {
    try {
      const colaboradores = await this.getAllColaboradores();
      
      const centrosCosto = [...new Set(colaboradores.map(c => c.fields.centro_costo_copia))].filter(Boolean).sort();
      const marcas = [...new Set(colaboradores.map(c => c.fields.marca))].filter(Boolean).sort();
      const areas = [...new Set(colaboradores.map(c => c.fields.area))].filter(Boolean).sort();
      const cargos = [...new Set(colaboradores.map(c => c.fields.cargo))].filter(Boolean).sort();
      
      return {
        centrosCosto,
        marcas,
        areas,
        cargos,
      };
    } catch (error) {
      console.error('Error getting filter options:', error);
      throw error;
    }
  }
}
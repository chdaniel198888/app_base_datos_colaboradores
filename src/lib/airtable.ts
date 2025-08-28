import Airtable from 'airtable';
import { Colaborador } from '@/types/colaborador';

// Configuración de Airtable
Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY!,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID!);
const table = base(process.env.AIRTABLE_TABLE_ID!);

export class AirtableService {
  // Obtener todos los colaboradores con caché
  static async getAllColaboradores(): Promise<Colaborador[]> {
    try {
      const records: Colaborador[] = [];
      
      await table
        .select({
          view: process.env.AIRTABLE_VIEW_ID,
          // Campos que necesitamos
          fields: [
            'Nombre',
            'Código Trabajador',
            'Cargo',
            'centro_costo_copia',
            'Celular',
            'Celular Coorporativo',
            'Cédula / Pasaporte',
            'Empresa',
            'Estado ',
            'jefe_directo',
            'Etapa',
            'Sexo ',
            'Correo',
            'Marca',
            'Área',
            'Tipo de trabajador',
            'Dirección Domicilio',
            'Sector de domicilio ',
            'Permanencia en Días',
            'Permanencia en Meses',
            'Fecha Ingreso',
            'Salario'
          ],
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
      filterFormulas.push(`{Estado } = 'Activo'`);
      
      // Agregar búsqueda por nombre si hay query
      if (query) {
        filterFormulas.push(
          `OR(
            SEARCH(LOWER("${query}"), LOWER({Nombre})),
            SEARCH(LOWER("${query}"), LOWER({Cargo})),
            SEARCH("${query}", {Código Trabajador}),
            SEARCH(LOWER("${query}"), LOWER({centro_costo_copia}))
          )`
        );
      }
      
      // Agregar filtros adicionales
      if (filters?.centro_costo) {
        filterFormulas.push(`{centro_costo_copia} = '${filters.centro_costo}'`);
      }
      if (filters?.marca) {
        filterFormulas.push(`{Marca} = '${filters.marca}'`);
      }
      if (filters?.area) {
        filterFormulas.push(`{Área} = '${filters.area}'`);
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
          sort: [{ field: 'Nombre', direction: 'asc' }],
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
      const marcas = [...new Set(colaboradores.map(c => c.fields.Marca))].filter(Boolean).sort();
      const areas = [...new Set(colaboradores.map(c => c.fields['Área']))].filter(Boolean).sort();
      const cargos = [...new Set(colaboradores.map(c => c.fields.Cargo))].filter(Boolean).sort();
      
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
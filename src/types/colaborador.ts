export interface Colaborador {
  id: string;
  fields: {
    // Campos principales para búsqueda y visualización
    Nombre: string;
    'Código Trabajador': string;
    Cargo: string;
    centro_costo_copia: string; // Ubicación/Tienda
    Celular?: string;
    'Celular Coorporativo'?: string;
    'Cédula / Pasaporte'?: string;
    Empresa: string;
    'Estado ': string;
    jefe_directo?: string;
    Etapa: string;
    'Sexo ': string;
    Correo?: string;
    
    // Campos adicionales para filtros
    Marca: string;
    'Área': string;
    'Tipo de trabajador': string;
    
    // Campos de ubicación
    'Dirección Domicilio'?: string;
    'Sector de domicilio '?: string;
    
    // Campos calculados/adicionales
    'Permanencia en Días'?: number;
    'Permanencia en Meses'?: number;
    'Fecha Ingreso'?: string;
    Salario?: number;
  };
  createdTime?: string;
}

export interface SearchFilters {
  nombre?: string;
  centro_costo?: string;
  marca?: string;
  area?: string;
  cargo?: string;
}
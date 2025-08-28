export interface Colaborador {
  id: string;
  fields: {
    // Campos principales para búsqueda y visualización (nombres actualizados)
    nombre: string;
    codigo_trabajador: string;
    cargo: string;
    centro_costo_copia: string; // Ubicación/Tienda
    celular?: string;
    celular_corporativo?: string; // Note: no existe en los datos actuales
    cedula?: string;
    empresa: string;
    estado: string;
    jefe_directo?: string;
    etapa: string;
    sexo: string;
    correo?: string;
    
    // Campos adicionales para filtros
    marca: string;
    area: string;
    tipo_trabajador: string;
    
    // Campos de ubicación
    direccion_domicilio?: string;
    secto_domicilio?: string; // Note: está como "secto" no "sector"
    
    // Campos calculados/adicionales
    permanencia_dias?: number;
    permanencia_meses?: number;
    fecha_ingreso?: string;
    salario?: number;
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
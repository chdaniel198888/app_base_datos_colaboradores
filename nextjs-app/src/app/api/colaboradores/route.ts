import { NextRequest, NextResponse } from 'next/server';
import { AirtableService } from '@/lib/airtable';

// Quitamos runtime edge porque no es compatible con Airtable
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const centro_costo = searchParams.get('centro_costo');
    const marca = searchParams.get('marca');
    const area = searchParams.get('area');
    
    // Si solo piden el conteo total (para verificar actualizaciones)
    if (searchParams.get('count') === 'true') {
      const allColaboradores = await AirtableService.getAllColaboradores();
      const activeCount = allColaboradores.filter(c => c.fields.estado === 'Activo').length;
      return NextResponse.json({ 
        success: true,
        total: activeCount 
      });
    }
    
    let colaboradores;
    
    if (!query && !centro_costo && !marca && !area) {
      // Si no hay filtros, devolver todos
      colaboradores = await AirtableService.getAllColaboradores();
    } else {
      // Aplicar búsqueda y filtros
      colaboradores = await AirtableService.searchColaboradores(query, {
        centro_costo,
        marca,
        area,
      });
    }
    
    // Filtrar solo activos y procesar SOLO los campos que definimos
    const activeColaboradores = colaboradores
      .filter(c => c.fields.estado === 'Activo')
      .map(c => ({
        id: c.id,
        // Campos principales que definiste
        nombre: c.fields.nombre,
        codigo: c.fields.codigo_trabajador,
        cargo: c.fields.cargo,
        ubicacion: c.fields.centro_costo_copia, // Esta es la ubicación
        celular: c.fields.celular,
        // No existe celular_corporativo en los datos actuales, solo celular
        correo: c.fields.correo,
        cedula: c.fields.cedula,
        empresa: c.fields.empresa,
        estado: c.fields.estado,
        jefe: c.fields.jefe_directo,
        etapa: c.fields.etapa,
        sexo: c.fields.sexo,
        // Campos para organización estética
        area: c.fields.area,
        marca: c.fields.marca,
        direccion: c.fields.direccion_domicilio,
        permanenciaMeses: c.fields.permanencia_meses,
      }));
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      count: activeColaboradores.length,
      responseTime,
      data: activeColaboradores,
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al obtener colaboradores',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
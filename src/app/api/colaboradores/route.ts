import { NextRequest, NextResponse } from 'next/server';
import { AirtableService } from '@/lib/airtable';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const centro_costo = searchParams.get('centro_costo');
    const marca = searchParams.get('marca');
    const area = searchParams.get('area');
    
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
    
    // Filtrar solo activos y procesar datos
    const activeColaboradores = colaboradores
      .filter(c => c.fields['Estado '] === 'Activo')
      .map(c => ({
        id: c.id,
        nombre: c.fields.Nombre,
        codigo: c.fields['Código Trabajador'],
        cargo: c.fields.Cargo,
        ubicacion: c.fields.centro_costo_copia,
        telefono: c.fields['Celular Coorporativo'] || c.fields.Celular,
        celular: c.fields.Celular,
        celularCorporativo: c.fields['Celular Coorporativo'],
        correo: c.fields.Correo,
        empresa: c.fields.Empresa,
        jefe: c.fields.jefe_directo,
        etapa: c.fields.Etapa,
        sexo: c.fields['Sexo '],
        cedula: c.fields['Cédula / Pasaporte'],
        marca: c.fields.Marca,
        area: c.fields['Área'],
        tipo: c.fields['Tipo de trabajador'],
        direccion: c.fields['Dirección Domicilio'],
        sector: c.fields['Sector de domicilio '],
        permanenciaDias: c.fields['Permanencia en Días'],
        permanenciaMeses: c.fields['Permanencia en Meses'],
        fechaIngreso: c.fields['Fecha Ingreso'],
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
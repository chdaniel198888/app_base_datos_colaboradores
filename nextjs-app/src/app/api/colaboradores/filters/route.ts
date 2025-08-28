import { NextResponse } from 'next/server';
import { AirtableService } from '@/lib/airtable';

export async function GET() {
  try {
    const filters = await AirtableService.getFilterOptions();
    
    return NextResponse.json({
      success: true,
      data: filters,
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al obtener opciones de filtros',
      },
      { status: 500 }
    );
  }
}
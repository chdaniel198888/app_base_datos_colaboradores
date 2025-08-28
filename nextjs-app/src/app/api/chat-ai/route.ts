import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Airtable from 'airtable';

// Configurar OpenAI - usar GPT-3.5 si no tienes GPT-4
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-dummy-key-for-testing',
});

// Configurar Airtable
const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_API_KEY 
}).base(process.env.AIRTABLE_BASE_ID!);

// Definir las funciones disponibles para el AI
const functions = [
  {
    name: 'buscar_colaboradores',
    description: 'Busca colaboradores por nombre, cargo o ubicación',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Término de búsqueda (nombre, cargo o ubicación)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'obtener_estadisticas',
    description: 'Obtiene estadísticas y análisis del equipo',
    parameters: {
      type: 'object',
      properties: {
        tipo: {
          type: 'string',
          enum: ['total', 'por_estado', 'por_ubicacion', 'por_cargo', 'por_area'],
          description: 'Tipo de estadística a obtener',
        },
      },
      required: ['tipo'],
    },
  },
  {
    name: 'obtener_organigrama',
    description: 'Obtiene la estructura organizacional y jerarquía',
    parameters: {
      type: 'object',
      properties: {
        jefe: {
          type: 'string',
          description: 'Nombre del jefe para ver su equipo (opcional)',
        },
      },
    },
  },
  {
    name: 'obtener_colaborador_detalle',
    description: 'Obtiene información detallada de un colaborador específico',
    parameters: {
      type: 'object',
      properties: {
        nombre: {
          type: 'string',
          description: 'Nombre del colaborador',
        },
      },
      required: ['nombre'],
    },
  },
  {
    name: 'filtrar_colaboradores',
    description: 'Filtra colaboradores por múltiples criterios',
    parameters: {
      type: 'object',
      properties: {
        estado: {
          type: 'string',
          description: 'Estado del colaborador (Activo, Inactivo, etc.)',
        },
        ubicacion: {
          type: 'string',
          description: 'Centro de costo o ubicación',
        },
        cargo: {
          type: 'string',
          description: 'Cargo del colaborador',
        },
        area: {
          type: 'string',
          description: 'Área de trabajo',
        },
        marca: {
          type: 'string',
          description: 'Marca o restaurante',
        },
      },
    },
  },
];

// Implementar las funciones
async function buscarColaboradores(query: string) {
  try {
    const records = await base(process.env.AIRTABLE_TABLE_ID!)
      .select({
        view: process.env.AIRTABLE_VIEW_ID,
        filterByFormula: `OR(
          SEARCH(LOWER("${query}"), LOWER({nombre})),
          SEARCH(LOWER("${query}"), LOWER({cargo})),
          SEARCH(LOWER("${query}"), LOWER({centro_costo_copia})),
          SEARCH(LOWER("${query}"), LOWER({area})),
          SEARCH(LOWER("${query}"), LOWER({marca}))
        )`,
      })
      .all();

    return records.map((record) => ({
      nombre: record.get('nombre'),
      cargo: record.get('cargo'),
      ubicacion: record.get('centro_costo_copia'),
      estado: record.get('estado'),
      area: record.get('area'),
      marca: record.get('marca'),
      jefe: record.get('jefe_directo'),
      celular: record.get('celular'),
      email: record.get('correo'),
    }));
  } catch (error) {
    console.error('Error buscando colaboradores:', error);
    return [];
  }
}

async function obtenerEstadisticas(tipo: string) {
  try {
    const records = await base(process.env.AIRTABLE_TABLE_ID!)
      .select({
        view: process.env.AIRTABLE_VIEW_ID,
      })
      .all();

    const colaboradores = records.map((r) => ({
      nombre: r.get('nombre'),
      estado: r.get('estado'),
      ubicacion: r.get('centro_costo_copia'),
      cargo: r.get('cargo'),
      area: r.get('area'),
      marca: r.get('marca'),
    }));

    switch (tipo) {
      case 'total':
        const activos = colaboradores.filter(c => c.estado === 'Activo').length;
        const inactivos = colaboradores.filter(c => c.estado === 'Inactivo').length;
        return {
          total: colaboradores.length,
          activos,
          inactivos,
          otros: colaboradores.length - activos - inactivos,
        };

      case 'por_estado':
        const porEstado: Record<string, number> = {};
        colaboradores.forEach(c => {
          const estado = String(c.estado || 'Sin estado');
          porEstado[estado] = (porEstado[estado] || 0) + 1;
        });
        return porEstado;

      case 'por_ubicacion':
        const porUbicacion: Record<string, number> = {};
        colaboradores.forEach(c => {
          const ubicacion = String(c.ubicacion || 'Sin ubicación');
          porUbicacion[ubicacion] = (porUbicacion[ubicacion] || 0) + 1;
        });
        return porUbicacion;

      case 'por_cargo':
        const porCargo: Record<string, number> = {};
        colaboradores.forEach(c => {
          const cargo = String(c.cargo || 'Sin cargo');
          porCargo[cargo] = (porCargo[cargo] || 0) + 1;
        });
        return porCargo;

      case 'por_area':
        const porArea: Record<string, number> = {};
        colaboradores.forEach(c => {
          const area = String(c.area || 'Sin área');
          porArea[area] = (porArea[area] || 0) + 1;
        });
        return porArea;

      default:
        return { error: 'Tipo de estadística no válido' };
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return { error: 'Error al obtener estadísticas' };
  }
}

async function obtenerOrganigrama(jefe?: string) {
  try {
    const records = await base(process.env.AIRTABLE_TABLE_ID!)
      .select({
        view: process.env.AIRTABLE_VIEW_ID,
        filterByFormula: `{estado} = "Activo"`,
      })
      .all();

    const colaboradores = records.map((r) => ({
      nombre: r.get('nombre') as string,
      jefe: r.get('jefe_directo') as string,
      cargo: r.get('cargo') as string,
      ubicacion: r.get('centro_costo_copia') as string,
    }));

    const organigrama: Record<string, any[]> = {};

    colaboradores.forEach((c) => {
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
  } catch (error) {
    console.error('Error obteniendo organigrama:', error);
    return { error: 'Error al obtener organigrama' };
  }
}

async function obtenerColaboradorDetalle(nombre: string) {
  try {
    const records = await base(process.env.AIRTABLE_TABLE_ID!)
      .select({
        view: process.env.AIRTABLE_VIEW_ID,
        filterByFormula: `{nombre} = "${nombre}"`,
        maxRecords: 1,
      })
      .all();

    if (records.length === 0) {
      return { error: 'Colaborador no encontrado' };
    }

    const record = records[0];
    return {
      nombre: record.get('nombre'),
      cedula: record.get('cedula'),
      cargo: record.get('cargo'),
      ubicacion: record.get('centro_costo_copia'),
      estado: record.get('estado'),
      area: record.get('area'),
      marca: record.get('marca'),
      jefe_directo: record.get('jefe_directo'),
      celular: record.get('celular'),
      correo: record.get('correo'),
      fecha_ingreso: record.get('fecha_ingreso'),
      edad: record.get('edad'),
      direccion: record.get('direccion_domicilio'),
      empresa: record.get('empresa'),
      salario: record.get('salario'),
      permanencia_meses: record.get('permanencia_meses'),
    };
  } catch (error) {
    console.error('Error obteniendo detalle:', error);
    return { error: 'Error al obtener información del colaborador' };
  }
}

async function filtrarColaboradores(filtros: any) {
  try {
    const conditions = [];
    
    if (filtros.estado) {
      conditions.push(`{estado} = "${filtros.estado}"`);
    }
    if (filtros.ubicacion) {
      conditions.push(`{centro_costo_copia} = "${filtros.ubicacion}"`);
    }
    if (filtros.cargo) {
      conditions.push(`{cargo} = "${filtros.cargo}"`);
    }
    if (filtros.area) {
      conditions.push(`{area} = "${filtros.area}"`);
    }
    if (filtros.marca) {
      conditions.push(`{marca} = "${filtros.marca}"`);
    }

    let filterFormula = '';
    if (conditions.length > 0) {
      filterFormula = conditions.length === 1 
        ? conditions[0] 
        : `AND(${conditions.join(',')})`;
    }

    const records = await base(process.env.AIRTABLE_TABLE_ID!)
      .select({
        view: process.env.AIRTABLE_VIEW_ID,
        ...(filterFormula && { filterByFormula: filterFormula }),
      })
      .all();

    return records.map((record) => ({
      nombre: record.get('nombre'),
      cargo: record.get('cargo'),
      ubicacion: record.get('centro_costo_copia'),
      estado: record.get('estado'),
      area: record.get('area'),
      marca: record.get('marca'),
    }));
  } catch (error) {
    console.error('Error filtrando colaboradores:', error);
    return [];
  }
}

// Ejecutar función basada en el nombre
async function ejecutarFuncion(functionName: string, args: any) {
  console.log(`Ejecutando función: ${functionName} con args:`, args);
  
  switch (functionName) {
    case 'buscar_colaboradores':
      return await buscarColaboradores(args.query);
    case 'obtener_estadisticas':
      return await obtenerEstadisticas(args.tipo);
    case 'obtener_organigrama':
      return await obtenerOrganigrama(args.jefe);
    case 'obtener_colaborador_detalle':
      return await obtenerColaboradorDetalle(args.nombre);
    case 'filtrar_colaboradores':
      return await filtrarColaboradores(args);
    default:
      return { error: 'Función no reconocida' };
  }
}

// Contexto de conversación (en producción esto debería estar en una base de datos)
const conversationHistory: Record<string, any[]> = {};

export async function POST(request: Request) {
  try {
    const { message, sessionId = 'default' } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      );
    }

    // Si no hay API key de OpenAI, usar el sistema básico
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-dummy-key-for-testing') {
      return NextResponse.json({
        response: `⚠️ Chat AI no configurado. Para habilitar el chat inteligente:

1. Obtén una API key de OpenAI en https://platform.openai.com/api-keys
2. Agrégala en el archivo .env.local:
   OPENAI_API_KEY=tu_api_key_aqui

3. Reinicia el servidor

Configura el API key para habilitar el asistente con inteligencia artificial.`,
        needsConfiguration: true
      });
    }

    // Inicializar o recuperar historial de conversación
    if (!conversationHistory[sessionId]) {
      conversationHistory[sessionId] = [
        {
          role: 'system',
          content: `Eres un asistente inteligente para gestión de recursos humanos de la empresa Foodix. 
          Tienes acceso a una base de datos de colaboradores y puedes:
          - Buscar colaboradores por nombre, cargo, ubicación
          - Obtener estadísticas y análisis del equipo
          - Mostrar organigramas y estructuras jerárquicas
          - Filtrar colaboradores por múltiples criterios
          - Proporcionar información detallada de cada colaborador
          
          Sé amigable, profesional y proactivo. Si el usuario hace preguntas vagas, sugiere opciones específicas.
          Cuando muestres listas largas, limita a los primeros 10-15 resultados y menciona cuántos más hay.
          Usa emojis cuando sea apropiado para hacer la conversación más amigable.
          Responde en español.`
        }
      ];
    }

    // Agregar mensaje del usuario al historial
    conversationHistory[sessionId].push({
      role: 'user',
      content: message
    });

    // Limitar historial a últimos 10 mensajes para no exceder límites
    if (conversationHistory[sessionId].length > 11) {
      conversationHistory[sessionId] = [
        conversationHistory[sessionId][0], // Mantener system message
        ...conversationHistory[sessionId].slice(-10)
      ];
    }

    // Llamar a OpenAI con funciones
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Modelo actualizado, usa 'gpt-4' si tienes acceso
      messages: conversationHistory[sessionId],
      functions: functions,
      function_call: 'auto',
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseMessage = completion.choices[0].message;

    // Si el modelo quiere llamar a una función
    if (responseMessage.function_call) {
      const functionName = responseMessage.function_call.name;
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      
      // Ejecutar la función
      const functionResult = await ejecutarFuncion(functionName, functionArgs);
      
      // Agregar la respuesta de la función al historial
      conversationHistory[sessionId].push(responseMessage);
      conversationHistory[sessionId].push({
        role: 'function',
        name: functionName,
        content: JSON.stringify(functionResult)
      });

      // Obtener respuesta final del modelo con el resultado de la función
      const secondCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: conversationHistory[sessionId],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const finalResponse = secondCompletion.choices[0].message.content;
      
      // Agregar respuesta final al historial
      conversationHistory[sessionId].push(secondCompletion.choices[0].message);

      return NextResponse.json({ 
        response: finalResponse,
        functionCalled: functionName 
      });
    }

    // Si no hay llamada a función, devolver respuesta directa
    conversationHistory[sessionId].push(responseMessage);
    
    return NextResponse.json({ 
      response: responseMessage.content 
    });

  } catch (error) {
    console.error('Error en chat AI:', error);
    
    // Si es un error de API key
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json({
        response: '⚠️ Error con la API key de OpenAI. Por favor verifica que esté configurada correctamente en .env.local',
        error: true
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Error procesando la solicitud',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { colaboradoresCache } from '@/lib/cache/colaboradores-cache';

// Configurar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Pre-calentar cache al iniciar
colaboradoresCache.warmUp().catch(console.error);

// Definir las funciones disponibles (mismas que antes pero más rápidas)
const functions = [
  {
    name: 'buscar_colaboradores',
    description: 'Busca colaboradores por nombre, cargo o ubicación',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Término de búsqueda',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'obtener_estadisticas',
    description: 'Obtiene estadísticas del equipo',
    parameters: {
      type: 'object',
      properties: {
        tipo: {
          type: 'string',
          enum: ['total', 'por_estado', 'por_ubicacion', 'por_cargo', 'por_area'],
        },
      },
      required: ['tipo'],
    },
  },
  {
    name: 'obtener_organigrama',
    description: 'Obtiene la estructura organizacional',
    parameters: {
      type: 'object',
      properties: {
        jefe: {
          type: 'string',
          description: 'Nombre del jefe (opcional)',
        },
      },
    },
  },
  {
    name: 'obtener_colaborador_detalle',
    description: 'Obtiene información detallada de un colaborador',
    parameters: {
      type: 'object',
      properties: {
        nombre: {
          type: 'string',
        },
      },
      required: ['nombre'],
    },
  },
  {
    name: 'filtrar_colaboradores',
    description: 'Filtra colaboradores por criterios',
    parameters: {
      type: 'object',
      properties: {
        estado: { type: 'string' },
        ubicacion: { type: 'string' },
        cargo: { type: 'string' },
        area: { type: 'string' },
        marca: { type: 'string' },
      },
    },
  },
];

// Ejecutar función usando CACHE (instantáneo)
async function ejecutarFuncion(functionName: string, args: any) {
  // Asegurar que el cache esté listo
  await colaboradoresCache.getColaboradores();
  
  switch (functionName) {
    case 'buscar_colaboradores':
      return colaboradoresCache.searchColaboradores(args.query);
    
    case 'obtener_estadisticas':
      return colaboradoresCache.getEstadisticas(args.tipo);
    
    case 'obtener_organigrama':
      return colaboradoresCache.getOrganigrama(args.jefe);
    
    case 'obtener_colaborador_detalle':
      return colaboradoresCache.getColaboradorDetalle(args.nombre);
    
    case 'filtrar_colaboradores':
      return colaboradoresCache.filterColaboradores(args);
    
    default:
      return { error: 'Función no reconocida' };
  }
}

// Historial de conversación (en producción usar Redis o similar)
const conversationHistory: Record<string, any[]> = {};

// Función para crear un stream de respuesta
async function* streamChatResponse(
  messages: any[],
  functionResult?: any,
  functionName?: string
) {
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
      stream: true, // ¡Activar streaming!
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    yield `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`;
  }
}

export async function POST(request: Request) {
  try {
    const { message, sessionId = 'default' } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    // Verificar API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        response: '⚠️ Configura OPENAI_API_KEY en .env.local',
        needsConfiguration: true
      });
    }

    // Inicializar historial
    if (!conversationHistory[sessionId]) {
      conversationHistory[sessionId] = [
        {
          role: 'system',
          content: `Eres un asistente de RRHH para Foodix. Sé breve, amigable y preciso. 
          Usa las funciones disponibles para obtener datos reales.
          Responde en español con emojis cuando sea apropiado.`
        }
      ];
    }

    // Agregar mensaje del usuario
    conversationHistory[sessionId].push({ role: 'user', content: message });

    // Limitar historial
    if (conversationHistory[sessionId].length > 11) {
      conversationHistory[sessionId] = [
        conversationHistory[sessionId][0],
        ...conversationHistory[sessionId].slice(-10)
      ];
    }

    // Primera llamada para determinar si necesita función
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversationHistory[sessionId],
      functions: functions,
      function_call: 'auto',
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseMessage = completion.choices[0].message;

    // Si necesita llamar a una función
    if (responseMessage.function_call) {
      const functionName = responseMessage.function_call.name;
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      
      // Ejecutar función CON CACHE (instantáneo)
      const startTime = Date.now();
      const functionResult = await ejecutarFuncion(functionName, functionArgs);
      const executionTime = Date.now() - startTime;
      console.log(`⚡ Función ${functionName} ejecutada en ${executionTime}ms`);
      
      // Agregar al historial
      conversationHistory[sessionId].push(responseMessage);
      conversationHistory[sessionId].push({
        role: 'function',
        name: functionName,
        content: JSON.stringify(functionResult)
      });

      // Configurar streaming de respuesta
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          // Enviar metadata primero
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'metadata',
            functionCalled: functionName,
            executionTime
          })}\n\n`));

          // Stream de la respuesta
          for await (const chunk of streamChatResponse(conversationHistory[sessionId])) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'content',
              content: chunk
            })}\n\n`));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Si no hay función, streaming directo
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of streamChatResponse(conversationHistory[sessionId])) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'content',
            content: chunk
          })}\n\n`));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    // Agregar respuesta al historial
    conversationHistory[sessionId].push(responseMessage);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error en chat AI rápido:', error);
    return NextResponse.json(
      { 
        error: 'Error procesando la solicitud',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Endpoint para forzar recarga del cache
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  if (searchParams.get('refresh') === 'true') {
    await colaboradoresCache.refresh();
    return NextResponse.json({ 
      success: true, 
      message: 'Cache actualizado'
    });
  }

  return NextResponse.json({ 
    status: 'healthy',
    cacheStatus: 'ready'
  });
}
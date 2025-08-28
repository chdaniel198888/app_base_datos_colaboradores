#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import Airtable from 'airtable';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
// Cargar variables de entorno manualmente sin dotenv para evitar output
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');
// Leer .env manualmente
const envConfig = {};
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim();
            envConfig[key] = value;
            process.env[key] = value;
        }
    });
}
// Configurar Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
// Definir herramientas disponibles
const TOOLS = [
    {
        name: 'buscar_colaborador',
        description: 'Busca colaboradores por nombre, cargo o local',
        inputSchema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Término de búsqueda (nombre, cargo o local)',
                },
            },
            required: ['query'],
        },
    },
    {
        name: 'listar_colaboradores',
        description: 'Lista todos los colaboradores con opción de filtrar por estado',
        inputSchema: {
            type: 'object',
            properties: {
                estado: {
                    type: 'string',
                    description: 'Filtrar por estado (Activo, Inactivo, etc.)',
                    enum: ['Activo', 'Inactivo', 'Vacaciones', 'Licencia'],
                },
                local: {
                    type: 'string',
                    description: 'Filtrar por local',
                },
            },
        },
    },
    {
        name: 'obtener_colaborador',
        description: 'Obtiene información detallada de un colaborador específico',
        inputSchema: {
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
        name: 'analizar_equipo',
        description: 'Analiza métricas del equipo (total, por local, por cargo, etc.)',
        inputSchema: {
            type: 'object',
            properties: {
                tipo_analisis: {
                    type: 'string',
                    description: 'Tipo de análisis a realizar',
                    enum: ['resumen', 'por_local', 'por_cargo', 'organigrama'],
                },
            },
            required: ['tipo_analisis'],
        },
    },
];
// Función para buscar colaboradores
async function buscarColaborador(query) {
    try {
        const records = await base(process.env.AIRTABLE_TABLE_ID)
            .select({
            view: process.env.AIRTABLE_VIEW_ID,
            filterByFormula: `OR(
          SEARCH(LOWER("${query}"), LOWER({nombre})),
          SEARCH(LOWER("${query}"), LOWER({cargo})),
          SEARCH(LOWER("${query}"), LOWER({centro_costo_copia}))
        )`
        })
            .all();
        return records.map(record => ({
            id: record.id,
            nombre: record.get('nombre'),
            cargo: record.get('cargo'),
            local: record.get('centro_costo_copia'),
            estado: record.get('estado'),
            reportaA: record.get('jefe_directo'),
            email: record.get('correo'),
            celular: record.get('celular')
        }));
    }
    catch (error) {
        return [];
    }
}
// Función para listar colaboradores
async function listarColaboradores(estado, local) {
    try {
        let filterFormula = '';
        const filters = [];
        if (estado) {
            filters.push(`{estado} = "${estado}"`);
        }
        if (local) {
            filters.push(`{centro_costo_copia} = "${local}"`);
        }
        if (filters.length > 0) {
            filterFormula = filters.length === 1 ? filters[0] : `AND(${filters.join(',')})`;
        }
        const records = await base(process.env.AIRTABLE_TABLE_ID)
            .select({
            view: process.env.AIRTABLE_VIEW_ID,
            ...(filterFormula && { filterByFormula: filterFormula })
        })
            .all();
        return records.map(record => ({
            id: record.id,
            nombre: record.get('nombre'),
            cargo: record.get('cargo'),
            local: record.get('centro_costo_copia'),
            estado: record.get('estado'),
            reportaA: record.get('jefe_directo'),
            email: record.get('correo'),
            celular: record.get('celular')
        }));
    }
    catch (error) {
        return [];
    }
}
// Función para obtener un colaborador específico
async function obtenerColaborador(nombre) {
    try {
        const records = await base(process.env.AIRTABLE_TABLE_ID)
            .select({
            view: process.env.AIRTABLE_VIEW_ID,
            filterByFormula: `{nombre} = "${nombre}"`,
            maxRecords: 1
        })
            .all();
        if (records.length === 0) {
            return null;
        }
        const record = records[0];
        return {
            id: record.id,
            nombre: record.get('nombre'),
            cargo: record.get('cargo'),
            local: record.get('centro_costo_copia'),
            estado: record.get('estado'),
            reportaA: record.get('jefe_directo'),
            email: record.get('correo'),
            celular: record.get('celular')
        };
    }
    catch (error) {
        return null;
    }
}
// Función para analizar el equipo
async function analizarEquipo(tipoAnalisis) {
    try {
        const colaboradores = await listarColaboradores();
        switch (tipoAnalisis) {
            case 'resumen':
                const activos = colaboradores.filter(c => c.estado === 'Activo').length;
                const inactivos = colaboradores.filter(c => c.estado === 'Inactivo').length;
                return {
                    total: colaboradores.length,
                    activos,
                    inactivos,
                    otros: colaboradores.length - activos - inactivos
                };
            case 'por_local':
                const porLocal = {};
                colaboradores.forEach(c => {
                    if (c.local) {
                        porLocal[c.local] = (porLocal[c.local] || 0) + 1;
                    }
                });
                return porLocal;
            case 'por_cargo':
                const porCargo = {};
                colaboradores.forEach(c => {
                    if (c.cargo) {
                        porCargo[c.cargo] = (porCargo[c.cargo] || 0) + 1;
                    }
                });
                return porCargo;
            case 'organigrama':
                const organigrama = {};
                colaboradores.forEach(c => {
                    if (c.reportaA) {
                        if (!organigrama[c.reportaA]) {
                            organigrama[c.reportaA] = [];
                        }
                        organigrama[c.reportaA].push(c.nombre);
                    }
                });
                return organigrama;
            default:
                return { error: 'Tipo de análisis no válido' };
        }
    }
    catch (error) {
        return { error: 'Error al analizar' };
    }
}
// Crear servidor MCP
const server = new Server({
    name: process.env.MCP_SERVER_NAME || 'colaboradores-assistant',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// Manejar solicitud de lista de herramientas
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
}));
// Manejar llamadas a herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'buscar_colaborador':
                const resultadosBusqueda = await buscarColaborador(args.query);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(resultadosBusqueda, null, 2),
                        },
                    ],
                };
            case 'listar_colaboradores':
                const listaColaboradores = await listarColaboradores(args?.estado, args?.local);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(listaColaboradores, null, 2),
                        },
                    ],
                };
            case 'obtener_colaborador':
                const colaborador = await obtenerColaborador(args.nombre);
                return {
                    content: [
                        {
                            type: 'text',
                            text: colaborador
                                ? JSON.stringify(colaborador, null, 2)
                                : 'Colaborador no encontrado',
                        },
                    ],
                };
            case 'analizar_equipo':
                const analisis = await analizarEquipo(args.tipo_analisis);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(analisis, null, 2),
                        },
                    ],
                };
            default:
                throw new Error(`Herramienta desconocida: ${name}`);
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
                },
            ],
        };
    }
});
// Función principal
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
// Iniciar servidor sin output
main().catch(() => {
    process.exit(1);
});
//# sourceMappingURL=server-clean.js.map
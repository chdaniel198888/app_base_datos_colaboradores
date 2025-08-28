#!/usr/bin/env node

// Script simple para probar el servidor MCP
import { spawn } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Iniciando servidor MCP de Colaboradores...\n');

// Iniciar el servidor
const server = spawn('node', ['dist/server.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

// Manejar salida del servidor
server.stdout.on('data', (data) => {
  try {
    const response = JSON.parse(data.toString());
    console.log('Respuesta del servidor:', JSON.stringify(response, null, 2));
  } catch (e) {
    console.log('Salida del servidor:', data.toString());
  }
});

// Función para enviar comandos al servidor
function sendCommand(command) {
  server.stdin.write(JSON.stringify(command) + '\n');
}

// Inicializar conexión
console.log('📡 Enviando solicitud de inicialización...\n');
sendCommand({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '0.1.0',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
});

// Esperar un momento y luego solicitar lista de herramientas
setTimeout(() => {
  console.log('🔧 Solicitando lista de herramientas disponibles...\n');
  sendCommand({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  });
}, 1000);

// Ejemplo de uso de herramienta
setTimeout(() => {
  console.log('🔍 Probando búsqueda de colaborador...\n');
  sendCommand({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'buscar_colaborador',
      arguments: {
        query: 'Daniel'
      }
    }
  });
}, 2000);

// Cerrar después de 5 segundos
setTimeout(() => {
  console.log('\n✅ Prueba completada. Cerrando servidor...');
  server.kill();
  process.exit(0);
}, 5000);

// Manejar errores
server.on('error', (error) => {
  console.error('Error del servidor:', error);
});

server.on('close', (code) => {
  console.log(`Servidor cerrado con código: ${code}`);
  process.exit(code);
});
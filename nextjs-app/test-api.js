// Test simple para verificar que Airtable funciona
const Airtable = require('airtable');

// Configuración directa
const base = new Airtable({
  apiKey: 'patY6qD6VScyjkUw7.7368384daadb59406808aa0a9e9e7e820d009ed3f86ad945fc85d732cfffa49b'
}).base('appzTllAjxu4TOs1a');

const table = base('tbldYTLfQ3DoEK0WA');

// Test getAllColaboradores
console.log('Probando getAllColaboradores...');

const records = [];

table.select({
  view: 'viwDAiGHQowuPtG45',
  maxRecords: 5
}).eachPage(function page(pageRecords, fetchNextPage) {
  pageRecords.forEach(record => {
    records.push({
      id: record.id,
      fields: record.fields
    });
  });
  fetchNextPage();
}, function done(err) {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log(`✅ Obtenidos ${records.length} registros`);
  console.log('Primer registro:', {
    nombre: records[0].fields.nombre,
    cargo: records[0].fields.cargo,
    estado: records[0].fields.estado
  });
});
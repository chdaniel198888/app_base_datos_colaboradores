const Airtable = require('airtable');

Airtable.configure({
  apiKey: 'patY6qD6VScyjkUw7.7368384daadb59406808aa0a9e9e7e820d009ed3f86ad945fc85d732cfffa49b',
});

const base = Airtable.base('appzTllAjxu4TOs1a');

// Probar obtener registros
base('tbldYTLfQ3DoEK0WA').select({
  maxRecords: 3,
  view: 'viwDAiGHQowuPtG45'
}).eachPage(function page(records, fetchNextPage) {
  console.log('Registros obtenidos:', records.length);
  
  records.forEach(function(record) {
    console.log('\n=== Registro ===');
    console.log('ID:', record.id);
    console.log('Campos disponibles:', Object.keys(record.fields));
    console.log('Nombre:', record.get('nombre'));
    console.log('Cargo:', record.get('cargo'));
  });
  
}, function done(err) {
  if (err) { 
    console.error('Error:', err); 
    return; 
  }
  console.log('\nPrueba completada');
});
import requests
import json
from pprint import pprint

# Configuración
API_TOKEN = 'patY6qD6VScyjkUw7.7368384daadb59406808aa0a9e9e7e820d009ed3f86ad945fc85d732cfffa49b'
BASE_ID = 'appzTllAjxu4TOs1a'
TABLE_ID = 'tbldYTLfQ3DoEK0WA'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

# 1. Obtener información de la base
print("=" * 80)
print("ANALIZANDO BASE DE DATOS AIRTABLE")
print("=" * 80)

# Obtener schema de la base
schema_url = f'https://api.airtable.com/v0/meta/bases/{BASE_ID}/tables'
response = requests.get(schema_url, headers=headers)

if response.status_code == 200:
    schema_data = response.json()
    
    # Buscar nuestra tabla específica
    for table in schema_data.get('tables', []):
        if table['id'] == TABLE_ID:
            print(f"\n📊 TABLA: {table['name']}")
            print(f"   ID: {table['id']}")
            print(f"   Descripción: {table.get('description', 'Sin descripción')}")
            
            print("\n📋 CAMPOS ENCONTRADOS:")
            print("-" * 60)
            
            all_fields = []
            for field in table.get('fields', []):
                field_info = {
                    'id': field['id'],
                    'name': field['name'],
                    'type': field['type'],
                    'description': field.get('description', ''),
                    'options': field.get('options', {})
                }
                all_fields.append(field_info)
                
                print(f"\n   Campo: {field['name']}")
                print(f"   • ID: {field['id']}")
                print(f"   • Tipo: {field['type']}")
                if field.get('description'):
                    print(f"   • Descripción: {field['description']}")
                
                # Analizar opciones específicas según el tipo
                if field['type'] == 'singleSelect' or field['type'] == 'multipleSelects':
                    if 'choices' in field.get('options', {}):
                        print(f"   • Opciones disponibles:")
                        for choice in field['options']['choices']:
                            print(f"      - {choice.get('name', '')} (Color: {choice.get('color', 'default')})")
                
                elif field['type'] == 'multipleRecordLinks':
                    print(f"   • Tabla vinculada: {field['options'].get('linkedTableId', 'N/A')}")
                    print(f"   • Vista de enlace: {field['options'].get('viewIdForRecordSelection', 'N/A')}")
                
                elif field['type'] == 'formula':
                    print(f"   • Fórmula: {field['options'].get('formula', 'N/A')}")
                
                elif field['type'] == 'rollup':
                    print(f"   • Campo de resumen: {field['options'].get('rollupFunction', 'N/A')}")
                
                elif field['type'] == 'count':
                    print(f"   • Campo de conteo vinculado: {field['options'].get('recordLinkFieldId', 'N/A')}")
            
            print("\n" + "=" * 60)
            print(f"TOTAL DE CAMPOS ENCONTRADOS: {len(all_fields)}")
            
            # Guardar resultado completo en JSON
            with open('campos_airtable.json', 'w', encoding='utf-8') as f:
                json.dump({
                    'table_name': table['name'],
                    'table_id': table['id'],
                    'total_fields': len(all_fields),
                    'fields': all_fields
                }, f, indent=2, ensure_ascii=False)
            
            print("\n✅ Análisis completo guardado en 'campos_airtable.json'")
            
            # Obtener también algunos registros de ejemplo para ver campos ocultos
            print("\n" + "=" * 60)
            print("OBTENIENDO REGISTROS DE EJEMPLO")
            print("-" * 60)
            
            records_url = f'https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}'
            params = {
                'maxRecords': 3,
                'view': 'viwDAiGHQowuPtG45'
            }
            
            records_response = requests.get(records_url, headers=headers, params=params)
            
            if records_response.status_code == 200:
                records_data = records_response.json()
                
                if records_data.get('records'):
                    print(f"\nRegistros obtenidos: {len(records_data['records'])}")
                    
                    # Analizar campos presentes en los registros
                    campos_en_registros = set()
                    for idx, record in enumerate(records_data['records'], 1):
                        print(f"\nRegistro {idx} - ID: {record['id']}")
                        for campo, valor in record.get('fields', {}).items():
                            campos_en_registros.add(campo)
                            tipo_valor = type(valor).__name__
                            if isinstance(valor, list) and len(valor) > 0:
                                print(f"   • {campo}: [{len(valor)} elementos]")
                            elif isinstance(valor, str) and len(valor) > 50:
                                print(f"   • {campo}: {valor[:50]}... (tipo: {tipo_valor})")
                            else:
                                print(f"   • {campo}: {valor} (tipo: {tipo_valor})")
                    
                    # Guardar muestra de registros
                    with open('muestra_registros.json', 'w', encoding='utf-8') as f:
                        json.dump(records_data, f, indent=2, ensure_ascii=False)
                    
                    print("\n✅ Muestra de registros guardada en 'muestra_registros.json'")
                    
                    # Comparar campos del schema con campos en registros
                    campos_schema = {field['name'] for field in all_fields}
                    print("\n" + "=" * 60)
                    print("ANÁLISIS DE CAMPOS")
                    print("-" * 60)
                    print(f"Campos en schema: {len(campos_schema)}")
                    print(f"Campos en registros: {len(campos_en_registros)}")
                    
                    campos_no_visibles = campos_schema - campos_en_registros
                    if campos_no_visibles:
                        print(f"\n⚠️ Campos en schema pero no en registros (posiblemente ocultos o vacíos):")
                        for campo in campos_no_visibles:
                            print(f"   - {campo}")
                    
                    campos_adicionales = campos_en_registros - campos_schema
                    if campos_adicionales:
                        print(f"\n⚠️ Campos en registros pero no en schema:")
                        for campo in campos_adicionales:
                            print(f"   - {campo}")
            else:
                print(f"Error al obtener registros: {records_response.status_code}")
                print(records_response.text)
                
else:
    print(f"Error al obtener schema: {response.status_code}")
    print(response.text)

print("\n" + "=" * 80)
print("ANÁLISIS COMPLETADO")
print("=" * 80)
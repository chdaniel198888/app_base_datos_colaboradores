import requests
import json
from collections import defaultdict
from datetime import datetime

# Configuración
API_TOKEN = 'patY6qD6VScyjkUw7.7368384daadb59406808aa0a9e9e7e820d009ed3f86ad945fc85d732cfffa49b'
BASE_ID = 'appzTllAjxu4TOs1a'
TABLE_ID = 'tbldYTLfQ3DoEK0WA'
VIEW_ID = 'viwDAiGHQowuPtG45'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

print("=" * 80)
print("ANÁLISIS PROFUNDO DE LA TABLA AIRTABLE")
print("=" * 80)
print(f"Base ID: {BASE_ID}")
print(f"Table ID: {TABLE_ID}")
print(f"View ID: {VIEW_ID}")
print("=" * 80)

# Obtener TODOS los registros para analizar campos
all_records = []
offset = None
page_count = 0

print("\n📥 OBTENIENDO TODOS LOS REGISTROS...")
print("-" * 60)

while True:
    page_count += 1
    params = {
        'view': VIEW_ID,
        'pageSize': 100
    }
    
    if offset:
        params['offset'] = offset
    
    url = f'https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}'
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        data = response.json()
        records = data.get('records', [])
        all_records.extend(records)
        
        print(f"Página {page_count}: {len(records)} registros obtenidos")
        
        offset = data.get('offset')
        if not offset:
            break
    else:
        print(f"Error al obtener registros: {response.status_code}")
        print(response.text)
        break

print(f"\n✅ Total de registros obtenidos: {len(all_records)}")

# Analizar estructura de campos
campo_info = defaultdict(lambda: {
    'tipo_detectado': set(),
    'valores_muestra': [],
    'apariciones': 0,
    'valores_unicos': set(),
    'tiene_nulos': False,
    'longitud_max': 0,
    'es_array': False,
    'es_objeto': False,
    'subtipos': set()
})

print("\n📊 ANALIZANDO ESTRUCTURA DE CAMPOS...")
print("-" * 60)

for record in all_records:
    fields = record.get('fields', {})
    
    for campo, valor in fields.items():
        info = campo_info[campo]
        info['apariciones'] += 1
        
        # Detectar tipo de dato
        tipo = type(valor).__name__
        info['tipo_detectado'].add(tipo)
        
        # Analizar el valor
        if valor is None:
            info['tiene_nulos'] = True
        elif isinstance(valor, list):
            info['es_array'] = True
            if len(valor) > 0:
                # Analizar tipo de elementos en el array
                for item in valor:
                    if isinstance(item, dict):
                        info['subtipos'].add('objeto')
                    else:
                        info['subtipos'].add(type(item).__name__)
            
            # Guardar muestra limitada
            if len(info['valores_muestra']) < 3:
                if len(valor) > 0 and isinstance(valor[0], str):
                    info['valores_muestra'].append(valor[:2])  # Solo primeros 2 elementos
                else:
                    info['valores_muestra'].append(f"[{len(valor)} elementos]")
        
        elif isinstance(valor, dict):
            info['es_objeto'] = True
            if len(info['valores_muestra']) < 3:
                info['valores_muestra'].append(f"Objeto con keys: {list(valor.keys())}")
        
        elif isinstance(valor, str):
            info['longitud_max'] = max(info['longitud_max'], len(valor))
            if len(info['valores_unicos']) < 50:  # Limitar valores únicos
                info['valores_unicos'].add(valor)
            if len(info['valores_muestra']) < 5:
                if len(valor) > 100:
                    info['valores_muestra'].append(valor[:100] + "...")
                else:
                    info['valores_muestra'].append(valor)
        
        elif isinstance(valor, (int, float, bool)):
            if len(info['valores_unicos']) < 50:
                info['valores_unicos'].add(str(valor))
            if len(info['valores_muestra']) < 5:
                info['valores_muestra'].append(valor)

# Detectar campos que no aparecen en todos los registros
for campo in campo_info:
    if campo_info[campo]['apariciones'] < len(all_records):
        campo_info[campo]['tiene_nulos'] = True

print(f"\n📋 TOTAL DE CAMPOS ÚNICOS ENCONTRADOS: {len(campo_info)}")

# Generar reporte detallado
reporte = {
    'fecha_analisis': datetime.now().isoformat(),
    'base_id': BASE_ID,
    'table_id': TABLE_ID,
    'view_id': VIEW_ID,
    'total_registros': len(all_records),
    'total_campos': len(campo_info),
    'campos': {}
}

print("\n" + "=" * 80)
print("DETALLE DE CADA CAMPO ENCONTRADO")
print("=" * 80)

for idx, (campo, info) in enumerate(sorted(campo_info.items()), 1):
    print(f"\n{idx}. 📌 CAMPO: '{campo}'")
    print("-" * 40)
    
    # Determinar el tipo principal
    tipos = list(info['tipo_detectado'])
    tipo_principal = tipos[0] if len(tipos) == 1 else f"Mixto: {', '.join(tipos)}"
    
    print(f"   • Tipo detectado: {tipo_principal}")
    print(f"   • Apariciones: {info['apariciones']}/{len(all_records)} registros")
    print(f"   • Porcentaje de presencia: {(info['apariciones']/len(all_records)*100):.1f}%")
    
    if info['tiene_nulos']:
        print(f"   • ⚠️ Contiene valores nulos o no aparece en todos los registros")
    
    if info['es_array']:
        print(f"   • Es un array")
        if info['subtipos']:
            print(f"   • Tipos de elementos: {', '.join(info['subtipos'])}")
    
    if info['es_objeto']:
        print(f"   • Es un objeto/diccionario")
    
    if info['longitud_max'] > 0:
        print(f"   • Longitud máxima de texto: {info['longitud_max']} caracteres")
    
    if len(info['valores_unicos']) > 0 and len(info['valores_unicos']) <= 10:
        print(f"   • Valores únicos ({len(info['valores_unicos'])}): {', '.join(sorted(list(info['valores_unicos'])[:10]))}")
    elif len(info['valores_unicos']) > 10:
        print(f"   • Total de valores únicos: {len(info['valores_unicos'])}")
    
    if info['valores_muestra']:
        print(f"   • Muestras de valores:")
        for muestra in info['valores_muestra'][:3]:
            if isinstance(muestra, str) and len(muestra) > 80:
                print(f"      - {muestra[:80]}...")
            else:
                print(f"      - {muestra}")
    
    # Guardar en el reporte
    reporte['campos'][campo] = {
        'tipo_principal': tipo_principal,
        'tipos_detectados': tipos,
        'apariciones': info['apariciones'],
        'porcentaje_presencia': round(info['apariciones']/len(all_records)*100, 2),
        'tiene_nulos': info['tiene_nulos'],
        'es_array': info['es_array'],
        'es_objeto': info['es_objeto'],
        'subtipos': list(info['subtipos']) if info['subtipos'] else None,
        'longitud_maxima': info['longitud_max'] if info['longitud_max'] > 0 else None,
        'cantidad_valores_unicos': len(info['valores_unicos']),
        'valores_muestra': info['valores_muestra'][:5]
    }

# Detectar posibles campos ocultos o calculados
print("\n" + "=" * 80)
print("ANÁLISIS DE CAMPOS ESPECIALES")
print("=" * 80)

# Campos que no aparecen en todos los registros
campos_opcionales = [campo for campo, info in campo_info.items() 
                     if info['apariciones'] < len(all_records)]

if campos_opcionales:
    print(f"\n🔍 Campos que no aparecen en todos los registros ({len(campos_opcionales)}):")
    for campo in campos_opcionales:
        porcentaje = (campo_info[campo]['apariciones']/len(all_records)*100)
        print(f"   • {campo}: presente en {porcentaje:.1f}% de los registros")

# Campos que parecen ser fórmulas o calculados (arrays, objetos)
campos_calculados = [campo for campo, info in campo_info.items() 
                    if info['es_array'] or info['es_objeto']]

if campos_calculados:
    print(f"\n🔢 Posibles campos calculados o de relación ({len(campos_calculados)}):")
    for campo in campos_calculados:
        tipo = "Array" if campo_info[campo]['es_array'] else "Objeto"
        print(f"   • {campo}: Tipo {tipo}")

# Guardar reporte completo
with open('reporte_completo_campos.json', 'w', encoding='utf-8') as f:
    json.dump(reporte, f, indent=2, ensure_ascii=False)

print("\n" + "=" * 80)
print("📁 ARCHIVOS GENERADOS")
print("=" * 80)
print("✅ reporte_completo_campos.json - Reporte detallado de todos los campos")

# Guardar muestra de registros completos
with open('muestra_registros_completa.json', 'w', encoding='utf-8') as f:
    json.dump({
        'total_registros': len(all_records),
        'muestra': all_records[:5] if len(all_records) > 5 else all_records
    }, f, indent=2, ensure_ascii=False)

print("✅ muestra_registros_completa.json - Muestra de los primeros 5 registros")

# Crear un archivo CSV con la estructura de campos para fácil revisión
import csv

with open('estructura_campos.csv', 'w', newline='', encoding='utf-8') as csvfile:
    fieldnames = ['Campo', 'Tipo', 'Presencia_%', 'Es_Array', 'Es_Objeto', 'Tiene_Nulos', 'Valores_Unicos']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    
    writer.writeheader()
    for campo, info in sorted(campo_info.items()):
        writer.writerow({
            'Campo': campo,
            'Tipo': ', '.join(info['tipo_detectado']),
            'Presencia_%': f"{(info['apariciones']/len(all_records)*100):.1f}",
            'Es_Array': 'Sí' if info['es_array'] else 'No',
            'Es_Objeto': 'Sí' if info['es_objeto'] else 'No',
            'Tiene_Nulos': 'Sí' if info['tiene_nulos'] else 'No',
            'Valores_Unicos': len(info['valores_unicos'])
        })

print("✅ estructura_campos.csv - Tabla resumen de la estructura de campos")

print("\n" + "=" * 80)
print("ANÁLISIS COMPLETADO EXITOSAMENTE")
print("=" * 80)
print(f"Total de campos analizados: {len(campo_info)}")
print(f"Total de registros procesados: {len(all_records)}")
print("\n💡 Revisa los archivos generados para más detalles.")
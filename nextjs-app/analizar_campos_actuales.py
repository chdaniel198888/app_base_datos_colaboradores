import requests
import json

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
print("ANALIZANDO CAMPOS ACTUALES DE AIRTABLE")
print("=" * 80)

# Obtener algunos registros para ver los campos reales
url = f'https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}'
params = {
    'view': VIEW_ID,
    'maxRecords': 5,
    'pageSize': 5
}

response = requests.get(url, headers=headers, params=params)

if response.status_code == 200:
    data = response.json()
    
    if data.get('records'):
        print(f"\n✅ Registros obtenidos: {len(data['records'])}")
        
        # Analizar el primer registro para ver todos los campos
        first_record = data['records'][0]
        fields = first_record.get('fields', {})
        
        print("\n📋 CAMPOS ENCONTRADOS EN LA TABLA ACTUAL:")
        print("-" * 60)
        
        campo_mapping = {}
        
        for idx, (campo, valor) in enumerate(sorted(fields.items()), 1):
            tipo = type(valor).__name__
            print(f"\n{idx}. Campo: '{campo}'")
            print(f"   Tipo: {tipo}")
            
            if isinstance(valor, str) and len(valor) > 50:
                print(f"   Valor muestra: {valor[:50]}...")
            elif isinstance(valor, list):
                print(f"   Valor muestra: Lista con {len(valor)} elementos")
            else:
                print(f"   Valor muestra: {valor}")
            
            # Guardar mapeo
            campo_mapping[campo] = {
                'nombre_real': campo,
                'tipo': tipo,
                'muestra': str(valor)[:100] if valor else None
            }
        
        # Guardar mapeo en archivo JSON
        with open('campos_actuales_airtable.json', 'w', encoding='utf-8') as f:
            json.dump({
                'fecha_analisis': '2025-08-27',
                'total_campos': len(campo_mapping),
                'campos': campo_mapping,
                'registros_muestra': data['records']
            }, f, indent=2, ensure_ascii=False)
        
        print("\n" + "=" * 60)
        print(f"TOTAL DE CAMPOS: {len(campo_mapping)}")
        print("\n✅ Mapeo guardado en 'campos_actuales_airtable.json'")
        
        # Identificar campos clave para búsqueda
        print("\n🔍 CAMPOS CLAVE PARA BÚSQUEDA:")
        print("-" * 40)
        
        campos_busqueda = ['nombre', 'codigo', 'cargo', 'cedula', 'celular', 'correo', 'empresa', 'centro', 'ubicacion']
        
        for key in campos_busqueda:
            found = [campo for campo in campo_mapping.keys() if key.lower() in campo.lower()]
            if found:
                print(f"   {key.upper()}: {', '.join(found)}")
        
else:
    print(f"❌ Error al obtener datos: {response.status_code}")
    print(response.text)
    
print("\n" + "=" * 80)
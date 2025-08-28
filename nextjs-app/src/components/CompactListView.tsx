'use client';

import React, { useState, useMemo } from 'react';
import { Phone, Mail, Hash, MapPin, Briefcase, User, Building2, Calendar, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompactListViewProps {
  colaboradores: any[];
  onPhoneClick?: (phone: string) => void;
  onWhatsAppClick?: (phone: string) => void;
  onEmailClick?: (email: string) => void;
}

type SortField = 'codigo' | 'nombre' | 'cargo' | 'ubicacion' | 'area' | 'antiguedad' | 'estado' | null;
type SortDirection = 'asc' | 'desc';

export function CompactListView({ colaboradores }: CompactListViewProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const formatWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.startsWith('593') ? cleaned : `593${cleaned.substring(1)}`;
  };
  
  const getPhoneNumber = (colaborador: any) => {
    return colaborador.celular || '';
  };

  // Función para manejar el ordenamiento
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Si es el mismo campo, cambiar dirección
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Si es un campo nuevo, establecer como ascendente
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Función para obtener el icono de ordenamiento
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3 h-3 text-purple-600" />
      : <ChevronDown className="w-3 h-3 text-purple-600" />;
  };

  // Ordenar colaboradores
  const sortedColaboradores = useMemo(() => {
    if (!sortField) return colaboradores;

    const sorted = [...colaboradores].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch(sortField) {
        case 'codigo':
          aValue = a.codigo || '';
          bValue = b.codigo || '';
          break;
        case 'nombre':
          aValue = a.nombre || '';
          bValue = b.nombre || '';
          break;
        case 'cargo':
          aValue = a.cargo || '';
          bValue = b.cargo || '';
          break;
        case 'ubicacion':
          aValue = a.ubicacion || '';
          bValue = b.ubicacion || '';
          break;
        case 'area':
          aValue = a.area || '';
          bValue = b.area || '';
          break;
        case 'antiguedad':
          aValue = a.permanenciaMeses || 0;
          bValue = b.permanenciaMeses || 0;
          // Para números, comparación directa
          if (sortDirection === 'asc') {
            return aValue - bValue;
          }
          return bValue - aValue;
        case 'estado':
          aValue = a.etapa || '';
          bValue = b.etapa || '';
          break;
        default:
          return 0;
      }

      // Para strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue, 'es', { numeric: true });
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      return 0;
    });

    return sorted;
  }, [colaboradores, sortField, sortDirection]);

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-purple-100">
      {/* Controles de ordenamiento para móvil */}
      <div className="lg:hidden px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
        <label className="text-xs font-semibold text-gray-700 mb-2 block">Ordenar por:</label>
        <select
          value={`${sortField || 'none'}-${sortDirection}`}
          onChange={(e) => {
            const [field, direction] = e.target.value.split('-');
            if (field === 'none') {
              setSortField(null);
              setSortDirection('asc');
            } else {
              setSortField(field as SortField);
              setSortDirection(direction as SortDirection);
            }
          }}
          className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
        >
          <option value="none-asc">Sin ordenar</option>
          <option value="codigo-asc">Código ↑</option>
          <option value="codigo-desc">Código ↓</option>
          <option value="nombre-asc">Nombre (A-Z)</option>
          <option value="nombre-desc">Nombre (Z-A)</option>
          <option value="cargo-asc">Cargo (A-Z)</option>
          <option value="cargo-desc">Cargo (Z-A)</option>
          <option value="ubicacion-asc">Ubicación (A-Z)</option>
          <option value="ubicacion-desc">Ubicación (Z-A)</option>
          <option value="area-asc">Área (A-Z)</option>
          <option value="area-desc">Área (Z-A)</option>
          <option value="antiguedad-asc">Antigüedad (menor a mayor)</option>
          <option value="antiguedad-desc">Antigüedad (mayor a menor)</option>
          <option value="estado-asc">Estado (A-Z)</option>
          <option value="estado-desc">Estado (Z-A)</option>
        </select>
      </div>
      {/* Header de la tabla - Solo desktop */}
      <div className="hidden lg:flex items-center px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100 text-xs font-semibold text-gray-700">
        <div 
          className="w-20 flex items-center gap-1 cursor-pointer hover:text-purple-600 transition-colors"
          onClick={() => handleSort('codigo')}
        >
          <span>Código</span>
          {getSortIcon('codigo')}
        </div>
        <div 
          className="flex-[2] min-w-0 flex items-center gap-1 cursor-pointer hover:text-purple-600 transition-colors"
          onClick={() => handleSort('nombre')}
        >
          <span>Nombre</span>
          {getSortIcon('nombre')}
        </div>
        <div 
          className="flex-[2] min-w-0 flex items-center gap-1 cursor-pointer hover:text-purple-600 transition-colors"
          onClick={() => handleSort('cargo')}
        >
          <span>Cargo / Reporta a</span>
          {getSortIcon('cargo')}
        </div>
        <div 
          className="flex-[2] min-w-0 flex items-center gap-1 cursor-pointer hover:text-purple-600 transition-colors"
          onClick={() => handleSort('ubicacion')}
        >
          <span>Ubicación</span>
          {getSortIcon('ubicacion')}
        </div>
        <div 
          className="w-24 text-center flex items-center justify-center gap-1 cursor-pointer hover:text-purple-600 transition-colors"
          onClick={() => handleSort('area')}
        >
          <span>Área</span>
          {getSortIcon('area')}
        </div>
        <div 
          className="w-20 text-center flex items-center justify-center gap-1 cursor-pointer hover:text-purple-600 transition-colors"
          onClick={() => handleSort('antiguedad')}
        >
          <span>Antigüedad</span>
          {getSortIcon('antiguedad')}
        </div>
        <div 
          className="w-32 text-center flex items-center justify-center gap-1 cursor-pointer hover:text-purple-600 transition-colors"
          onClick={() => handleSort('estado')}
        >
          <span>Estado</span>
          {getSortIcon('estado')}
        </div>
        <div className="w-32 text-center">Acciones</div>
      </div>
      
      {/* Lista de colaboradores */}
      <div className="divide-y divide-gray-100">
        {sortedColaboradores.slice(0, 50).map((colaborador, index) => (
          <div
            key={colaborador.id}
            className={cn(
              "transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50",
              index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
            )}
          >
            {/* Vista Desktop - Tabla */}
            <div className="hidden lg:flex items-center px-4 py-3 text-sm">
              {/* Código */}
              <div className="w-20 font-mono text-xs text-gray-600">
                {colaborador.codigo}
              </div>
              
              {/* Nombre */}
              <div className="flex-[2] min-w-0 pr-2">
                <div className="font-medium text-gray-800 truncate">
                  {colaborador.nombre}
                </div>
                {colaborador.cedula && (
                  <div className="text-xs text-gray-500 truncate">
                    CI: {colaborador.cedula}
                  </div>
                )}
              </div>
              
              {/* Cargo / Reporta a */}
              <div className="flex-[2] min-w-0 pr-2">
                <div className="text-gray-700 truncate text-sm font-medium">
                  {colaborador.cargo}
                </div>
                {colaborador.jefe && colaborador.jefe !== "No aplica" && (
                  <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                    <span>→</span>
                    <span>{colaborador.jefe}</span>
                  </div>
                )}
              </div>
              
              {/* Ubicación */}
              <div className="flex-[2] min-w-0 pr-2">
                <div className="text-gray-700 truncate">
                  {colaborador.ubicacion}
                </div>
                <div className="text-xs text-gray-500">
                  {colaborador.marca}
                </div>
              </div>
              
              {/* Área */}
              <div className="w-24 flex justify-center">
                <span className="px-2 py-1 text-xs rounded-lg bg-blue-100 text-blue-700 truncate">
                  {colaborador.area}
                </span>
              </div>
              
              {/* Antigüedad */}
              <div className="w-20 text-center">
                {colaborador.permanenciaMeses ? (
                  <span className="text-xs text-gray-600">
                    {colaborador.permanenciaMeses > 12 
                      ? `${Math.floor(colaborador.permanenciaMeses / 12)}a`
                      : `${colaborador.permanenciaMeses}m`}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </div>
              
              {/* Estado/Etapa */}
              <div className="w-32 flex justify-center">
                <span className={cn(
                  "px-2 py-1 text-xs rounded-lg font-medium whitespace-nowrap text-center",
                  colaborador.etapa === "Tiempo de prueba superado" 
                    ? "bg-green-100 text-green-700"
                    : colaborador.etapa === "Onboarding"
                    ? "bg-yellow-100 text-yellow-700"
                    : colaborador.etapa === "Inducción"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-700"
                )}>
                  {(() => {
                    if (colaborador.etapa === "Tiempo de prueba superado") {
                      return "Activo";
                    } else if (colaborador.etapa === "Inducción") {
                      // Calcular días desde el ingreso si existe
                      const dias = colaborador.permanenciaDias || (colaborador.permanenciaMeses ? colaborador.permanenciaMeses * 30 : 0);
                      return dias > 0 ? `Inducción (${dias}d)` : "Inducción";
                    } else {
                      return colaborador.etapa || "Nuevo";
                    }
                  })()}
                </span>
              </div>
              
              {/* Acciones */}
              <div className="w-32 flex items-center justify-center gap-1">
                {getPhoneNumber(colaborador) && (
                  <>
                    <a
                      href={`tel:${getPhoneNumber(colaborador)}`}
                      className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:shadow-md hover:scale-105 transition-all duration-200"
                      title="Llamar"
                    >
                      <Phone className="w-3 h-3" />
                    </a>
                    
                    <a
                      href={`https://wa.me/${formatWhatsApp(getPhoneNumber(colaborador))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-green-500 text-white rounded-lg hover:shadow-md hover:scale-105 transition-all duration-200"
                      title="WhatsApp"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </a>
                  </>
                )}
                
                {colaborador.correo && (
                  <a
                    href={`mailto:${colaborador.correo}`}
                    className="p-2 bg-white border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                    title="Email"
                  >
                    <Mail className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
            
            {/* Vista Mobile - Compacta con ordenamiento */}
            <div className="lg:hidden px-4 py-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header con nombre y código */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-500">{colaborador.codigo}</span>
                    <h4 className="font-medium text-gray-800 text-sm truncate">
                      {colaborador.nombre}
                    </h4>
                    {sortField && index === 0 && (
                      <span className="text-xs text-purple-600 ml-auto">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                  
                  {/* Info principal en una línea */}
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {colaborador.cargo}
                    </span>
                  </div>
                  
                  {/* Ubicación y área */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {colaborador.ubicacion}
                    </span>
                    {colaborador.area && (
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        {colaborador.area}
                      </span>
                    )}
                  </div>
                  
                  {/* Etapa y antigüedad */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "px-2 py-0.5 text-xs rounded font-medium",
                      colaborador.etapa === "Tiempo de prueba superado" 
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    )}>
                      {colaborador.etapa === "Tiempo de prueba superado" ? "Activo" : colaborador.etapa}
                    </span>
                    {colaborador.permanenciaMeses && (
                      <span className="text-xs text-gray-500">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {colaborador.permanenciaMeses}m
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Acciones móvil */}
                <div className="flex flex-col gap-1">
                  {getPhoneNumber(colaborador) && (
                    <div className="flex gap-1">
                      <a
                        href={`tel:${getPhoneNumber(colaborador)}`}
                        className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      
                      <a
                        href={`https://wa.me/${formatWhatsApp(getPhoneNumber(colaborador))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-green-500 text-white rounded-lg"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer con información */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-t-2 border-purple-100">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {sortedColaboradores.length > 50 ? (
              <>
                Mostrando 50 de {sortedColaboradores.length} colaboradores. 
                <span className="text-purple-600 ml-1">Refina tu búsqueda para ver resultados más específicos.</span>
              </>
            ) : (
              `Mostrando ${sortedColaboradores.length} colaborador${sortedColaboradores.length !== 1 ? 'es' : ''}`
            )}
          </p>
          {sortField && (
            <p className="text-xs text-gray-500">
              Ordenado por: <span className="font-medium text-purple-600">
                {sortField === 'antiguedad' ? 'Antigüedad' : 
                 sortField === 'codigo' ? 'Código' :
                 sortField === 'ubicacion' ? 'Ubicación' :
                 sortField === 'area' ? 'Área' :
                 sortField.charAt(0).toUpperCase() + sortField.slice(1)}
              </span>
              <span className="ml-1">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
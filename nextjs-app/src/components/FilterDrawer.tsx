'use client';

import React from 'react';
import { X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    centro_costo: string;
    marca: string;
    area: string;
  };
  onFilterChange: (filters: any) => void;
  options: {
    centrosCosto: string[];
    marcas: string[];
    areas: string[];
  };
}

export function FilterDrawer({ isOpen, onClose, filters, onFilterChange, options }: FilterDrawerProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 sm:hidden",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold">Filtros</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Filters */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📍 Ubicación
            </label>
            <select
              value={filters.centro_costo}
              onChange={(e) => onFilterChange({...filters, centro_costo: e.target.value})}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
            >
              <option value="">Todas las ubicaciones</option>
              {options.centrosCosto.map(centro => (
                <option key={centro} value={centro}>{centro}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏢 Marca
            </label>
            <select
              value={filters.marca}
              onChange={(e) => onFilterChange({...filters, marca: e.target.value})}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
            >
              <option value="">Todas las marcas</option>
              {options.marcas.map(marca => (
                <option key={marca} value={marca}>{marca}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👥 Área
            </label>
            <select
              value={filters.area}
              onChange={(e) => onFilterChange({...filters, area: e.target.value})}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
            >
              <option value="">Todas las áreas</option>
              {options.areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={() => {
              onFilterChange({
                centro_costo: '',
                marca: '',
                area: ''
              });
            }}
            className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </>
  );
}
'use client';

import React from 'react';
import { Search, Map, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  activeView: 'list' | 'map' | 'groups';
  onViewChange: (view: 'list' | 'map' | 'groups') => void;
}

export function BottomNavigation({ activeView, onViewChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 sm:hidden">
      <div className="flex items-center justify-around h-16">
        <button
          onClick={() => onViewChange('list')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors",
            activeView === 'list'
              ? "text-blue-600"
              : "text-gray-500"
          )}
        >
          <Search className={cn(
            "w-5 h-5",
            activeView === 'list' && "animate-pulse"
          )} />
          <span className="text-xs font-medium">Lista</span>
          {activeView === 'list' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>

        <button
          onClick={() => onViewChange('map')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors",
            activeView === 'map'
              ? "text-blue-600"
              : "text-gray-500"
          )}
        >
          <Map className={cn(
            "w-5 h-5",
            activeView === 'map' && "animate-pulse"
          )} />
          <span className="text-xs font-medium">Mapa</span>
          {activeView === 'map' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>

        <button
          onClick={() => onViewChange('groups')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors",
            activeView === 'groups'
              ? "text-blue-600"
              : "text-gray-500"
          )}
        >
          <Users className={cn(
            "w-5 h-5",
            activeView === 'groups' && "animate-pulse"
          )} />
          <span className="text-xs font-medium">Grupos</span>
          {activeView === 'groups' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
      </div>
    </div>
  );
}
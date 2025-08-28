'use client';

import React from 'react';
import { RefreshCw, Check, AlertCircle, Clock, Wifi, WifiOff, Download, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useSync } from '@/hooks/useSync';
import { cn } from '@/lib/utils';

export function SyncButton() {
  const { 
    isSyncing, 
    lastSyncTime, 
    syncError, 
    syncSuccess, 
    syncMessage,
    syncNow, 
    timeSinceSync,
    hasUpdates,
    syncStats,
    checkUpdates
  } = useSync();
  const [showDetails, setShowDetails] = React.useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  
  // Verificar actualizaciones al montar
  React.useEffect(() => {
    checkUpdates();
  }, [checkUpdates]);
  
  // Limpiar timeout al desmontar
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Manejar el click con mejor control
  const handleSyncClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Doble verificación para evitar clics múltiples
    if (isSyncing || isButtonDisabled) {
      console.log('Sync already in progress or button disabled');
      return;
    }
    
    // Deshabilitar temporalmente el botón
    setIsButtonDisabled(true);
    
    // Ejecutar sincronización
    await syncNow();
    
    // Re-habilitar el botón después de 1 segundo
    timeoutRef.current = setTimeout(() => {
      setIsButtonDisabled(false);
    }, 1000);
  };
  
  // Mejorar manejo del tooltip
  const handleMouseEnter = () => {
    if (!isSyncing) {
      setShowDetails(true);
    }
  };
  
  const handleMouseLeave = () => {
    setShowDetails(false);
  };

  return (
    <div className="relative">
      {/* Botón principal de sincronización */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSyncClick}
          disabled={isSyncing || isButtonDisabled}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleMouseEnter}
          onTouchEnd={handleMouseLeave}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200",
            "bg-gradient-to-r from-purple-500 to-blue-600 text-white",
            "hover:shadow-lg hover:scale-105 active:scale-95",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100",
            "relative select-none touch-none"
          )}
          type="button"
          aria-label="Sincronizar datos"
        >
          <RefreshCw className={cn(
            "w-4 h-4",
            isSyncing && "animate-spin"
          )} />
          <span className="hidden sm:inline">
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </span>
          <span className="sm:hidden">
            {isSyncing ? '...' : 'Sync'}
          </span>
          
          {/* Indicador de estado */}
          {!isSyncing && (
            <span className={cn(
              "absolute -top-1 -right-1 w-3 h-3 rounded-full",
              hasUpdates ? "bg-yellow-400" : syncSuccess ? "bg-green-400" : syncError ? "bg-red-400" : "bg-blue-400",
              hasUpdates && "animate-bounce"
            )} />
          )}
        </button>
        
        {/* Badge de última sincronización con indicador de actualizaciones */}
        <div className={cn(
          "flex items-center gap-1 px-3 py-1 backdrop-blur-sm rounded-lg border text-xs",
          hasUpdates 
            ? "bg-yellow-50 border-yellow-300 text-yellow-700"
            : "bg-white/90 border-purple-200 text-gray-600"
        )}>
          {hasUpdates ? (
            <>
              <Download className="w-3 h-3 animate-pulse" />
              <span className="font-medium">Actualización disponible</span>
            </>
          ) : (
            <>
              <Clock className="w-3 h-3" />
              <span>{timeSinceSync}</span>
            </>
          )}
        </div>
      </div>
      
      {/* Tooltip con detalles */}
      {showDetails && (
        <div className="absolute top-full mt-2 right-0 z-50 p-3 bg-white rounded-xl shadow-xl border border-purple-200 min-w-[250px] pointer-events-none"
             style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Estado:</span>
              <span className={cn(
                "flex items-center gap-1 font-medium",
                hasUpdates ? "text-yellow-600" : syncSuccess ? "text-green-600" : syncError ? "text-red-600" : "text-blue-600"
              )}>
                {hasUpdates ? (
                  <>
                    <Download className="w-4 h-4 animate-pulse" />
                    Actualización lista
                  </>
                ) : syncSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Sincronizado
                  </>
                ) : syncError ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Error
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4" />
                    Conectado
                  </>
                )}
              </span>
            </div>
            
            {lastSyncTime && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Última sync:</span>
                <span className="text-gray-800 font-medium">
                  {lastSyncTime.toLocaleTimeString('es-EC', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            )}
            
            {syncStats && syncStats.totalRecords && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total datos:</span>
                <span className="text-gray-800 font-medium">
                  {syncStats.totalRecords} colaboradores
                </span>
              </div>
            )}
            
            <div className="pt-2 border-t border-gray-100 space-y-1">
              {hasUpdates && (
                <p className="text-xs text-yellow-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Haz clic para obtener actualizaciones
                </p>
              )}
              <p className="text-xs text-gray-500">
                ⏱️ Auto-sincronización cada 5 minutos
              </p>
              <p className="text-xs text-gray-400">
                🔄 Verificación de cambios cada minuto
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Indicador de sincronización en progreso */}
      {isSyncing && (
        <div className="fixed top-4 right-4 z-50 max-w-md"
             style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-lg border border-purple-200">
            <RefreshCw className="w-5 h-5 text-purple-600 animate-spin" />
            <div className="flex-1">
              <p className="font-medium text-gray-800">Sincronizando...</p>
              <p className="text-xs text-gray-500 mt-1">Obteniendo datos actualizados</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast de notificación con mensaje dinámico */}
      {syncMessage && !syncMessage.includes('Sincronizando') && !isSyncing && (
        <div className="fixed top-4 right-4 z-50 max-w-md"
             style={{ animation: 'slideInRight 0.3s ease-out' }}>
          <div className={cn(
            "flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border",
            syncMessage === 'Sincronizando...'
              ? "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-200"
              : syncMessage?.includes('Ya tienes') 
              ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200"
              : syncMessage?.includes('nuevo') 
              ? "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border-purple-200"
              : "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-200"
          )}>
            {syncMessage === 'Sincronizando...' ? (
              <RefreshCw className="w-5 h-5 flex-shrink-0 mt-0.5 animate-spin" />
            ) : syncMessage?.includes('Ya tienes') ? (
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : syncMessage?.includes('nuevo') ? (
              <Download className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium">{syncMessage}</p>
              {syncStats && syncStats.newRecords && syncStats.newRecords > 0 && syncMessage !== 'Sincronizando...' && (
                <p className="text-xs mt-1 opacity-80">
                  Recargando página en un momento...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {syncError && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in max-w-md">
          <div className="flex items-start gap-3 px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 text-red-800 rounded-xl shadow-lg border border-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{syncError}</p>
              <p className="text-xs mt-1 opacity-80">
                Intenta nuevamente en unos segundos
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
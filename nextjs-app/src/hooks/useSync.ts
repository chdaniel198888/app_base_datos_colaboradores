import { useState, useEffect, useCallback } from 'react';
import { syncWithServer, getLastSync, checkForUpdates } from '@/lib/db/indexedDB';

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [hasUpdates, setHasUpdates] = useState(false);
  const [syncStats, setSyncStats] = useState<{
    newRecords?: number;
    updatedRecords?: number;
    totalRecords?: number;
  } | null>(null);
  
  // Obtener última sincronización al montar
  useEffect(() => {
    getLastSync().then(setLastSyncTime);
  }, []);
  
  // Verificar si hay actualizaciones disponibles
  const checkUpdates = useCallback(async () => {
    const updatesAvailable = await checkForUpdates();
    setHasUpdates(updatesAvailable);
  }, []);
  
  // Función de sincronización manual
  const syncNow = useCallback(async () => {
    // Prevenir múltiples clics - pero asegurar que el estado se actualice
    if (isSyncing) {
      console.log('Ya hay una sincronización en progreso');
      return;
    }
    
    console.log('Iniciando sincronización manual...');
    // Actualizar estados inmediatamente para feedback visual
    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccess(false);
    setSyncMessage('Sincronizando...');
    setHasUpdates(false); // Limpiar indicador de actualizaciones
    
    try {
      // Pequeño delay para asegurar que el UI se actualice
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await syncWithServer();
      console.log('Resultado de sincronización:', result);
      
      const newSyncTime = new Date();
      setLastSyncTime(newSyncTime);
      
      if (result.success) {
        setSyncSuccess(true);
        setSyncMessage(result.message);
        setSyncStats({
          newRecords: result.newRecords,
          updatedRecords: result.updatedRecords,
          totalRecords: result.totalRecords
        });
        setHasUpdates(false);
        
        // Limpiar mensaje de sincronizando primero
        if (syncMessage === 'Sincronizando...') {
          setSyncMessage(null);
        }
        
        // Luego mostrar el nuevo mensaje
        setTimeout(() => {
          setSyncMessage(result.message);
        }, 100);
        
        // Mostrar mensaje por tiempo variable según el contenido
        const displayTime = result.newRecords && result.newRecords > 0 ? 5000 : 4000;
        setTimeout(() => {
          setSyncSuccess(false);
          setSyncMessage(null);
        }, displayTime);
        
        // Solo recargar si hay cambios significativos
        if (result.newRecords && result.newRecords > 0) {
          setTimeout(() => window.location.reload(), 2000);
        }
      } else {
        setSyncError(result.message);
        setSyncSuccess(false);
        setTimeout(() => setSyncError(null), 5000);
      }
    } catch (error) {
      setSyncError('Error de conexión. Verifica tu internet');
      setSyncSuccess(false);
      console.error('Error syncing:', error);
      setTimeout(() => setSyncError(null), 5000);
    } finally {
      // Asegurar que siempre se limpie el estado de sincronización
      setIsSyncing(false);
      // Limpiar el mensaje de "Sincronizando..." si no hay otro mensaje
      setTimeout(() => {
        setSyncMessage(prev => prev === 'Sincronizando...' ? null : prev);
      }, 100);
    }
  }, []); // Removemos isSyncing de las dependencias para evitar problemas
  
  // Sincronización automática cada 5 minutos
  useEffect(() => {
    // Primera sincronización al cargar (silenciosa)
    syncWithServer().then(result => {
      if (result.success) {
        setLastSyncTime(new Date());
        setSyncStats({
          newRecords: result.newRecords,
          updatedRecords: result.updatedRecords,
          totalRecords: result.totalRecords
        });
      }
    });
    
    // Verificar actualizaciones cada minuto
    const updateCheckInterval = setInterval(checkUpdates, 60 * 1000);
    
    // Configurar intervalo de sincronización de 5 minutos (300000 ms)
    const syncInterval = setInterval(async () => {
      const result = await syncWithServer();
      if (result.success) {
        setLastSyncTime(new Date());
        
        // Solo mostrar notificación si hay cambios en auto-sync
        if (result.newRecords && result.newRecords > 0) {
          setSyncSuccess(true);
          setSyncMessage(`Auto-sync: ${result.message}`);
          setTimeout(() => {
            setSyncSuccess(false);
            setSyncMessage(null);
            window.location.reload();
          }, 3000);
        }
        
        console.log(`✅ Auto-sync: ${result.message}`);
      }
    }, 5 * 60 * 1000); // 5 minutos
    
    // Limpiar intervalos al desmontar
    return () => {
      clearInterval(syncInterval);
      clearInterval(updateCheckInterval);
    };
  }, [checkUpdates]);
  
  // Formatear tiempo desde última sincronización
  const getTimeSinceSync = () => {
    if (!lastSyncTime) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes === 0) {
      return `Hace ${seconds} segundos`;
    } else if (minutes === 1) {
      return 'Hace 1 minuto';
    } else if (minutes < 60) {
      return `Hace ${minutes} minutos`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
  };
  
  return {
    isSyncing,
    lastSyncTime,
    syncError,
    syncSuccess,
    syncMessage,
    syncNow,
    timeSinceSync: getTimeSinceSync(),
    hasUpdates,
    syncStats,
    checkUpdates,
  };
}
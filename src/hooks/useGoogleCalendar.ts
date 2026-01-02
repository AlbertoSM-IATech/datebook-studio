import { useState, useCallback } from 'react';
import { GoogleCalendarService } from '@/services/GoogleCalendarService';
import { EditorialEvent, GoogleCalendarConnection, GoogleCalendarSyncLog, GoogleCalendarInfo } from '@/types/calendar';
import { toast } from '@/hooks/use-toast';

export function useGoogleCalendar() {
  const [connection, setConnection] = useState<GoogleCalendarConnection>(
    GoogleCalendarService.getConnection()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [syncLogs, setSyncLogs] = useState<GoogleCalendarSyncLog[]>(
    GoogleCalendarService.getSyncLogs()
  );
  const [calendars, setCalendars] = useState<GoogleCalendarInfo[]>(
    connection.availableCalendars || []
  );

  const connect = useCallback(async () => {
    setIsLoading(true);
    try {
      // For demo purposes, we'll mock the connection
      // In production, this would redirect to OAuth
      GoogleCalendarService.mockConnect();
      const newConnection = GoogleCalendarService.getConnection();
      setConnection(newConnection);
      setCalendars(newConnection.availableCalendars || []);
      
      toast({
        title: 'Conectado a Google Calendar',
        description: 'Tu cuenta ha sido vinculada correctamente.',
      });
      
      return true;
    } catch (error) {
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con Google Calendar.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setIsLoading(true);
    try {
      await GoogleCalendarService.disconnect();
      setConnection(GoogleCalendarService.getConnection());
      setCalendars([]);
      
      toast({
        title: 'Desconectado',
        description: 'Tu cuenta de Google ha sido desvinculada.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo desconectar la cuenta.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCalendars = useCallback(async () => {
    if (!connection.isConnected) return;
    
    try {
      const cals = await GoogleCalendarService.getCalendars();
      setCalendars(cals);
    } catch (error) {
      console.error('Error fetching calendars:', error);
    }
  }, [connection.isConnected]);

  const selectCalendars = useCallback(async (calendarIds: string[]) => {
    try {
      await GoogleCalendarService.selectCalendars(calendarIds);
      const newConnection = GoogleCalendarService.getConnection();
      setConnection(newConnection);
      setCalendars(newConnection.availableCalendars || []);
      
      toast({
        title: 'Calendarios actualizados',
        description: `${calendarIds.length} calendario(s) seleccionado(s).`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron actualizar los calendarios.',
        variant: 'destructive',
      });
    }
  }, []);

  const importEvents = useCallback(async (
    dateFrom: Date,
    dateTo: Date
  ): Promise<EditorialEvent[]> => {
    setIsLoading(true);
    try {
      const result = await GoogleCalendarService.importEvents(dateFrom, dateTo);
      setSyncLogs(GoogleCalendarService.getSyncLogs());
      setConnection(GoogleCalendarService.getConnection());
      
      toast({
        title: 'Eventos importados',
        description: `Se importaron ${result.log.eventsCreated} eventos desde Google Calendar.`,
      });
      
      return result.imported;
    } catch (error) {
      toast({
        title: 'Error de importación',
        description: 'No se pudieron importar los eventos.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportEvents = useCallback(async (
    events: EditorialEvent[]
  ): Promise<number> => {
    setIsLoading(true);
    try {
      const result = await GoogleCalendarService.exportEvents(events);
      setSyncLogs(GoogleCalendarService.getSyncLogs());
      
      toast({
        title: 'Eventos exportados',
        description: `Se exportaron ${result.exported} eventos a Google Calendar.`,
      });
      
      return result.exported;
    } catch (error) {
      toast({
        title: 'Error de exportación',
        description: 'No se pudieron exportar los eventos.',
        variant: 'destructive',
      });
      return 0;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncNow = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const log = await GoogleCalendarService.syncBidirectional();
      setSyncLogs(GoogleCalendarService.getSyncLogs());
      setConnection(GoogleCalendarService.getConnection());
      
      toast({
        title: 'Sincronización completada',
        description: `Procesados: ${log.eventsProcessed}, Actualizados: ${log.eventsUpdated}`,
      });
    } catch (error) {
      toast({
        title: 'Error de sincronización',
        description: 'No se pudo completar la sincronización.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resolveConflict = useCallback(async (
    eventId: string,
    resolution: 'keep_local' | 'keep_google'
  ): Promise<void> => {
    try {
      await GoogleCalendarService.resolveConflict(eventId, resolution);
      
      toast({
        title: 'Conflicto resuelto',
        description: resolution === 'keep_local' 
          ? 'Se conservó la versión local.'
          : 'Se conservó la versión de Google.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo resolver el conflicto.',
        variant: 'destructive',
      });
    }
  }, []);

  return {
    connection,
    isConnected: connection.isConnected,
    isLoading,
    syncLogs,
    calendars,
    connect,
    disconnect,
    fetchCalendars,
    selectCalendars,
    importEvents,
    exportEvents,
    syncNow,
    resolveConflict,
    lastSyncAt: connection.lastSyncAt,
  };
}
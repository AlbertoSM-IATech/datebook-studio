import { useState, useEffect } from 'react';
import { format, subDays, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Cloud,
  CloudOff,
  Download,
  Upload,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Clock,
  Loader2,
  Calendar,
} from 'lucide-react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useEvents } from '@/hooks/useEvents';
import { GoogleCalendarSyncLog, GoogleCalendarInfo } from '@/types/calendar';

interface GoogleCalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoogleCalendarModal({ open, onOpenChange }: GoogleCalendarModalProps) {
  const {
    connection,
    isConnected,
    isLoading,
    syncLogs,
    calendars,
    connect,
    disconnect,
    importEvents,
    exportEvents,
    syncNow,
    fetchCalendars,
    selectCalendars,
  } = useGoogleCalendar();
  
  const { events, addImportedEvents } = useEvents();
  const [importRange] = useState({ from: subDays(new Date(), 90), to: addDays(new Date(), 90) });
  const [autoSync, setAutoSync] = useState(connection.syncEnabled);
  const [showCalendarSelector, setShowCalendarSelector] = useState(false);

  // Fetch calendars when connected
  useEffect(() => {
    if (isConnected && open) {
      fetchCalendars();
    }
  }, [isConnected, open, fetchCalendars]);

  const handleConnect = async () => {
    const success = await connect();
    if (success) {
      setShowCalendarSelector(true);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setShowCalendarSelector(false);
  };

  const handleImport = async () => {
    const imported = await importEvents(importRange.from, importRange.to);
    if (imported.length > 0) {
      addImportedEvents(imported);
    }
  };

  const handleExport = async () => {
    const eventsToExport = events.filter(e => e.type === 'user' && e.origin === 'local');
    await exportEvents(eventsToExport);
  };

  const handleSync = async () => {
    await syncNow();
  };

  const handleCalendarToggle = async (calendarId: string, checked: boolean) => {
    const currentSelected = calendars.filter(c => c.selected).map(c => c.id);
    let newSelected: string[];
    
    if (checked) {
      newSelected = [...currentSelected, calendarId];
    } else {
      newSelected = currentSelected.filter(id => id !== calendarId);
    }
    
    await selectCalendars(newSelected);
  };

  const getLogStatusIcon = (log: GoogleCalendarSyncLog) => {
    switch (log.status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      case 'partial':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
  };

  const selectedCount = calendars.filter(c => c.selected).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isConnected ? (
              <Cloud className="h-5 w-5 text-green-500" />
            ) : (
              <CloudOff className="h-5 w-5 text-muted-foreground" />
            )}
            Google Calendar
          </DialogTitle>
          <DialogDescription>
            Sincroniza tus eventos con Google Calendar para tener todo en un solo lugar.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-2">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  isConnected ? 'bg-green-500/20' : 'bg-muted'
                )}>
                  {isConnected ? (
                    <Cloud className="h-5 w-5 text-green-500" />
                  ) : (
                    <CloudOff className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {isConnected ? 'Conectado' : 'No conectado'}
                  </p>
                  {isConnected && connection.email && (
                    <p className="text-sm text-muted-foreground">{connection.email}</p>
                  )}
                </div>
              </div>
              
              <Button
                variant={isConnected ? 'outline' : 'default'}
                onClick={isConnected ? handleDisconnect : handleConnect}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isConnected ? (
                  'Desconectar'
                ) : (
                  <>
                    <Cloud className="h-4 w-4 mr-2" />
                    Conectar con Google (OAuth 2.0)
                  </>
                )}
              </Button>
            </div>

            {isConnected && (
              <>
                <Separator />

                {/* Calendar Selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Calendarios a sincronizar
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {selectedCount} de {calendars.length} calendarios seleccionados
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCalendarSelector(!showCalendarSelector)}
                    >
                      {showCalendarSelector ? 'Ocultar' : 'Configurar'}
                    </Button>
                  </div>

                  {showCalendarSelector && (
                    <div className="space-y-2 p-3 rounded-lg border bg-background">
                      {calendars.map((calendar) => (
                        <div
                          key={calendar.id}
                          className="flex items-center gap-3 py-2"
                        >
                          <Checkbox
                            id={`cal-${calendar.id}`}
                            checked={calendar.selected}
                            onCheckedChange={(checked) => 
                              handleCalendarToggle(calendar.id, checked === true)
                            }
                          />
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: calendar.color }}
                          />
                          <Label
                            htmlFor={`cal-${calendar.id}`}
                            className="flex-1 cursor-pointer flex items-center gap-2"
                          >
                            {calendar.name}
                            {calendar.primary && (
                              <Badge variant="secondary" className="text-xs">
                                Principal
                              </Badge>
                            )}
                          </Label>
                        </div>
                      ))}
                      {calendars.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No se encontraron calendarios
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Auto Sync Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="auto-sync">Sincronización automática</Label>
                    <p className="text-xs text-muted-foreground">
                      Mantén tus eventos sincronizados automáticamente
                    </p>
                  </div>
                  <Switch
                    id="auto-sync"
                    checked={autoSync}
                    onCheckedChange={setAutoSync}
                  />
                </div>

                {/* Last Sync */}
                {connection.lastSyncAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Última sincronización: {format(connection.lastSyncAt, 'dd MMM yyyy HH:mm', { locale: es })}
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    className="flex-col h-auto py-4 gap-2"
                    onClick={handleImport}
                    disabled={isLoading || selectedCount === 0}
                  >
                    <Download className="h-5 w-5" />
                    <span className="text-xs">Importar</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-col h-auto py-4 gap-2"
                    onClick={handleExport}
                    disabled={isLoading || selectedCount === 0}
                  >
                    <Upload className="h-5 w-5" />
                    <span className="text-xs">Exportar</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-col h-auto py-4 gap-2"
                    onClick={handleSync}
                    disabled={isLoading || selectedCount === 0}
                  >
                    <RefreshCw className={cn('h-5 w-5', isLoading && 'animate-spin')} />
                    <span className="text-xs">Sincronizar</span>
                  </Button>
                </div>

                {selectedCount === 0 && (
                  <p className="text-sm text-amber-600 text-center">
                    Selecciona al menos un calendario para sincronizar
                  </p>
                )}

                {/* Sync Logs */}
                {syncLogs.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Historial de sincronización</h4>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto">
                        {syncLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              {getLogStatusIcon(log)}
                              <span className="capitalize">{log.action}</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <span>{log.eventsProcessed} eventos</span>
                              <span>{format(log.timestamp, 'HH:mm', { locale: es })}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
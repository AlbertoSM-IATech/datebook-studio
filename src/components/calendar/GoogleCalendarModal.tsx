import { useState } from 'react';
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
} from 'lucide-react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useEvents } from '@/hooks/useEvents';
import { GoogleCalendarSyncLog } from '@/types/calendar';

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
    connect,
    disconnect,
    importEvents,
    exportEvents,
    syncNow,
  } = useGoogleCalendar();
  
  const { events, addImportedEvents } = useEvents();
  const [importRange, setImportRange] = useState({ from: subDays(new Date(), 90), to: addDays(new Date(), 90) });
  const [autoSync, setAutoSync] = useState(connection.syncEnabled);

  const handleConnect = async () => {
    await connect();
  };

  const handleDisconnect = async () => {
    await disconnect();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
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

        <div className="space-y-6">
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
                'Conectar'
              )}
            </Button>
          </div>

          {isConnected && (
            <>
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
                  disabled={isLoading}
                >
                  <Download className="h-5 w-5" />
                  <span className="text-xs">Importar</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-col h-auto py-4 gap-2"
                  onClick={handleExport}
                  disabled={isLoading}
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">Exportar</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-col h-auto py-4 gap-2"
                  onClick={handleSync}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn('h-5 w-5', isLoading && 'animate-spin')} />
                  <span className="text-xs">Sincronizar</span>
                </Button>
              </div>

              {/* Sync Logs */}
              {syncLogs.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Historial de sincronización</h4>
                    <ScrollArea className="h-[150px]">
                      <div className="space-y-2">
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
                    </ScrollArea>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

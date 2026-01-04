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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Settings,
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
} from 'lucide-react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useEvents } from '@/hooks/useEvents';
import { GoogleCalendarSyncLog, GoogleCalendarInfo, GoogleOAuthSettings } from '@/types/calendar';

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
  const [activeTab, setActiveTab] = useState<'sync' | 'settings'>('sync');
  
  // OAuth Settings state
  const [settings, setSettings] = useState<GoogleOAuthSettings>({
    syncUserEvents: true,
    syncBookEvents: true,
    syncSystemEvents: false,
    syncDirection: 'to_google',
    targetCalendarId: 'primary',
  });

  const updateSetting = <K extends keyof GoogleOAuthSettings>(
    key: K,
    value: GoogleOAuthSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

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
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'sync' | 'settings')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="sync" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Sincronización
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Ajustes
                  </TabsTrigger>
                </TabsList>

                {/* Sync Tab */}
                <TabsContent value="sync" className="space-y-6 mt-4">
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
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6 mt-4">
                  {/* Target Calendar Selector */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Calendario destino
                    </Label>
                    <Select
                      value={settings.targetCalendarId}
                      onValueChange={(value) => updateSetting('targetCalendarId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un calendario" />
                      </SelectTrigger>
                      <SelectContent>
                        {calendars.map((calendar) => (
                          <SelectItem key={calendar.id} value={calendar.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: calendar.color }}
                              />
                              {calendar.name}
                              {calendar.primary && (
                                <Badge variant="secondary" className="text-xs ml-1">
                                  Principal
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Sync Toggles */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Eventos a sincronizar</Label>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sync-user-modal" className="text-sm font-normal">
                            Sincronizar eventos propios
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Tus eventos creados manualmente
                          </p>
                        </div>
                        <Switch
                          id="sync-user-modal"
                          checked={settings.syncUserEvents}
                          onCheckedChange={(checked) => updateSetting('syncUserEvents', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sync-book-modal" className="text-sm font-normal flex items-center gap-2">
                            Sincronizar eventos de libros
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Eventos del Kanban de tus libros
                          </p>
                        </div>
                        <Switch
                          id="sync-book-modal"
                          checked={settings.syncBookEvents}
                          onCheckedChange={(checked) => updateSetting('syncBookEvents', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sync-system-modal" className="text-sm font-normal">
                            Sincronizar eventos del sistema
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Fechas importantes de la industria
                          </p>
                        </div>
                        <Switch
                          id="sync-system-modal"
                          checked={settings.syncSystemEvents}
                          onCheckedChange={(checked) => updateSetting('syncSystemEvents', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Sync Direction */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Dirección de sincronización</Label>
                    
                    <RadioGroup
                      value={settings.syncDirection}
                      onValueChange={(value) => updateSetting('syncDirection', value as GoogleOAuthSettings['syncDirection'])}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="to_google" id="to_google_modal" />
                        <Label htmlFor="to_google_modal" className="flex items-center gap-2 cursor-pointer flex-1">
                          <span>Publify</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span>Google</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="from_google" id="from_google_modal" />
                        <Label htmlFor="from_google_modal" className="flex items-center gap-2 cursor-pointer flex-1">
                          <span>Google</span>
                          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                          <span>Publify</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 opacity-50">
                        <RadioGroupItem value="bidirectional" id="bidirectional_modal" disabled />
                        <Label htmlFor="bidirectional_modal" className="flex items-center gap-2 cursor-not-allowed flex-1">
                          <span>Publify</span>
                          <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                          <span>Google</span>
                          <Badge variant="secondary" className="text-xs ml-2">Próximamente</Badge>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
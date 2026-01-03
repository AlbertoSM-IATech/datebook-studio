import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Cloud,
  CloudOff,
  Check,
  Loader2,
  RefreshCw,
  Calendar,
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
} from 'lucide-react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { GoogleOAuthSettings } from '@/types/calendar';

interface GoogleCalendarSettingsProps {
  className?: string;
}

export function GoogleCalendarSettings({ className }: GoogleCalendarSettingsProps) {
  const {
    connection,
    isConnected,
    isLoading,
    calendars,
    connect,
    disconnect,
    syncNow,
    selectCalendars,
  } = useGoogleCalendar();

  // OAuth Settings state
  const [settings, setSettings] = useState<GoogleOAuthSettings>({
    syncUserEvents: true,
    syncBookEvents: true,
    syncSystemEvents: false,
    syncDirection: 'to_google',
    targetCalendarId: 'primary',
  });

  const handleConnect = async () => {
    await connect();
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const handleSyncNow = async () => {
    await syncNow();
  };

  const updateSetting = <K extends keyof GoogleOAuthSettings>(
    key: K,
    value: GoogleOAuthSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleTargetCalendarChange = (calendarId: string) => {
    updateSetting('targetCalendarId', calendarId);
    selectCalendars([calendarId]);
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConnected ? (
            <Cloud className="h-5 w-5 text-green-500" />
          ) : (
            <CloudOff className="h-5 w-5 text-muted-foreground" />
          )}
          Google Calendar
        </CardTitle>
        <CardDescription>
          Configura la sincronización con Google Calendar (OAuth 2.0)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
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
              {isConnected && connection.lastSyncAt && (
                <p className="text-xs text-muted-foreground">
                  Última sincronización: {connection.lastSyncAt.toLocaleString('es-ES')}
                </p>
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
                Conectar con Google
              </>
            )}
          </Button>
        </div>

        {isConnected && (
          <>
            <Separator />

            {/* Target Calendar Selector */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendario destino
              </Label>
              <Select
                value={settings.targetCalendarId}
                onValueChange={handleTargetCalendarChange}
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
                    <Label htmlFor="sync-user" className="text-sm font-normal">
                      Sincronizar eventos propios
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Tus eventos creados manualmente
                    </p>
                  </div>
                  <Switch
                    id="sync-user"
                    checked={settings.syncUserEvents}
                    onCheckedChange={(checked) => updateSetting('syncUserEvents', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sync-book" className="text-sm font-normal flex items-center gap-2">
                      Sincronizar eventos de libros
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Eventos del Kanban de tus libros
                    </p>
                  </div>
                  <Switch
                    id="sync-book"
                    checked={settings.syncBookEvents}
                    onCheckedChange={(checked) => updateSetting('syncBookEvents', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sync-system" className="text-sm font-normal">
                      Sincronizar eventos del sistema
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Fechas importantes de la industria
                    </p>
                  </div>
                  <Switch
                    id="sync-system"
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
                  <RadioGroupItem value="to_google" id="to_google" />
                  <Label htmlFor="to_google" className="flex items-center gap-2 cursor-pointer flex-1">
                    <span>Publify</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span>Google</span>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="from_google" id="from_google" />
                  <Label htmlFor="from_google" className="flex items-center gap-2 cursor-pointer flex-1">
                    <span>Google</span>
                    <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                    <span>Publify</span>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 opacity-50">
                  <RadioGroupItem value="bidirectional" id="bidirectional" disabled />
                  <Label htmlFor="bidirectional" className="flex items-center gap-2 cursor-not-allowed flex-1">
                    <span>Publify</span>
                    <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                    <span>Google</span>
                    <Badge variant="secondary" className="text-xs ml-2">Próximamente</Badge>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* Manual Sync Button */}
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Sincronización manual</p>
                <p className="text-xs text-muted-foreground">
                  Sincroniza ahora con la configuración actual
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleSyncNow}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                Sincronizar ahora
              </Button>
            </div>
          </>
        )}

        {!isConnected && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">
              Conecta tu cuenta de Google para sincronizar eventos entre Publify y Google Calendar.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { format, differenceInDays, addDays, isBefore, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Maximize2, Minimize2, Target, Users, AlertTriangle, CheckCircle2, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Flag,
  BookOpen,
  Tag,
  Globe,
  Bell,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { useCalendarContext } from '@/contexts/CalendarContext';
import { useEvents } from '@/hooks/useEvents';
import { useBooks } from '@/hooks/useBooks';
import { Kanban } from 'lucide-react';
import {
  EditorialEvent,
  EventStatus,
  EventPriority,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  MARKETPLACE_CONFIG,
  DEFAULT_TAGS,
  REMINDER_PRESETS,
  ChecklistItem,
  Reminder,
  Marketplace,
  Tag as TagType,
  CampaignType,
  CAMPAIGN_TYPE_CONFIG,
} from '@/types/calendar';

// Campaign Type Labels
const CAMPAIGN_TYPE_LABELS: Record<CampaignType, { label: string; icon: typeof Target; colorClass: string }> = {
  comercial: { label: 'Comercial', icon: Target, colorClass: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  estacional: { label: 'Estacional', icon: Timer, colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  visibilidad: { label: 'Visibilidad', icon: Users, colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
};

// Campaign Window Section Component
function CampaignWindowSection({ event }: { event: EditorialEvent }) {
  const today = new Date();
  const eventDate = event.startAt;
  const campaignWindowDays = event.campaignWindowDays || 0;
  
  // Calculate campaign start date (event date minus campaign window)
  const campaignStartDate = addDays(eventDate, -campaignWindowDays);
  
  // Calculate days remaining and progress
  const daysUntilEvent = differenceInDays(eventDate, today);
  const daysUntilCampaignStart = differenceInDays(campaignStartDate, today);
  const daysSinceCampaignStart = differenceInDays(today, campaignStartDate);
  
  // Calculate progress percentage
  let progress = 0;
  let status: 'upcoming' | 'active' | 'urgent' | 'passed' = 'upcoming';
  let statusMessage = '';
  let statusColor = '';
  
  if (isBefore(today, campaignStartDate)) {
    // Before campaign window starts
    progress = 0;
    status = 'upcoming';
    statusMessage = `Empieza en ${daysUntilCampaignStart} días`;
    statusColor = 'text-muted-foreground';
  } else if (isAfter(today, eventDate)) {
    // Event has passed
    progress = 100;
    status = 'passed';
    statusMessage = 'Evento finalizado';
    statusColor = 'text-muted-foreground';
  } else {
    // Within campaign window
    progress = Math.min(100, Math.round((daysSinceCampaignStart / campaignWindowDays) * 100));
    
    if (daysUntilEvent <= 3) {
      status = 'urgent';
      statusMessage = daysUntilEvent === 0 ? '¡HOY!' : `¡Solo ${daysUntilEvent} días!`;
      statusColor = 'text-red-400';
    } else if (daysUntilEvent <= 7) {
      status = 'urgent';
      statusMessage = `${daysUntilEvent} días restantes`;
      statusColor = 'text-orange-400';
    } else {
      status = 'active';
      statusMessage = `${daysUntilEvent} días para el evento`;
      statusColor = 'text-green-400';
    }
  }

  const campaignType = event.campaignType;
  const CampaignIcon = campaignType ? CAMPAIGN_TYPE_LABELS[campaignType].icon : Target;

  return (
    <div className="space-y-4">
      {/* Campaign Type & Niches */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground flex items-center gap-2">
          <Target className="h-4 w-4" />
          Información de Campaña
        </Label>
        
        {/* Campaign Type Badge */}
        {campaignType && (
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn('gap-1.5', CAMPAIGN_TYPE_LABELS[campaignType].colorClass)}
            >
              <CampaignIcon className="h-3 w-3" />
              {CAMPAIGN_TYPE_LABELS[campaignType].label}
            </Badge>
          </div>
        )}

        {/* Recommended Niches */}
        {event.recommendedNiches && event.recommendedNiches.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3 w-3" />
              Nichos recomendados
            </span>
            <div className="flex flex-wrap gap-1.5">
              {event.recommendedNiches.map((niche) => (
                <Badge key={niche} variant="secondary" className="text-xs capitalize">
                  {niche}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Campaign Window Progress */}
      <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Ventana de Campaña</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {campaignWindowDays} días
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{format(campaignStartDate, 'd MMM', { locale: es })}</span>
            <span className={cn('font-medium', statusColor)}>{statusMessage}</span>
            <span>{format(eventDate, 'd MMM', { locale: es })}</span>
          </div>
          <div className="relative">
            <Progress 
              value={progress} 
              className={cn(
                "h-3",
                status === 'urgent' && "[&>div]:bg-orange-500",
                status === 'passed' && "[&>div]:bg-muted-foreground",
                status === 'active' && "[&>div]:bg-green-500"
              )}
            />
            {status === 'active' && (
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background shadow-sm"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            )}
          </div>
        </div>

        {/* Action Guidance */}
        <div className={cn(
          "flex items-start gap-2 p-2 rounded text-xs",
          status === 'upcoming' && "bg-blue-500/10 text-blue-300",
          status === 'active' && "bg-green-500/10 text-green-300",
          status === 'urgent' && "bg-orange-500/10 text-orange-300",
          status === 'passed' && "bg-muted text-muted-foreground"
        )}>
          {status === 'upcoming' && <Timer className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
          {status === 'active' && <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
          {status === 'urgent' && <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
          {status === 'passed' && <Check className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
          <span>
            {status === 'upcoming' && 'Planifica tu campaña con antelación. Prepara contenido, ads y promociones.'}
            {status === 'active' && 'Campaña en curso. Activa tus promociones y monitoriza resultados.'}
            {status === 'urgent' && '¡Último tramo! Maximiza impacto con acciones de última hora.'}
            {status === 'passed' && 'Evento finalizado. Analiza resultados y documenta aprendizajes.'}
          </span>
        </div>
      </div>
    </div>
  );
}

export function EventPanel() {
  const { selectedEvent, setSelectedEvent, isEventPanelOpen, setIsEventPanelOpen } = useCalendarContext();
  const { updateEvent, deleteEvent, duplicateEvent, saveStatus, navigateToKanbanItem } = useEvents();
  const { books, getBooksByIds } = useBooks();

  const [localEvent, setLocalEvent] = useState<EditorialEvent | null>(null);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync local state with selected event
  useEffect(() => {
    if (selectedEvent) {
      setLocalEvent({ ...selectedEvent });
    }
  }, [selectedEvent]);

  // Debounced save
  useEffect(() => {
    if (!localEvent || !selectedEvent) return;

    const timeout = setTimeout(() => {
      if (JSON.stringify(localEvent) !== JSON.stringify(selectedEvent)) {
        updateEvent(localEvent.id, localEvent);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [localEvent, selectedEvent, updateEvent]);

  const handleClose = () => {
    setIsEventPanelOpen(false);
    setSelectedEvent(null);
  };

  const handleDelete = () => {
    if (localEvent) {
      deleteEvent(localEvent.id);
      handleClose();
    }
  };

  const handleDuplicate = () => {
    if (localEvent) {
      const newEvent = duplicateEvent(localEvent.id);
      if (newEvent) {
        setSelectedEvent(newEvent);
      }
    }
  };

  const updateField = <K extends keyof EditorialEvent>(key: K, value: EditorialEvent[K]) => {
    setLocalEvent(prev => prev ? { ...prev, [key]: value } : null);
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim() || !localEvent) return;
    const newItem: ChecklistItem = {
      id: `cl-${Date.now()}`,
      text: newChecklistItem.trim(),
      done: false,
    };
    updateField('checklistItems', [...localEvent.checklistItems, newItem]);
    setNewChecklistItem('');
  };

  const toggleChecklistItem = (itemId: string) => {
    if (!localEvent) return;
    updateField(
      'checklistItems',
      localEvent.checklistItems.map(item =>
        item.id === itemId ? { ...item, done: !item.done } : item
      )
    );
  };

  const removeChecklistItem = (itemId: string) => {
    if (!localEvent) return;
    updateField(
      'checklistItems',
      localEvent.checklistItems.filter(item => item.id !== itemId)
    );
  };

  const addReminder = (offsetMinutes: number) => {
    if (!localEvent) return;
    const newReminder: Reminder = {
      id: `rem-${Date.now()}`,
      offsetMinutes,
      channel: 'in_app',
      enabled: true,
    };
    updateField('reminders', [...localEvent.reminders, newReminder]);
  };

  const toggleReminder = (reminderId: string) => {
    if (!localEvent) return;
    updateField(
      'reminders',
      localEvent.reminders.map(rem =>
        rem.id === reminderId ? { ...rem, enabled: !rem.enabled } : rem
      )
    );
  };

  const removeReminder = (reminderId: string) => {
    if (!localEvent) return;
    updateField(
      'reminders',
      localEvent.reminders.filter(rem => rem.id !== reminderId)
    );
  };

  const toggleTag = (tag: TagType) => {
    if (!localEvent) return;
    const hasTag = localEvent.tags.some(t => t.id === tag.id);
    updateField(
      'tags',
      hasTag ? localEvent.tags.filter(t => t.id !== tag.id) : [...localEvent.tags, tag]
    );
  };

  const toggleMarketplace = (marketplace: Marketplace) => {
    if (!localEvent) return;
    const currentMarketplaces = localEvent.marketplace || [];
    const hasMarket = currentMarketplaces.includes(marketplace);
    updateField(
      'marketplace',
      hasMarket ? currentMarketplaces.filter(m => m !== marketplace) : [...currentMarketplaces, marketplace]
    );
  };

  const toggleBook = (bookId: string) => {
    if (!localEvent) return;
    const hasBook = localEvent.bookIds.includes(bookId);
    updateField(
      'bookIds',
      hasBook ? localEvent.bookIds.filter(id => id !== bookId) : [...localEvent.bookIds, bookId]
    );
  };

  if (!localEvent) return null;

  const checklistProgress = localEvent.checklistItems.length > 0
    ? Math.round((localEvent.checklistItems.filter(item => item.done).length / localEvent.checklistItems.length) * 100)
    : 0;

  const selectedBooks = getBooksByIds(localEvent.bookIds);

  return (
    <Sheet open={isEventPanelOpen} onOpenChange={setIsEventPanelOpen}>
      <SheetContent className={cn(
        "w-full overflow-y-auto transition-all duration-300",
        isExpanded ? "sm:max-w-4xl" : "sm:max-w-2xl"
      )}>
        <div className="absolute right-12 top-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
            title={isExpanded ? "Contraer panel" : "Expandir panel"}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
        <SheetHeader className="space-y-4">
          {/* Type Badge & Actions */}
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={cn(
                localEvent.type === 'system' ? 'border-accent text-accent' : 'border-primary text-primary'
              )}
            >
              {localEvent.type === 'system' ? 'Evento del Sistema' : 'Mi Evento'}
            </Badge>
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Guardando...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Guardado
                </span>
              )}
              {localEvent.type === 'system' && (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleDuplicate} 
                  className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Copy className="h-3 w-3" />
                  Crear mi versión
                </Button>
              )}
              {localEvent.type === 'user' && (
                <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1">
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Title */}
          <Input
            value={localEvent.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="text-xl font-heading font-semibold border-none px-0 focus-visible:ring-0"
            placeholder="Título del evento"
            disabled={localEvent.type === 'system'}
          />
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Book Events Navigation Banner - ALWAYS PURPLE */}
          {localEvent.origin === 'book_events' && localEvent.kanban_task_id && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-purple-200">Evento del Kanban de libro</span>
                </div>
                <Button 
                  onClick={() => {
                    if (localEvent.book_id && localEvent.kanban_task_id) {
                      navigateToKanbanItem(localEvent.book_id, localEvent.kanban_task_id);
                    }
                  }}
                  className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                  size="sm"
                >
                  <Kanban className="h-4 w-4" />
                  Ir al Kanban
                </Button>
              </div>
            </div>
          )}
          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Estado</Label>
              <Select
                value={localEvent.status}
                onValueChange={(value) => updateField('status', value as EventStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className={cn('px-2 py-0.5 rounded text-xs', config.bgClass)}>
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Prioridad</Label>
              <Select
                value={localEvent.priority}
                onValueChange={(value) => updateField('priority', value as EventPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className={cn('px-2 py-0.5 rounded text-xs', config.bgClass)}>
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Campaign Window - KDP specific for system events */}
          {localEvent.type === 'system' && localEvent.campaignWindowDays && (
            <>
              <CampaignWindowSection event={localEvent} />
              <Separator />
            </>
          )}

          {/* Date & Time */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Fecha y hora
              </Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="allDay" className="text-xs">Todo el día</Label>
                <Switch
                  id="allDay"
                  checked={localEvent.allDay}
                  onCheckedChange={(checked) => updateField('allDay', checked)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(localEvent.startAt, 'dd MMM yyyy', { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localEvent.startAt}
                    onSelect={(date) => date && updateField('startAt', date)}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(localEvent.endAt, 'dd MMM yyyy', { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localEvent.endAt}
                    onSelect={(date) => date && updateField('endAt', date)}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Separator />

          {/* Books */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Libros asociados
            </Label>
            <div className="flex flex-wrap gap-2">
              {books.map((book) => (
                <Badge
                  key={book.id}
                  variant={localEvent.bookIds.includes(book.id) ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleBook(book.id)}
                >
                  {book.title}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Etiquetas
            </Label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_TAGS.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className={cn(
                    'cursor-pointer transition-all',
                    localEvent.tags.some(t => t.id === tag.id) && 'ring-2 ring-offset-1'
                  )}
                  style={{
                    borderColor: tag.color,
                    color: localEvent.tags.some(t => t.id === tag.id) ? tag.color : undefined,
                  }}
                  onClick={() => toggleTag(tag)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Marketplace */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Mercados
            </Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(MARKETPLACE_CONFIG).map(([key, config]) => (
                <Badge
                  key={key}
                  variant={(localEvent.marketplace || []).includes(key as Marketplace) ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleMarketplace(key as Marketplace)}
                >
                  {config.flag} {key}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">Descripción</Label>
            <Textarea
              value={localEvent.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Añade una descripción..."
              rows={3}
            />
          </div>

          <Separator />

          {/* Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Checklist</Label>
              {localEvent.checklistItems.length > 0 && (
                <span className="text-xs text-muted-foreground">{checklistProgress}% completado</span>
              )}
            </div>

            {localEvent.checklistItems.length > 0 && (
              <Progress value={checklistProgress} className="h-2" />
            )}

            <div className="space-y-2">
              {localEvent.checklistItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <Checkbox
                    checked={item.done}
                    onCheckedChange={() => toggleChecklistItem(item.id)}
                  />
                  <span className={cn('flex-1 text-sm', item.done && 'line-through text-muted-foreground')}>
                    {item.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeChecklistItem(item.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                placeholder="Añadir item..."
                onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={addChecklistItem}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Reminders */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Recordatorios
            </Label>

            <div className="space-y-2">
              {localEvent.reminders.map((reminder) => {
                const preset = REMINDER_PRESETS.find(p => p.offsetMinutes === reminder.offsetMinutes);
                return (
                  <div key={reminder.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <span className="text-sm">{preset?.label || `${reminder.offsetMinutes} min antes`}</span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={reminder.enabled}
                        onCheckedChange={() => toggleReminder(reminder.id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeReminder(reminder.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Añadir recordatorio
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="start">
                <div className="space-y-1">
                  {REMINDER_PRESETS.map((preset) => (
                    <Button
                      key={preset.offsetMinutes}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => addReminder(preset.offsetMinutes)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
            <p>Creado: {format(localEvent.createdAt, "d MMM yyyy 'a las' HH:mm", { locale: es })}</p>
            <p>Actualizado: {format(localEvent.updatedAt, "d MMM yyyy 'a las' HH:mm", { locale: es })}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

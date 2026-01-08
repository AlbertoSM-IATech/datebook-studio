import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
} from '@/types/calendar';

export function EventPanel() {
  const { selectedEvent, setSelectedEvent, isEventPanelOpen, setIsEventPanelOpen } = useCalendarContext();
  const { updateEvent, deleteEvent, duplicateEvent, saveStatus, navigateToKanbanItem } = useEvents();
  const { books, getBooksByIds } = useBooks();

  const [localEvent, setLocalEvent] = useState<EditorialEvent | null>(null);
  const [newChecklistItem, setNewChecklistItem] = useState('');

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
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
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
                <Button variant="outline" size="sm" onClick={handleDuplicate} className="gap-1">
                  <Copy className="h-3 w-3" />
                  Duplicar
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

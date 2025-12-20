import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Expand } from 'lucide-react';
import { useCalendarContext } from '@/contexts/CalendarContext';
import { useEvents } from '@/hooks/useEvents';
import {
  EventFormData,
  EventStatus,
  EventPriority,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  DEFAULT_TAGS,
  Tag,
} from '@/types/calendar';

export function QuickCreateModal() {
  const { isQuickCreateOpen, setIsQuickCreateOpen, quickCreateDate, setQuickCreateDate, setSelectedEvent, setIsEventPanelOpen } = useCalendarContext();
  const { createEvent } = useEvents();

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<EventStatus>('pending');
  const [priority, setPriority] = useState<EventPriority>('medium');
  const [allDay, setAllDay] = useState(true);
  const [startDate, setStartDate] = useState<Date>(quickCreateDate || new Date());
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  // Reset form when modal opens
  const handleOpenChange = (open: boolean) => {
    if (open && quickCreateDate) {
      setStartDate(quickCreateDate);
    }
    if (!open) {
      setTitle('');
      setStatus('pending');
      setPriority('medium');
      setAllDay(true);
      setSelectedTags([]);
    }
    setIsQuickCreateOpen(open);
  };

  const toggleTag = (tag: Tag) => {
    setSelectedTags(prev =>
      prev.some(t => t.id === tag.id)
        ? prev.filter(t => t.id !== tag.id)
        : [...prev, tag]
    );
  };

  const handleCreate = () => {
    if (!title.trim()) return;

    const eventData: EventFormData = {
      title: title.trim(),
      type: 'user',
      status,
      priority,
      startAt: startDate,
      endAt: startDate,
      allDay,
      marketplace: [],
      bookIds: [],
      tags: selectedTags,
      description: '',
      checklistItems: [],
      reminders: [],
    };

    const newEvent = createEvent(eventData);
    handleOpenChange(false);
  };

  const handleOpenFull = () => {
    if (!title.trim()) return;

    const eventData: EventFormData = {
      title: title.trim(),
      type: 'user',
      status,
      priority,
      startAt: startDate,
      endAt: startDate,
      allDay,
      marketplace: [],
      bookIds: [],
      tags: selectedTags,
      description: '',
      checklistItems: [],
      reminders: [],
    };

    const newEvent = createEvent(eventData);
    handleOpenChange(false);
    setSelectedEvent(newEvent);
    setIsEventPanelOpen(true);
  };

  return (
    <Dialog open={isQuickCreateOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Crear evento rápido</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre del evento..."
              autoFocus
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Fecha</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="allDay" className="text-sm font-normal">Todo el día</Label>
                <Switch id="allDay" checked={allDay} onCheckedChange={setAllDay} />
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(startDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as EventStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as EventPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Etiquetas</Label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_TAGS.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className={cn(
                    'cursor-pointer transition-all',
                    selectedTags.some(t => t.id === tag.id) && 'ring-2 ring-offset-1'
                  )}
                  style={{
                    borderColor: tag.color,
                    color: selectedTags.some(t => t.id === tag.id) ? tag.color : undefined,
                  }}
                  onClick={() => toggleTag(tag)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={handleOpenFull} disabled={!title.trim()} className="gap-2">
            <Expand className="h-4 w-4" />
            Abrir ficha completa
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim()}>
            Crear evento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

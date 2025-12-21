import { useState, useEffect, KeyboardEvent } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarIcon, Expand, Plus, X, BookOpen, Tag } from 'lucide-react';
import { useCalendarContext } from '@/contexts/CalendarContext';
import { useEvents } from '@/hooks/useEvents';
import { useBooks } from '@/hooks/useBooks';
import {
  EventFormData,
  EventStatus,
  EventPriority,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  DEFAULT_TAGS,
  Tag as TagType,
} from '@/types/calendar';

export function QuickCreateModal() {
  const { isQuickCreateOpen, setIsQuickCreateOpen, quickCreateDate, setQuickCreateDate, setSelectedEvent, setIsEventPanelOpen } = useCalendarContext();
  const { createEvent } = useEvents();
  const { books } = useBooks();

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<EventStatus>('pending');
  const [priority, setPriority] = useState<EventPriority>('medium');
  const [allDay, setAllDay] = useState(true);
  const [startDate, setStartDate] = useState<Date>(quickCreateDate || new Date());
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<TagType[]>([]);
  const [newTagName, setNewTagName] = useState('');

  const allTags = [...DEFAULT_TAGS, ...customTags];

  // Sync date when quickCreateDate changes
  useEffect(() => {
    if (quickCreateDate) {
      setStartDate(quickCreateDate);
    }
  }, [quickCreateDate]);

  // Reset form when modal opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTitle('');
      setStatus('pending');
      setPriority('medium');
      setAllDay(true);
      setSelectedTags([]);
      setSelectedBookIds([]);
      setNewTagName('');
    }
    setIsQuickCreateOpen(open);
  };

  const toggleTag = (tag: TagType) => {
    setSelectedTags(prev =>
      prev.some(t => t.id === tag.id)
        ? prev.filter(t => t.id !== tag.id)
        : [...prev, tag]
    );
  };

  const toggleBook = (bookId: string) => {
    setSelectedBookIds(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleCreateTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTagName.trim()) {
      e.preventDefault();
      const newTag: TagType = {
        id: `tag-custom-${Date.now()}`,
        name: newTagName.trim(),
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      };
      setCustomTags(prev => [...prev, newTag]);
      setSelectedTags(prev => [...prev, newTag]);
      setNewTagName('');
    }
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
      bookIds: selectedBookIds,
      tags: selectedTags,
      description: '',
      checklistItems: [],
      reminders: [],
    };

    createEvent(eventData);
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
      bookIds: selectedBookIds,
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
      <DialogContent 
        className="sm:max-w-[560px] max-h-[90vh] flex flex-col"
        aria-describedby="quick-create-description"
      >
        <DialogHeader>
          <DialogTitle className="font-heading">Crear evento rápido</DialogTitle>
          <DialogDescription id="quick-create-description">
            Completa los campos para crear un nuevo evento en tu calendario editorial.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-5 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nombre del evento..."
                autoFocus
                aria-required="true"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  Fecha <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor="allDay" className="text-sm font-normal cursor-pointer">Todo el día</Label>
                  <Switch id="allDay" checked={allDay} onCheckedChange={setAllDay} />
                </div>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left font-normal"
                    aria-label="Seleccionar fecha"
                  >
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
                <Label htmlFor="status">Estado</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as EventStatus)}>
                  <SelectTrigger id="status">
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
                <Label htmlFor="priority">Prioridad</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as EventPriority)}>
                  <SelectTrigger id="priority">
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

            {/* Books */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Libros asociados
              </Label>
              <div className="flex flex-wrap gap-2 p-3 border border-input rounded-md bg-background min-h-[44px]">
                {books.map((book) => (
                  <Badge
                    key={book.id}
                    variant={selectedBookIds.includes(book.id) ? 'default' : 'outline'}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => toggleBook(book.id)}
                    role="checkbox"
                    aria-checked={selectedBookIds.includes(book.id)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleBook(book.id);
                      }
                    }}
                  >
                    {book.title}
                    {selectedBookIds.includes(book.id) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
                {books.length === 0 && (
                  <span className="text-sm text-muted-foreground">No hay libros disponibles</span>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Etiquetas
              </Label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 p-3 border border-input rounded-md bg-background min-h-[44px]">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className={cn(
                        'cursor-pointer transition-all hover:opacity-80',
                        selectedTags.some(t => t.id === tag.id) && 'ring-2 ring-offset-1'
                      )}
                      style={{
                        borderColor: tag.color,
                        color: selectedTags.some(t => t.id === tag.id) ? tag.color : undefined,
                        backgroundColor: selectedTags.some(t => t.id === tag.id) ? `${tag.color}15` : undefined,
                      }}
                      onClick={() => toggleTag(tag)}
                      role="checkbox"
                      aria-checked={selectedTags.some(t => t.id === tag.id)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleTag(tag);
                        }
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
                
                {/* Create new tag */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={handleCreateTag}
                      placeholder="Crear nueva etiqueta..."
                      className="pr-10"
                      aria-label="Nombre de nueva etiqueta"
                    />
                    <Plus className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">Enter para crear</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0 border-t pt-4 mt-2">
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button 
            variant="outline" 
            onClick={handleOpenFull} 
            disabled={!title.trim()} 
            className="gap-2"
          >
            <Expand className="h-4 w-4" />
            Abrir ficha completa
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!title.trim()}
            className="shadow-coral"
          >
            Crear evento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

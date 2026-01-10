import { useState, useMemo, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Cloud, BookOpen, GripVertical, Lock } from 'lucide-react';
import { useCalendarContext } from '@/contexts/CalendarContext';
import { useEvents } from '@/hooks/useEvents';
import { useBooks } from '@/hooks/useBooks';
import { EditorialEvent, CalendarFilters, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types/calendar';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

interface MonthlyViewProps {
  filters: CalendarFilters;
  legacyStyle?: boolean;
}

interface DayEventsSheetProps {
  date: Date | null;
  events: EditorialEvent[];
  onClose: () => void;
  onEventClick: (event: EditorialEvent) => void;
  onCreateEvent: (date: Date) => void;
}

function DayEventsSheet({ date, events, onClose, onEventClick, onCreateEvent }: DayEventsSheetProps) {
  const { getBooksByIds } = useBooks();
  
  if (!date) return null;

  // UNIFIED: book_events with purple color
  const getOriginIcon = (origin: string) => {
    switch (origin) {
      case 'google': return <Cloud className="h-3 w-3 text-blue-500" />;
      case 'book_events': return <BookOpen className="h-3 w-3 text-purple-500" />;
      default: return <CalendarIcon className="h-3 w-3 text-primary" />;
    }
  };

  return (
    <Sheet open={!!date} onOpenChange={() => onClose()}>
      <SheetContent 
        className="w-full sm:max-w-md overflow-y-auto"
        aria-describedby="day-events-description"
      >
        <SheetHeader>
          <SheetTitle className="font-heading capitalize">
            {format(date, "EEEE d 'de' MMMM", { locale: es })}
          </SheetTitle>
          <SheetDescription id="day-events-description">
            {events.length > 0 
              ? `${events.length} evento(s) programado(s)`
              : 'No hay eventos para este día'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No hay eventos este día</p>
              <Button onClick={() => onCreateEvent(date)} className="gap-2">
                <Plus className="h-4 w-4" />
                Crear evento
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {events.map((event) => {
                  const statusConfig = STATUS_CONFIG[event.status];
                  const priorityConfig = PRIORITY_CONFIG[event.priority];
                  const books = getBooksByIds(event.bookIds);

                  return (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={cn(
                        'w-full text-left p-4 rounded-lg border border-border/50 transition-all',
                        'hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary',
                        event.type === 'system' ? 'bg-muted/30' : 'bg-card'
                      )}
                      aria-label={`Ver evento: ${event.title}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {getOriginIcon(event.origin)}
                            <p className="font-medium truncate">{event.title}</p>
                          </div>
                          {!event.allDay && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(event.startAt, 'HH:mm')} - {format(event.endAt, 'HH:mm')}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className={cn('text-xs shrink-0', statusConfig.bgClass)}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className={cn('text-xs', priorityConfig.bgClass)}>
                          {priorityConfig.label}
                        </Badge>
                        {event.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: tag.color, color: tag.color }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {event.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{event.tags.length - 2}
                          </Badge>
                        )}
                      </div>

                      {books.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          📚 {books.length === 1 ? books[0].title : `${books.length} libros`}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              <Button 
                onClick={() => onCreateEvent(date)} 
                className="w-full gap-2"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                Crear otro evento
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function MonthlyView({ filters, legacyStyle = false }: MonthlyViewProps) {
  const { 
    selectedDate, 
    setSelectedDate, 
    setSelectedEvent, 
    setIsEventPanelOpen, 
    setQuickCreateDate, 
    setIsQuickCreateOpen 
  } = useCalendarContext();
  const { getEventsForDay, filterEvents, moveEvent } = useEvents();
  const [draggedEvent, setDraggedEvent] = useState<EditorialEvent | null>(null);
  const [dragOverDay, setDragOverDay] = useState<Date | null>(null);
  const [selectedDaySheet, setSelectedDaySheet] = useState<Date | null>(null);
  const [daySheetEvents, setDaySheetEvents] = useState<EditorialEvent[]>([]);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

  // Calculate number of weeks for proper grid sizing
  const numWeeks = Math.ceil(days.length / 7);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(direction === 'prev' ? subMonths(selectedDate, 1) : addMonths(selectedDate, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handleDayClick = (day: Date) => {
    const dayEvents = filterEvents(getEventsForDay(day), filters);
    
    if (legacyStyle) {
      setSelectedDaySheet(day);
      setDaySheetEvents(dayEvents);
    } else {
      if (dayEvents.length === 0) {
        setQuickCreateDate(day);
        setIsQuickCreateOpen(true);
      }
    }
  };

  const handleEventClick = (event: EditorialEvent) => {
    setSelectedDaySheet(null);
    setSelectedEvent(event);
    setIsEventPanelOpen(true);
  };

  const handleCreateEvent = (date: Date) => {
    setSelectedDaySheet(null);
    setQuickCreateDate(date);
    setIsQuickCreateOpen(true);
  };

  const handleDragStart = useCallback((e: React.DragEvent, event: EditorialEvent) => {
    if (event.type === 'system') {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', event.id);
    setDraggedEvent(event);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedEvent(null);
    setDragOverDay(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, day: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDay(day);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverDay(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, day: Date) => {
    e.preventDefault();
    if (draggedEvent && draggedEvent.type !== 'system' && draggedEvent.origin !== 'book_events') {
      const originalDate = new Date(draggedEvent.startAt);
      const eventId = draggedEvent.id;
      const eventTitle = draggedEvent.title;
      
      moveEvent(eventId, day);
      console.log('Toast with action triggered for event:', eventTitle);
      toast({
        title: "Evento movido",
        description: `"${eventTitle}" movido al ${format(day, "d 'de' MMMM", { locale: es })}`,
        duration: 5000,
        action: (
          <ToastAction 
            altText="Deshacer movimiento"
            onClick={() => {
              console.log('Undo clicked for event:', eventTitle);
              moveEvent(eventId, originalDate);
              toast({
                title: "Movimiento deshecho",
                description: `"${eventTitle}" restaurado al ${format(originalDate, "d 'de' MMMM", { locale: es })}`,
              });
            }}
          >
            Deshacer
          </ToastAction>
        ),
      });
    }
    setDraggedEvent(null);
    setDragOverDay(null);
  }, [draggedEvent, moveEvent]);

  // Check for events from different sources - UNIFIED book_events
  const getSourceIndicators = (dayEvents: EditorialEvent[]) => {
    const hasSystem = dayEvents.some(e => e.type === 'system');
    const hasUser = dayEvents.some(e => e.type === 'user' && e.origin === 'local');
    const hasGoogle = dayEvents.some(e => e.origin === 'google');
    const hasBookEvents = dayEvents.some(e => e.origin === 'book_events');
    return { hasSystem, hasUser, hasGoogle, hasBookEvents };
  };

  // Legacy widget style (dark, compact, numeric indicators, SQUARE DAYS)
  if (legacyStyle) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-heading font-semibold capitalize">
              {format(selectedDate, 'MMMM yyyy', { locale: es })}
            </h2>
            <Button variant="ghost" size="sm" onClick={goToToday} className="gap-1.5 text-xs">
              <CalendarIcon className="h-3.5 w-3.5" />
              Hoy
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => navigateMonth('prev')}
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => navigateMonth('next')}
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid - Legacy Style with Square Days */}
        <div className="flex-1 flex flex-col">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-1.5"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid - Square cells */}
          <div 
            className="grid grid-cols-7 gap-1 flex-1"
            style={{ gridTemplateRows: `repeat(${numWeeks}, 1fr)` }}
          >
            {days.map((day) => {
              const dayEvents = filterEvents(getEventsForDay(day), filters);
              const eventCount = dayEvents.length;
              const isCurrentMonth = isSameMonth(day, selectedDate);
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              const isDragOver = dragOverDay && isSameDay(day, dragOverDay);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'relative aspect-square p-1.5 rounded-md border transition-all cursor-pointer flex flex-col',
                    'bg-muted/40 border-border/30 hover:bg-muted/60 hover:border-border/50',
                    !isCurrentMonth && 'opacity-30',
                    isSelected && 'ring-2 ring-primary border-primary bg-primary/10',
                    isTodayDate && 'bg-primary/20 border-primary/50',
                    isDragOver && 'bg-accent/30 border-accent border-2 scale-[1.02] ring-2 ring-accent/50'
                  )}
                  onClick={() => handleDayClick(day)}
                  onDragOver={(e) => handleDragOver(e, day)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, day)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${format(day, "d 'de' MMMM", { locale: es })}${eventCount > 0 ? `, ${eventCount} eventos` : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleDayClick(day);
                    }
                  }}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        'text-xs font-medium leading-none',
                        isTodayDate && 'bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px]',
                        !isTodayDate && !isCurrentMonth && 'text-muted-foreground/50'
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    {eventCount > 2 && (
                      <span className="text-[9px] text-muted-foreground">+{eventCount - 2}</span>
                    )}
                  </div>

                  {/* Event chips with titles - max 2 visible */}
                  <div className="flex-1 space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map((event) => {
                      // Color based on origin - white text for better readability
                      let bgColor = 'bg-primary border-primary/60 text-white';
                      if (event.origin === 'book_events') {
                        bgColor = 'bg-purple-500 border-purple-400 text-white';
                      } else if (event.type === 'system') {
                        bgColor = 'bg-accent border-accent/60 text-white';
                      } else if (event.origin === 'google') {
                        bgColor = 'bg-blue-500 border-blue-400 text-white';
                      }
                      
                      const isDraggable = event.type !== 'system' && event.origin !== 'book_events';
                      const isBeingDragged = draggedEvent?.id === event.id;
                      
                      const isBookEvent = event.origin === 'book_events';
                      const isSystemEvent = event.type === 'system';
                      const showLockIcon = isBookEvent || isSystemEvent;
                      
                      return (
                        <Tooltip key={event.id}>
                          <TooltipTrigger asChild>
                            <div
                              draggable={isDraggable}
                              onDragStart={(e) => {
                                e.stopPropagation();
                                handleDragStart(e, event);
                              }}
                              onDragEnd={handleDragEnd}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                              className={cn(
                                'group flex items-center gap-1 px-1 py-0.5 rounded border text-[10px] truncate transition-all',
                                bgColor,
                                isDraggable && 'cursor-grab active:cursor-grabbing hover:scale-[1.02]',
                                isBeingDragged && 'opacity-50 scale-95 ring-2 ring-primary'
                              )}
                            >
                              {isDraggable ? (
                                <GripVertical className="h-2.5 w-2.5 opacity-0 group-hover:opacity-60 shrink-0 transition-opacity" />
                              ) : showLockIcon && (
                                <Lock className="h-2.5 w-2.5 opacity-60 shrink-0" />
                              )}
                              <span className="truncate">{event.title}</span>
                            </div>
                          </TooltipTrigger>
                          {showLockIcon && (
                            <TooltipContent side="top" className="text-xs">
                              {isBookEvent ? 'Evento de libro - no movible' : 'Evento del sistema - no movible'}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Drag indicator */}
        {draggedEvent && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card border-2 border-primary/50 rounded-lg px-4 py-3 shadow-xl z-50 animate-fade-in flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <GripVertical className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{draggedEvent.title}</p>
              <p className="text-xs text-muted-foreground">Suelta en el día destino</p>
            </div>
          </div>
        )}

        {/* Day Events Sheet */}
        <DayEventsSheet
          date={selectedDaySheet}
          events={daySheetEvents}
          onClose={() => setSelectedDaySheet(null)}
          onEventClick={handleEventClick}
          onCreateEvent={handleCreateEvent}
        />
      </div>
    );
  }

  // Original style with event chips (full page mode)
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-heading font-semibold capitalize">
            {format(selectedDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <Button variant="outline" size="sm" onClick={goToToday} className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            Hoy
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigateMonth('prev')}
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigateMonth('next')}
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div 
          className="grid grid-cols-7 gap-1 flex-1"
          style={{ gridTemplateRows: `repeat(${numWeeks}, 1fr)` }}
        >
          {days.map((day) => {
            const dayEvents = filterEvents(getEventsForDay(day), filters);
            const isCurrentMonth = isSameMonth(day, selectedDate);
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            const isDragOver = dragOverDay && isSameDay(day, dragOverDay);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'min-h-[100px] p-2 rounded-lg border border-border/50 transition-all cursor-pointer',
                  'hover:border-primary/50 hover:bg-primary/5',
                  !isCurrentMonth && 'opacity-40 bg-muted/30',
                  isSelected && 'ring-2 ring-primary border-primary',
                  isTodayDate && 'bg-primary/10 border-primary/30',
                  isDragOver && 'bg-accent/20 border-accent border-2 scale-[1.02]'
                )}
                onClick={() => handleDayClick(day)}
                onDragOver={(e) => handleDragOver(e, day)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, day)}
                role="button"
                tabIndex={0}
                aria-label={`${format(day, "d 'de' MMMM", { locale: es })}${dayEvents.length > 0 ? `, ${dayEvents.length} eventos` : ''}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleDayClick(day);
                  }
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isTodayDate && 'bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center',
                      !isTodayDate && !isCurrentMonth && 'text-muted-foreground/50'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                {dayEvents.length > 0 && (
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        draggable={event.type !== 'system'}
                        onDragStart={(e) => handleDragStart(e, event)}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer',
                          'hover:ring-1 hover:ring-primary transition-all',
                          event.type === 'system' 
                            ? 'bg-accent/20 text-accent-foreground'
                            : 'bg-primary/20 text-primary-foreground'
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{dayEvents.length - 3} más
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Drag indicator */}
      {draggedEvent && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg px-4 py-2 shadow-lg z-50 animate-fade-in">
          <p className="text-sm text-muted-foreground">
            Arrastra <span className="font-medium text-foreground">{draggedEvent.title}</span> a otro día
          </p>
        </div>
      )}
    </div>
  );
}
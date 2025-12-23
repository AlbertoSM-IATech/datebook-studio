import { useState, useMemo, useCallback } from 'react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useCalendarContext } from '@/contexts/CalendarContext';
import { useEvents } from '@/hooks/useEvents';
import { useBookKanban } from '@/hooks/useBookKanban';
import { EditorialEvent, CalendarFilters, STATUS_CONFIG, PRIORITY_CONFIG, CalendarItem } from '@/types/calendar';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

interface MonthlyViewProps {
  filters: CalendarFilters;
  legacyStyle?: boolean;
}

interface DayPanelProps {
  date: Date | null;
  events: EditorialEvent[];
  kanbanItems: CalendarItem[];
  onClose: () => void;
  onEventClick: (event: EditorialEvent) => void;
  onCreateEvent: (date: Date) => void;
  onNavigateToBook?: (bookId: string) => void;
}

function DayPanel({ date, events, kanbanItems, onClose, onEventClick, onCreateEvent, onNavigateToBook }: DayPanelProps) {
  if (!date) return null;

  const allItems = [
    ...events.map(e => ({ ...e, isKanban: false })),
    ...kanbanItems.map(k => ({ ...k, isKanban: true })),
  ];

  return (
    <Sheet open={!!date} onOpenChange={() => onClose()}>
      <SheetContent 
        className="w-full sm:max-w-md overflow-y-auto"
        aria-describedby="day-panel-description"
      >
        <SheetHeader>
          <SheetTitle className="font-heading capitalize">
            {format(date, "EEEE d 'de' MMMM", { locale: es })}
          </SheetTitle>
          <SheetDescription id="day-panel-description">
            {allItems.length > 0 
              ? `${allItems.length} evento(s) programado(s) para este día`
              : 'No hay eventos para este día'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {allItems.length === 0 ? (
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

                  return (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={cn(
                        'w-full text-left p-4 rounded-lg border border-border/50 transition-all',
                        'hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary',
                        event.type === 'system' ? 'event-system' : 'event-user'
                      )}
                      aria-label={`Ver evento: ${event.title}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{event.title}</p>
                          {!event.allDay && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(event.startAt, 'HH:mm')}
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
                      </div>
                    </button>
                  );
                })}

                {/* Kanban items */}
                {kanbanItems.map((item) => {
                  const statusConfig = STATUS_CONFIG[item.status];
                  const priorityConfig = PRIORITY_CONFIG[item.priority];

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'w-full text-left p-4 rounded-lg border border-accent/30 bg-accent/5 transition-all',
                        'hover:border-accent/50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">Kanban</Badge>
                            <p className="font-medium truncate">{item.title}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Origen: Kanban del libro
                          </p>
                        </div>
                        <Badge variant="outline" className={cn('text-xs shrink-0', statusConfig.bgClass)}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className={cn('text-xs', priorityConfig.bgClass)}>
                          {priorityConfig.label}
                        </Badge>
                        {item.linkToBookId && onNavigateToBook && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => onNavigateToBook(item.linkToBookId!)}
                          >
                            Abrir libro
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button 
                onClick={() => onCreateEvent(date)} 
                className="w-full gap-2"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                Crear evento en este día
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function MonthlyView({ filters, legacyStyle = false }: MonthlyViewProps) {
  const { selectedDate, setSelectedDate, setSelectedEvent, setIsEventPanelOpen, setQuickCreateDate, setIsQuickCreateOpen } = useCalendarContext();
  const { getEventsForDay, filterEvents, moveEvent } = useEvents();
  const { getItemsForDay, navigateToBook } = useBookKanban({ enabled: filters.showKanbanEvents });
  
  const [draggedEvent, setDraggedEvent] = useState<EditorialEvent | null>(null);
  const [dragOverDay, setDragOverDay] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayEvents, setDayEvents] = useState<EditorialEvent[]>([]);
  const [dayKanbanItems, setDayKanbanItems] = useState<CalendarItem[]>([]);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(direction === 'prev' ? subMonths(selectedDate, 1) : addMonths(selectedDate, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handleDayClick = (day: Date) => {
    const events = filterEvents(getEventsForDay(day), filters);
    const kanbanItems = filters.showKanbanEvents ? getItemsForDay(day) : [];
    
    if (legacyStyle) {
      // In legacy style, always open the day panel
      setSelectedDay(day);
      setDayEvents(events);
      setDayKanbanItems(kanbanItems);
    } else if (events.length === 0 && kanbanItems.length === 0) {
      setQuickCreateDate(day);
      setIsQuickCreateOpen(true);
    } else {
      setSelectedDay(day);
      setDayEvents(events);
      setDayKanbanItems(kanbanItems);
    }
  };

  const handleCloseDayPanel = () => {
    setSelectedDay(null);
    setDayEvents([]);
    setDayKanbanItems([]);
  };

  const handleEventClick = (event: EditorialEvent) => {
    handleCloseDayPanel();
    setSelectedEvent(event);
    setIsEventPanelOpen(true);
  };

  const handleCreateEvent = (date: Date) => {
    handleCloseDayPanel();
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
    if (draggedEvent && draggedEvent.type !== 'system') {
      moveEvent(draggedEvent.id, day);
    }
    setDraggedEvent(null);
    setDragOverDay(null);
  }, [draggedEvent, moveEvent]);

  // Get event count for a day (including kanban items)
  const getEventCountForDay = useCallback((day: Date) => {
    const events = filterEvents(getEventsForDay(day), filters);
    const kanbanItems = filters.showKanbanEvents ? getItemsForDay(day) : [];
    return {
      total: events.length + kanbanItems.length,
      events: events.length,
      kanban: kanbanItems.length,
      hasSystem: events.some(e => e.type === 'system'),
    };
  }, [filterEvents, getEventsForDay, getItemsForDay, filters]);

  // Get density class for legacy style
  const getDensityClass = (count: number) => {
    if (count === 0) return '';
    if (count === 1) return 'bg-primary/20';
    if (count <= 3) return 'bg-primary/40';
    return 'bg-primary/60';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
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
      <div className="flex-1 flex flex-col min-h-0">
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

        {/* Days Grid - Legacy Style */}
        <div className={cn(
          "grid grid-cols-7 gap-1 flex-1",
          legacyStyle && "gap-0.5"
        )}>
          {days.map((day) => {
            const eventCounts = getEventCountForDay(day);
            const isCurrentMonth = isSameMonth(day, selectedDate);
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
            const isTodayDate = isToday(day);
            const isDragOver = dragOverDay && isSameDay(day, dragOverDay);

            if (legacyStyle) {
              // Legacy dark solid cell style with numeric indicator
              return (
                <Tooltip key={day.toISOString()}>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        'relative flex flex-col items-start p-2 rounded-md transition-all min-h-[80px]',
                        'border border-border/30 bg-card/50',
                        'hover:bg-primary/10 hover:border-primary/50',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset',
                        !isCurrentMonth && 'opacity-30 bg-muted/20',
                        isSelected && 'ring-2 ring-primary border-primary',
                        isTodayDate && 'border-primary bg-primary/10',
                        isDragOver && 'bg-accent/20 border-accent border-2',
                        eventCounts.total > 0 && isCurrentMonth && getDensityClass(eventCounts.total)
                      )}
                      onClick={() => handleDayClick(day)}
                      onDragOver={(e) => handleDragOver(e, day)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day)}
                      disabled={!isCurrentMonth}
                      aria-label={`${format(day, "d 'de' MMMM", { locale: es })}${eventCounts.total > 0 ? `, ${eventCounts.total} eventos` : ''}`}
                    >
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isTodayDate && 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center',
                          !isTodayDate && !isCurrentMonth && 'text-muted-foreground'
                        )}
                      >
                        {format(day, 'd')}
                      </span>
                      
                      {/* Event count badge */}
                      {eventCounts.total > 0 && isCurrentMonth && (
                        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1">
                          <Badge 
                            variant="secondary" 
                            className="h-5 min-w-[20px] px-1 text-[10px] font-bold bg-foreground/10 text-foreground"
                          >
                            {eventCounts.total}
                          </Badge>
                          {eventCounts.hasSystem && (
                            <div className="w-1.5 h-1.5 rounded-full bg-accent" title="Evento del sistema" />
                          )}
                          {eventCounts.kanban > 0 && (
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Kanban" />
                          )}
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  {eventCounts.total > 0 && isCurrentMonth && (
                    <TooltipContent side="top" align="center" className="max-w-xs p-3">
                      <div className="space-y-2">
                        <p className="font-medium text-sm capitalize">
                          {format(day, "d 'de' MMMM", { locale: es })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {eventCounts.total} evento(s)
                          {eventCounts.kanban > 0 && ` • ${eventCounts.kanban} del kanban`}
                        </p>
                        <p className="text-xs">Click para ver detalles</p>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            }

            // Standard style (unchanged from original)
            const dayEvents = filterEvents(getEventsForDay(day), filters);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'min-h-[120px] p-2 rounded-lg border border-border/50 transition-all cursor-pointer',
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
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isTodayDate && 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center',
                      !isTodayDate && !isCurrentMonth && 'text-muted-foreground'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{dayEvents.length - 3}</span>
                  )}
                </div>
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
                        'text-xs px-2 py-1 rounded truncate cursor-pointer',
                        event.type === 'system' 
                          ? 'bg-accent/20 text-accent-foreground border-l-2 border-l-accent'
                          : 'bg-primary/20 text-foreground border-l-2 border-l-primary',
                        event.type !== 'system' && 'cursor-grab active:cursor-grabbing'
                      )}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
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

      {/* Day Panel */}
      <DayPanel
        date={selectedDay}
        events={dayEvents}
        kanbanItems={dayKanbanItems}
        onClose={handleCloseDayPanel}
        onEventClick={handleEventClick}
        onCreateEvent={handleCreateEvent}
        onNavigateToBook={navigateToBook}
      />
    </div>
  );
}
            Arrastra <span className="font-medium text-foreground">{draggedEvent.title}</span> a otro día
          </p>
        </div>
      )}

      {/* Day Panel */}
      <DayPanel
        date={selectedDay}
        events={dayEvents}
        kanbanItems={dayKanbanItems}
        onClose={handleCloseDayPanel}
        onEventClick={handleEventClick}
        onCreateEvent={handleCreateEvent}
        onNavigateToBook={navigateToBook}
      />
    </div>
  );
}

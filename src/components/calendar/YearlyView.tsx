import { forwardRef, useMemo, useState, useCallback } from 'react';
import {
  format,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addYears,
  subYears,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Cloud, Kanban, BookOpen, Calendar as CalendarIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCalendarContext } from '@/contexts/CalendarContext';
import { useEvents } from '@/hooks/useEvents';
import { useBooks } from '@/hooks/useBooks';
import { CalendarFilters, EditorialEvent, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types/calendar';

const WEEKDAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

interface YearlyViewProps {
  filters: CalendarFilters;
}

interface DayPanelProps {
  date: Date | null;
  events: EditorialEvent[];
  onClose: () => void;
  onEventClick: (event: EditorialEvent) => void;
  onCreateEvent: (date: Date) => void;
  onViewMonth: (date: Date) => void;
}

function DayPanel({ date, events, onClose, onEventClick, onCreateEvent, onViewMonth }: DayPanelProps) {
  const { getBooksByIds } = useBooks();
  
  if (!date) return null;

  const getOriginIcon = (origin: string) => {
    switch (origin) {
      case 'google': return <Cloud className="h-3 w-3 text-blue-500" />;
      case 'kanban': return <Kanban className="h-3 w-3 text-purple-500" />;
      case 'book': return <BookOpen className="h-3 w-3 text-orange-500" />;
      default: return <CalendarIcon className="h-3 w-3 text-primary" />;
    }
  };

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
            {events.length > 0 
              ? `${events.length} evento(s) programado(s) para este día`
              : 'No hay eventos para este día'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* View Month Button */}
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => onViewMonth(date)}
          >
            <CalendarIcon className="h-4 w-4" />
            Ver mes completo
          </Button>

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

// Day cell component with proper forwardRef
const DayCell = forwardRef<
  HTMLButtonElement,
  {
    day: Date;
    isCurrentMonth: boolean;
    isTodayDate: boolean;
    density: 'none' | 'low' | 'medium' | 'high';
    isSystem: boolean;
    isSelected: boolean;
    events: EditorialEvent[];
    onClick: () => void;
  }
>(({ day, isCurrentMonth, isTodayDate, density, isSystem, isSelected, events, onClick }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={!isCurrentMonth}
      className={cn(
        'aspect-square flex items-center justify-center rounded-sm transition-colors text-[10px]',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
        !isCurrentMonth && 'opacity-20 cursor-default',
        isCurrentMonth && 'cursor-pointer hover:bg-primary/30',
        isTodayDate && 'bg-primary text-primary-foreground font-bold',
        !isTodayDate && density === 'low' && 'bg-primary/20',
        !isTodayDate && density === 'medium' && 'bg-primary/40',
        !isTodayDate && density === 'high' && 'bg-primary/60',
        isSystem && !isTodayDate && 'ring-1 ring-accent',
        isSelected && 'ring-2 ring-primary'
      )}
      aria-label={`${format(day, "d 'de' MMMM", { locale: es })}${events.length > 0 ? `, ${events.length} eventos` : ''}`}
      aria-describedby={events.length > 0 ? `tooltip-${day.toISOString()}` : undefined}
    >
      {format(day, 'd')}
    </button>
  );
});
DayCell.displayName = 'DayCell';

export const YearlyView = forwardRef<HTMLDivElement, YearlyViewProps>(
  function YearlyView({ filters }, ref) {
    const { selectedDate, setSelectedDate, setViewMode, setSelectedEvent, setIsEventPanelOpen, setQuickCreateDate, setIsQuickCreateOpen } = useCalendarContext();
    const { getEventsForDay, filterEvents } = useEvents();
    const { getBooksByIds } = useBooks();
    
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [dayEvents, setDayEvents] = useState<EditorialEvent[]>([]);

    const year = selectedDate.getFullYear();
    const months = useMemo(() => {
      const yearStart = startOfYear(selectedDate);
      const yearEnd = endOfYear(selectedDate);
      return eachMonthOfInterval({ start: yearStart, end: yearEnd });
    }, [selectedDate]);

    const navigateYear = (direction: 'prev' | 'next') => {
      setSelectedDate(direction === 'prev' ? subYears(selectedDate, 1) : addYears(selectedDate, 1));
    };

    const goToMonth = (month: Date) => {
      setSelectedDate(month);
      setViewMode('month');
    };

    const handleDayClick = useCallback((day: Date) => {
      const events = filterEvents(getEventsForDay(day), filters);
      setSelectedDay(day);
      setDayEvents(events);
    }, [filterEvents, getEventsForDay, filters]);

    const handleCloseDayPanel = () => {
      setSelectedDay(null);
      setDayEvents([]);
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

    const handleViewMonth = (date: Date) => {
      handleCloseDayPanel();
      setSelectedDate(date);
      setViewMode('month');
    };

    const getEventDensity = (day: Date): 'none' | 'low' | 'medium' | 'high' => {
      const events = filterEvents(getEventsForDay(day), filters);
      if (events.length === 0) return 'none';
      if (events.length <= 1) return 'low';
      if (events.length <= 3) return 'medium';
      return 'high';
    };

    const hasSystemEvent = (day: Date): boolean => {
      const events = filterEvents(getEventsForDay(day), filters);
      return events.some(e => e.type === 'system');
    };

    const getEventsPreview = (day: Date): EditorialEvent[] => {
      return filterEvents(getEventsForDay(day), filters).slice(0, 3);
    };

    const getAllDayEvents = (day: Date): EditorialEvent[] => {
      return filterEvents(getEventsForDay(day), filters);
    };

    const getOriginIcon = (origin: string) => {
      switch (origin) {
        case 'google': return <Cloud className="h-2.5 w-2.5 text-blue-500" />;
        case 'kanban': return <Kanban className="h-2.5 w-2.5 text-purple-500" />;
        case 'book': return <BookOpen className="h-2.5 w-2.5 text-orange-500" />;
        default: return <CalendarIcon className="h-2.5 w-2.5 text-primary" />;
      }
    };

    return (
      <div ref={ref} className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-semibold">{year}</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigateYear('prev')}
              aria-label="Año anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigateYear('next')}
              aria-label="Año siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Months Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 flex-1">
          {months.map((month) => {
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);
            const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
            const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
            const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

            return (
              <div
                key={month.toISOString()}
                className={cn(
                  'p-3 rounded-lg border border-border/50 transition-all',
                  isSameMonth(month, new Date()) && 'ring-2 ring-primary/30'
                )}
              >
                {/* Month Header */}
                <button
                  onClick={() => goToMonth(month)}
                  className="w-full text-sm font-heading font-semibold mb-2 capitalize text-center hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  aria-label={`Ver ${format(month, 'MMMM yyyy', { locale: es })}`}
                >
                  {format(month, 'MMMM', { locale: es })}
                </button>

                {/* Mini Calendar */}
                <div className="grid grid-cols-7 gap-px text-[10px]">
                  {/* Weekday headers */}
                  {WEEKDAYS_SHORT.map((day) => (
                    <div key={day} className="text-center text-muted-foreground font-medium py-0.5" aria-hidden="true">
                      {day}
                    </div>
                  ))}

                  {/* Days */}
                  {days.map((day) => {
                    const isCurrentMonth = isSameMonth(day, month);
                    const isTodayDate = isToday(day);
                    const density = getEventDensity(day);
                    const isSystem = hasSystemEvent(day);
                    const events = getEventsPreview(day);
                    const allEvents = getAllDayEvents(day);
                    const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;

                    if (!isCurrentMonth || density === 'none') {
                      return (
                        <DayCell
                          key={day.toISOString()}
                          day={day}
                          isCurrentMonth={isCurrentMonth}
                          isTodayDate={isTodayDate}
                          density={density}
                          isSystem={isSystem}
                          isSelected={isSelected}
                          events={events}
                          onClick={() => isCurrentMonth && handleDayClick(day)}
                        />
                      );
                    }

                    return (
                      <Tooltip key={day.toISOString()}>
                        <TooltipTrigger asChild>
                          <DayCell
                            day={day}
                            isCurrentMonth={isCurrentMonth}
                            isTodayDate={isTodayDate}
                            density={density}
                            isSystem={isSystem}
                            isSelected={isSelected}
                            events={events}
                            onClick={() => handleDayClick(day)}
                          />
                        </TooltipTrigger>
                        <TooltipContent 
                          side="top" 
                          align="center"
                          className="max-w-xs p-3"
                          sideOffset={5}
                          id={`tooltip-${day.toISOString()}`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-sm capitalize">
                                {format(day, "d 'de' MMMM", { locale: es })}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                {allEvents.length} evento{allEvents.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              {events.map((event) => {
                                const books = getBooksByIds(event.bookIds);
                                return (
                                  <div key={event.id} className="text-xs space-y-1 border-l-2 border-primary/50 pl-2">
                                    <div className="flex items-center gap-1">
                                      {getOriginIcon(event.origin)}
                                      <p className="font-medium truncate">{event.title}</p>
                                    </div>
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <Badge variant="outline" className={cn('text-[10px] px-1 py-0', STATUS_CONFIG[event.status].bgClass)}>
                                        {STATUS_CONFIG[event.status].label}
                                      </Badge>
                                      <Badge variant="outline" className={cn('text-[10px] px-1 py-0', PRIORITY_CONFIG[event.priority].bgClass)}>
                                        {PRIORITY_CONFIG[event.priority].label}
                                      </Badge>
                                    </div>
                                    {books.length > 0 && (
                                      <p className="text-muted-foreground text-[10px]">
                                        📚 {books.length === 1 ? books[0].title : `${books.length} libros`}
                                      </p>
                                    )}
                                    {event.tags.length > 0 && (
                                      <div className="flex gap-0.5 flex-wrap">
                                        {event.tags.slice(0, 3).map((tag) => (
                                          <span
                                            key={tag.id}
                                            className="px-1 rounded text-[9px]"
                                            style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                                          >
                                            {tag.name}
                                          </span>
                                        ))}
                                        {event.tags.length > 3 && (
                                          <span className="text-[9px] text-muted-foreground">
                                            +{event.tags.length - 3}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            
                            {allEvents.length > 3 && (
                              <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                                +{allEvents.length - 3} evento{allEvents.length - 3 !== 1 ? 's' : ''} más
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded-sm bg-primary/20" aria-hidden="true" />
            <span>1 evento</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded-sm bg-primary/40" aria-hidden="true" />
            <span>2-3 eventos</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded-sm bg-primary/60" aria-hidden="true" />
            <span>4+ eventos</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded-sm ring-1 ring-accent" aria-hidden="true" />
            <span>Evento del sistema</span>
          </div>
        </div>

        {/* Day Panel - Click opens panel, NOT navigates to month */}
        <DayPanel
          date={selectedDay}
          events={dayEvents}
          onClose={handleCloseDayPanel}
          onEventClick={handleEventClick}
          onCreateEvent={handleCreateEvent}
          onViewMonth={handleViewMonth}
        />
      </div>
    );
  }
);
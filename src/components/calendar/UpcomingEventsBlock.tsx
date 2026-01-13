import { useState, useMemo, useEffect } from 'react';
import { format, isToday, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Calendar,
  CheckCircle,
  Plus,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertTriangle,
  ChevronRight,
  Cloud,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useBooks } from '@/hooks/useBooks';
import { useCalendarContext } from '@/contexts/CalendarContext';
import { STATUS_CONFIG, PRIORITY_CONFIG, EditorialEvent, EventOrigin } from '@/types/calendar';

const FILTER_STORAGE_KEY = 'publify-upcoming-events-filter';
// No limit - show all events with scroll

const PriorityIcon = {
  low: ArrowDown,
  medium: Minus,
  high: ArrowUp,
  urgent: AlertTriangle,
};

// Source indicator based on origin - UNIFIED book_events with PURPLE
const getSourceIcon = (origin: EventOrigin) => {
  switch (origin) {
    case 'google': return <span title="Google Calendar"><Cloud className="h-3 w-3 text-blue-500" /></span>;
    case 'book_events': return <span title="Eventos de libros"><BookOpen className="h-3 w-3 text-purple-500" /></span>;
    default: return <span title="Calendario"><Calendar className="h-3 w-3 text-primary" /></span>;
  }
};

type EventFilter = 'all' | 'system' | 'user' | 'book_events';

interface UpcomingEventsBlockProps {
  showActions?: boolean;
  className?: string;
}

export function UpcomingEventsBlock({ 
  showActions = true,
  className 
}: UpcomingEventsBlockProps) {
  const { getUpcomingEvents, markEventDone } = useEvents();
  const { getBooksByIds } = useBooks();
  const { setSelectedEvent, setIsEventPanelOpen, setQuickCreateDate, setIsQuickCreateOpen, setSelectedDate } = useCalendarContext();
  
  // Load filter from localStorage
  const [activeFilter, setActiveFilter] = useState<EventFilter>(() => {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY);
    return (saved as EventFilter) || 'all';
  });

  // Persist filter to localStorage
  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, activeFilter);
  }, [activeFilter]);

  // Get upcoming events from today onwards (max 7)
  const upcomingEvents = useMemo(() => {
    const today = startOfDay(new Date());
    const events = getUpcomingEvents(50); // Get more to allow filtering
    return events.filter(e => startOfDay(e.startAt) >= today);
  }, [getUpcomingEvents]);

  // Filter events based on selected filter - no limit, show all
  const filteredEvents = useMemo(() => {
    switch (activeFilter) {
      case 'system':
        return upcomingEvents.filter(e => e.type === 'system');
      case 'user':
        return upcomingEvents.filter(e => e.type === 'user' && e.origin === 'local');
      case 'book_events':
        return upcomingEvents.filter(e => e.origin === 'book_events');
      default:
        return upcomingEvents;
    }
  }, [upcomingEvents, activeFilter]);

  // Count events by type for badges
  const eventCounts = useMemo(() => ({
    all: upcomingEvents.length,
    system: upcomingEvents.filter(e => e.type === 'system').length,
    user: upcomingEvents.filter(e => e.type === 'user' && e.origin === 'local').length,
    book_events: upcomingEvents.filter(e => e.origin === 'book_events').length,
  }), [upcomingEvents]);

  const handleOpenEvent = (event: EditorialEvent) => {
    setSelectedDate(new Date(event.startAt));
    setSelectedEvent(event);
    setIsEventPanelOpen(true);
  };

  const handleMarkDone = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markEventDone(eventId);
  };

  const handleCreateEvent = () => {
    setQuickCreateDate(new Date());
    setIsQuickCreateOpen(true);
  };

  return (
    <Card className={cn('card-hover flex flex-col overflow-hidden', className)}>
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Próximos Eventos
          </CardTitle>
          {showActions && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1"
              onClick={handleCreateEvent}
            >
              <Plus className="h-4 w-4" />
              Nuevo
            </Button>
          )}
        </div>
        
        {/* Quick Filters - 2 column grid */}
        <div className="grid grid-cols-2 gap-1 mt-2">
          <ToggleGroup 
            type="single" 
            value={activeFilter}
            onValueChange={(value) => value && setActiveFilter(value as EventFilter)}
            className="contents"
          >
            <ToggleGroupItem 
              value="all" 
              size="sm" 
              className="text-xs gap-1 h-7 px-2 justify-start"
            >
              Todos
              <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-auto">
                {eventCounts.all}
              </Badge>
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="user" 
              size="sm" 
              className="text-xs gap-1 h-7 px-2 justify-start"
            >
              <Calendar className="h-3 w-3 shrink-0" />
              Propios
              {eventCounts.user > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-auto">
                  {eventCounts.user}
                </Badge>
              )}
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="book_events" 
              size="sm" 
              className="text-xs gap-1 h-7 px-2 justify-start"
            >
              <BookOpen className="h-3 w-3 text-purple-500 shrink-0" />
              Libros
              {eventCounts.book_events > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-purple-500/20 ml-auto">
                  {eventCounts.book_events}
                </Badge>
              )}
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="system" 
              size="sm" 
              className="text-xs gap-1 h-7 px-2 justify-start"
            >
              <Sparkles className="h-3 w-3 shrink-0" />
              Sistema
              {eventCounts.system > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-auto">
                  {eventCounts.system}
                </Badge>
              )}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-2 pb-4">
        <ScrollArea className="h-full pr-3">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {activeFilter === 'all' 
                  ? 'No hay eventos próximos' 
                  : `No hay eventos de tipo "${activeFilter === 'book_events' ? 'libros' : activeFilter === 'system' ? 'sistema' : 'propios'}"`
                }
              </p>
              {activeFilter !== 'all' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setActiveFilter('all')}
                >
                  Ver todos
                </Button>
              )}
              {activeFilter === 'all' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 gap-2"
                  onClick={handleCreateEvent}
                >
                  <Plus className="h-4 w-4" />
                  Crear evento
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEvents.map((event) => {
                const Icon = PriorityIcon[event.priority];
                const statusConfig = STATUS_CONFIG[event.status];
                const priorityConfig = PRIORITY_CONFIG[event.priority];
                const books = getBooksByIds(event.bookIds);
                const eventIsToday = isToday(event.startAt);

                return (
                  <button
                    key={event.id}
                    onClick={() => handleOpenEvent(event)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-all group',
                      'hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary',
                      event.type === 'system' ? 'event-system' : 'event-user',
                      eventIsToday 
                        ? 'border-primary/60 bg-primary/10 shadow-sm shadow-primary/20' 
                        : 'border-border/50'
                    )}
                  >
                    <div className="flex flex-col gap-1.5 min-w-0">
                      {/* Title row - full width */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="shrink-0">{getSourceIcon(event.origin)}</span>
                        <p className="font-medium text-sm leading-tight truncate flex-1 min-w-0">{event.title}</p>
                        {eventIsToday && (
                          <Badge 
                            variant="default" 
                            className="h-4 px-1.5 text-[10px] bg-primary text-primary-foreground animate-pulse shrink-0"
                          >
                            Hoy
                          </Badge>
                        )}
                      </div>
                      
                      {/* Date and status row */}
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground truncate">
                          {format(event.startAt, "EEE, d MMM", { locale: es })}
                          {!event.allDay && ` • ${format(event.startAt, 'HH:mm')}`}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge 
                            variant="outline" 
                            className={cn('text-[10px] px-1.5 py-0', statusConfig.bgClass)}
                          >
                            {statusConfig.label}
                          </Badge>
                          <Icon 
                            className="h-3 w-3" 
                            style={{ color: priorityConfig.color }}
                          />
                          {showActions && event.status !== 'done' && event.type === 'user' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => handleMarkDone(event.id, e)}
                              aria-label="Marcar como hecho"
                            >
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Tags row */}
                      {event.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {event.tags.slice(0, 3).map(tag => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                              style={{ borderColor: tag.color, color: tag.color }}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                          {event.tags.length > 3 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              +{event.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Books row */}
                      {books.length > 0 && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          📚 {books.length === 1 ? books[0].title : `${books.length} libros`}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

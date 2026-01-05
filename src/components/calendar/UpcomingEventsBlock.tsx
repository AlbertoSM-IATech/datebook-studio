import { useState, useMemo, useEffect } from 'react';
import { format, isToday } from 'date-fns';
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
  maxEvents?: number;
  showActions?: boolean;
  className?: string;
}

export function UpcomingEventsBlock({ 
  maxEvents = 10, 
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

  const upcomingEvents = getUpcomingEvents(maxEvents * 2); // Get more to allow filtering

  // Filter events based on selected filter
  const filteredEvents = useMemo(() => {
    let filtered = upcomingEvents;
    
    switch (activeFilter) {
      case 'system':
        filtered = upcomingEvents.filter(e => e.type === 'system');
        break;
      case 'user':
        filtered = upcomingEvents.filter(e => e.type === 'user' && e.origin === 'local');
        break;
      case 'book_events':
        filtered = upcomingEvents.filter(e => e.origin === 'book_events');
        break;
      default:
        break;
    }
    
    return filtered.slice(0, maxEvents);
  }, [upcomingEvents, activeFilter, maxEvents]);

  // Count events by type for badges
  const eventCounts = useMemo(() => ({
    all: upcomingEvents.length,
    system: upcomingEvents.filter(e => e.type === 'system').length,
    user: upcomingEvents.filter(e => e.type === 'user' && e.origin === 'local').length,
    book_events: upcomingEvents.filter(e => e.origin === 'book_events').length,
  }), [upcomingEvents]);

  const handleOpenEvent = (event: EditorialEvent) => {
    // Navigate to calendar page with the event's date selected
    setSelectedDate(new Date(event.startAt));
    setSelectedEvent(event);
    setIsEventPanelOpen(true);
  };

  const handleMarkDone = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markEventDone(eventId);
  };

  const handleCreateToday = () => {
    setQuickCreateDate(new Date());
    setIsQuickCreateOpen(true);
  };

  return (
    <Card className={cn('card-hover flex flex-col', className)}>
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
              onClick={handleCreateToday}
            >
              <Plus className="h-4 w-4" />
              Hoy
            </Button>
          )}
        </div>
        
        {/* Quick Filters - Compact layout */}
        <ToggleGroup 
          type="single" 
          value={activeFilter}
          onValueChange={(value) => value && setActiveFilter(value as EventFilter)}
          className="justify-start flex-wrap gap-1"
        >
          <ToggleGroupItem 
            value="all" 
            size="sm" 
            className="text-xs gap-1 h-6 px-2"
          >
            Todos
            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
              {eventCounts.all}
            </Badge>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="user" 
            size="sm" 
            className="text-xs gap-1 h-6 px-1.5"
          >
            <Calendar className="h-3 w-3" />
            Propios
            {eventCounts.user > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                {eventCounts.user}
              </Badge>
            )}
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="book_events" 
            size="sm" 
            className="text-xs gap-1 h-6 px-1.5"
          >
            <BookOpen className="h-3 w-3 text-purple-500" />
            Libros
            {eventCounts.book_events > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-purple-500/20">
                {eventCounts.book_events}
              </Badge>
            )}
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="system" 
            size="sm" 
            className="text-xs gap-1 h-6 px-1.5"
          >
            <Sparkles className="h-3 w-3" />
            Sistema
            {eventCounts.system > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                {eventCounts.system}
              </Badge>
            )}
          </ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pt-2">
        <ScrollArea className="h-full pr-2">
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
                  onClick={handleCreateToday}
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
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(event.origin)}
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          {eventIsToday && (
                            <Badge 
                              variant="default" 
                              className="h-4 px-1.5 text-[10px] bg-primary text-primary-foreground animate-pulse"
                            >
                              Hoy
                            </Badge>
                          )}
                          <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(event.startAt, "EEEE, d 'de' MMMM", { locale: es })}
                          {!event.allDay && ` • ${format(event.startAt, 'HH:mm')}`}
                        </p>
                        
                        {/* Tags */}
                        {event.tags.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {event.tags.slice(0, 2).map(tag => (
                              <Badge
                                key={tag.id}
                                variant="outline"
                                className="text-[10px] px-1.5 py-0"
                                style={{ borderColor: tag.color, color: tag.color }}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                            {event.tags.length > 2 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                +{event.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Books */}
                        {books.length > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-1 truncate">
                            📚 {books.map(b => b.title).join(', ')}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <Badge 
                          variant="outline" 
                          className={cn('text-[10px] px-1.5 py-0', statusConfig.bgClass)}
                        >
                          {statusConfig.label}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Icon 
                            className="h-3.5 w-3.5" 
                            style={{ color: priorityConfig.color }}
                          />
                          {showActions && event.status !== 'done' && event.type === 'user' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => handleMarkDone(event.id, e)}
                              aria-label="Marcar como hecho"
                            >
                              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                            </Button>
                          )}
                        </div>
                      </div>
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

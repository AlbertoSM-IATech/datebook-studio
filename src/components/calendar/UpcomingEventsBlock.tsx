import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Kanban,
  BookOpen,
} from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useBooks } from '@/hooks/useBooks';
import { useCalendarContext } from '@/contexts/CalendarContext';
import { STATUS_CONFIG, PRIORITY_CONFIG, EditorialEvent, EventOrigin } from '@/types/calendar';

const PriorityIcon = {
  low: ArrowDown,
  medium: Minus,
  high: ArrowUp,
  urgent: AlertTriangle,
};

// Source indicator based on origin
const getSourceIcon = (origin: EventOrigin) => {
  switch (origin) {
    case 'google': return <span title="Google Calendar"><Cloud className="h-3 w-3 text-blue-500" /></span>;
    case 'kanban': return <span title="Kanban"><Kanban className="h-3 w-3 text-purple-500" /></span>;
    case 'book': return <span title="Libro"><BookOpen className="h-3 w-3 text-orange-500" /></span>;
    default: return <span title="Calendario"><Calendar className="h-3 w-3 text-primary" /></span>;
  }
};

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
  const { setSelectedEvent, setIsEventPanelOpen, setQuickCreateDate, setIsQuickCreateOpen } = useCalendarContext();

  const upcomingEvents = getUpcomingEvents(maxEvents);

  const handleOpenEvent = (event: EditorialEvent) => {
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
    <Card className={cn('card-hover', className)}>
      <CardHeader className="pb-3">
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
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-2">
          {upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No hay eventos próximos</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 gap-2"
                onClick={handleCreateToday}
              >
                <Plus className="h-4 w-4" />
                Crear evento
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((event) => {
                const Icon = PriorityIcon[event.priority];
                const statusConfig = STATUS_CONFIG[event.status];
                const priorityConfig = PRIORITY_CONFIG[event.priority];
                const books = getBooksByIds(event.bookIds);

                return (
                  <button
                    key={event.id}
                    onClick={() => handleOpenEvent(event)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border border-border/50 transition-all group',
                      'hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary',
                      event.type === 'system' ? 'event-system' : 'event-user'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(event.origin)}
                          <p className="font-medium text-sm truncate">{event.title}</p>
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

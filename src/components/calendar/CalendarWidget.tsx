import { useMemo, useState } from 'react';
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar as CalendarIcon, 
  ChevronRight, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  AlertTriangle,
  Zap,
  Clock 
} from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useNavigate } from 'react-router-dom';
import { EditorialEvent, STATUS_CONFIG, PRIORITY_CONFIG, QuickFilter } from '@/types/calendar';

const PriorityIcon = {
  low: ArrowDown,
  medium: Minus,
  high: ArrowUp,
  urgent: AlertTriangle,
};

const QUICK_FILTERS: { id: QuickFilter; label: string; icon: React.ElementType }[] = [
  { id: 'system', label: 'Sistema', icon: Zap },
  { id: 'user', label: 'Mis eventos', icon: CalendarIcon },
  { id: 'high_priority', label: 'Alta prioridad', icon: AlertTriangle },
  { id: 'this_week', label: 'Esta semana', icon: Clock },
];

export function CalendarWidget() {
  const navigate = useNavigate();
  const { getUpcomingEvents, getThisWeekEvents, getEventsForDay, filterEvents, events } = useEvents();
  const [activeFilters, setActiveFilters] = useState<QuickFilter[]>([]);

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Get upcoming events based on filters
  const upcomingEvents = useMemo(() => {
    let filteredEvents = events.filter(e => e.startAt >= today);

    if (activeFilters.includes('system')) {
      filteredEvents = filteredEvents.filter(e => e.type === 'system');
    }
    if (activeFilters.includes('user')) {
      filteredEvents = filteredEvents.filter(e => e.type === 'user');
    }
    if (activeFilters.includes('high_priority')) {
      filteredEvents = filteredEvents.filter(e => e.priority === 'high' || e.priority === 'urgent');
    }
    if (activeFilters.includes('this_week')) {
      filteredEvents = filteredEvents.filter(e => e.startAt >= weekStart && e.startAt <= weekEnd);
    }

    return filteredEvents.sort((a, b) => a.startAt.getTime() - b.startAt.getTime()).slice(0, 5);
  }, [events, activeFilters, today, weekStart, weekEnd]);

  const toggleFilter = (filter: QuickFilter) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const getEventDensityForDay = (day: Date): number => {
    return getEventsForDay(day).length;
  };

  return (
    <Card className="w-full card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Calendario Editorial
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/calendario')} className="gap-1 text-primary">
            Abrir
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mini Week Calendar */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const density = getEventDensityForDay(day);
            const isTodayDate = isToday(day);
            
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'text-center py-2 rounded-md transition-colors',
                  isTodayDate && 'bg-primary text-primary-foreground',
                  !isTodayDate && density > 0 && 'bg-primary/20',
                  !isTodayDate && density === 0 && 'bg-muted/50'
                )}
              >
                <div className="text-[10px] uppercase text-muted-foreground font-medium">
                  {format(day, 'EEE', { locale: es })}
                </div>
                <div className={cn('text-sm font-semibold', isTodayDate && 'text-primary-foreground')}>
                  {format(day, 'd')}
                </div>
                {density > 0 && !isTodayDate && (
                  <div className="flex justify-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilters.includes(filter.id);
            
            return (
              <Badge
                key={filter.id}
                variant={isActive ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-all gap-1',
                  isActive && 'shadow-coral'
                )}
                onClick={() => toggleFilter(filter.id)}
              >
                <Icon className="h-3 w-3" />
                {filter.label}
              </Badge>
            );
          })}
        </div>

        <Separator />

        {/* Upcoming Events */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Próximos eventos</h4>
          
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay eventos próximos
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((event) => {
                const Icon = PriorityIcon[event.priority];
                const statusConfig = STATUS_CONFIG[event.status];
                
                return (
                  <div
                    key={event.id}
                    className={cn(
                      'p-3 rounded-lg border border-border/50 transition-all hover:border-primary/50 hover:bg-primary/5',
                      event.type === 'system' ? 'event-system' : 'event-user'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(event.startAt, "d MMM", { locale: es })}
                          {!event.allDay && ` • ${format(event.startAt, 'HH:mm')}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', statusConfig.bgClass)}>
                          {statusConfig.label}
                        </Badge>
                        <Icon className={cn('h-3.5 w-3.5', `text-priority-${event.priority}`)} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-2"
            onClick={() => navigate('/calendario')}
          >
            <CalendarIcon className="h-4 w-4" />
            Ver calendario
          </Button>
          <Button 
            size="sm" 
            className="flex-1 gap-2 shadow-coral"
            onClick={() => navigate('/calendario?create=true')}
          >
            <Plus className="h-4 w-4" />
            Crear evento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

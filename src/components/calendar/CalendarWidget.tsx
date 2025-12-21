import { useMemo, useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronLeft,
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  AlertTriangle,
  Zap,
  Clock,
  Bell,
  BellOff
} from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useReminders } from '@/hooks/useReminders';
import { useNavigate } from 'react-router-dom';
import { STATUS_CONFIG, PRIORITY_CONFIG, QuickFilter } from '@/types/calendar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  const { getEventsForDay, events } = useEvents();
  const { notificationsEnabled, requestPermission } = useReminders(events);
  const [activeFilters, setActiveFilters] = useState<QuickFilter[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  // Get days for the current month mini-calendar
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

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

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  return (
    <Card className="w-full card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Calendario Editorial
          </CardTitle>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={requestPermission}
                  aria-label={notificationsEnabled ? 'Notificaciones activadas' : 'Activar notificaciones'}
                >
                  {notificationsEnabled ? (
                    <Bell className="h-4 w-4 text-primary" />
                  ) : (
                    <BellOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {notificationsEnabled ? 'Notificaciones activadas' : 'Activar notificaciones push'}
              </TooltipContent>
            </Tooltip>
            <Button variant="ghost" size="sm" onClick={() => navigate('/calendario')} className="gap-1 text-primary">
              Abrir
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mini Monthly Calendar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => navigateMonth('prev')}
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => navigateMonth('next')}
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-0.5 text-[10px]">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
              <div key={day} className="text-center text-muted-foreground font-medium py-1">
                {day}
              </div>
            ))}
            {calendarDays.map((day) => {
              const density = getEventDensityForDay(day);
              const isTodayDate = isToday(day);
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'aspect-square flex items-center justify-center rounded-sm transition-colors cursor-pointer hover:bg-primary/20',
                    !isCurrentMonth && 'opacity-30',
                    isTodayDate && 'bg-primary text-primary-foreground font-bold',
                    !isTodayDate && density > 0 && 'bg-primary/20',
                    !isTodayDate && density > 2 && 'bg-primary/40'
                  )}
                  onClick={() => navigate('/calendario')}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>
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
                role="checkbox"
                aria-checked={isActive}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFilter(filter.id);
                  }
                }}
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
                  <button
                    key={event.id}
                    onClick={() => navigate('/calendario')}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border border-border/50 transition-all',
                      'hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary',
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
                  </button>
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

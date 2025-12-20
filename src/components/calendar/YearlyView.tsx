import { useMemo } from 'react';
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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarContext } from '@/contexts/CalendarContext';
import { useEvents } from '@/hooks/useEvents';
import { CalendarFilters } from '@/types/calendar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const WEEKDAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

interface YearlyViewProps {
  filters: CalendarFilters;
}

export function YearlyView({ filters }: YearlyViewProps) {
  const { selectedDate, setSelectedDate, setViewMode } = useCalendarContext();
  const { getEventsForDay, filterEvents } = useEvents();

  const year = selectedDate.getFullYear();
  const months = useMemo(() => {
    const yearStart = startOfYear(selectedDate);
    const yearEnd = endOfYear(selectedDate);
    return eachMonthOfInterval({ start: yearStart, end: yearEnd });
  }, [selectedDate]);

  const navigateYear = (direction: 'prev' | 'next') => {
    setSelectedDate(direction === 'prev' ? subYears(selectedDate, 1) : addYears(selectedDate, 1));
  };

  const handleMonthClick = (month: Date) => {
    setSelectedDate(month);
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-semibold">{year}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateYear('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigateYear('next')}>
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
                'p-3 rounded-lg border border-border/50 transition-all cursor-pointer',
                'hover:border-primary/50 hover:shadow-coral',
                isSameMonth(month, new Date()) && 'ring-2 ring-primary/30'
              )}
              onClick={() => handleMonthClick(month)}
            >
              {/* Month Header */}
              <h3 className="text-sm font-heading font-semibold mb-2 capitalize text-center">
                {format(month, 'MMMM', { locale: es })}
              </h3>

              {/* Mini Calendar */}
              <div className="grid grid-cols-7 gap-px text-[10px]">
                {/* Weekday headers */}
                {WEEKDAYS_SHORT.map((day) => (
                  <div key={day} className="text-center text-muted-foreground font-medium py-0.5">
                    {day}
                  </div>
                ))}

                {/* Days */}
                {days.map((day) => {
                  const isCurrentMonth = isSameMonth(day, month);
                  const isTodayDate = isToday(day);
                  const density = getEventDensity(day);
                  const isSystem = hasSystemEvent(day);

                  return (
                    <Tooltip key={day.toISOString()}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'aspect-square flex items-center justify-center rounded-sm transition-colors',
                            !isCurrentMonth && 'opacity-20',
                            isTodayDate && 'bg-primary text-primary-foreground font-bold',
                            density === 'low' && !isTodayDate && 'bg-primary/20',
                            density === 'medium' && !isTodayDate && 'bg-primary/40',
                            density === 'high' && !isTodayDate && 'bg-primary/60',
                            isSystem && !isTodayDate && 'ring-1 ring-accent'
                          )}
                        >
                          {format(day, 'd')}
                        </div>
                      </TooltipTrigger>
                      {density !== 'none' && (
                        <TooltipContent>
                          <p className="text-xs">
                            {filterEvents(getEventsForDay(day), filters).length} evento(s)
                          </p>
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

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-sm bg-primary/20" />
          <span>1 evento</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-sm bg-primary/40" />
          <span>2-3 eventos</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-sm bg-primary/60" />
          <span>4+ eventos</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-sm ring-1 ring-accent" />
          <span>Evento del sistema</span>
        </div>
      </div>
    </div>
  );
}

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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, GripVertical } from 'lucide-react';
import { useCalendarContext } from '@/contexts/CalendarContext';
import { useEvents } from '@/hooks/useEvents';
import { EventChip } from './EventChip';
import { EditorialEvent, CalendarFilters } from '@/types/calendar';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

interface MonthlyViewProps {
  filters: CalendarFilters;
}

export function MonthlyView({ filters }: MonthlyViewProps) {
  const { selectedDate, setSelectedDate, setSelectedEvent, setIsEventPanelOpen, setQuickCreateDate, setIsQuickCreateOpen } = useCalendarContext();
  const { getEventsForDay, filterEvents, moveEvent } = useEvents();
  const [draggedEvent, setDraggedEvent] = useState<EditorialEvent | null>(null);
  const [dragOverDay, setDragOverDay] = useState<Date | null>(null);

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
    const dayEvents = filterEvents(getEventsForDay(day), filters);
    if (dayEvents.length === 0) {
      setQuickCreateDate(day);
      setIsQuickCreateOpen(true);
    }
  };

  const handleEventClick = (event: EditorialEvent) => {
    setSelectedEvent(event);
    setIsEventPanelOpen(true);
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
        <div className="grid grid-cols-7 gap-1 flex-1">
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
                        'group relative',
                        event.type !== 'system' && 'cursor-grab active:cursor-grabbing'
                      )}
                    >
                      {event.type !== 'system' && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 opacity-0 group-hover:opacity-50 transition-opacity">
                          <GripVertical className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                      <EventChip
                        event={event}
                        compact
                        isDragging={draggedEvent?.id === event.id}
                      />
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
    </div>
  );
}

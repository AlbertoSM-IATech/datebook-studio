import { useState, useCallback, useMemo } from 'react';
import { 
  EditorialEvent, 
  EventFormData, 
  CalendarFilters,
  DEFAULT_TAGS 
} from '@/types/calendar';
import { MOCK_EVENTS } from '@/data/mockData';
import { SYSTEM_EVENTS, calculateDynamicDate } from '@/data/systemEvents';
import { 
  startOfDay, 
  endOfDay, 
  isWithinInterval, 
  isSameDay,
  startOfWeek,
  endOfWeek,
  addDays 
} from 'date-fns';

// Generate system events for a given year
function generateSystemEventsForYear(year: number): EditorialEvent[] {
  return SYSTEM_EVENTS
    .filter(template => template.enabled)
    .map(template => {
      let eventDate: Date;
      
      if (template.day !== null) {
        eventDate = new Date(year, template.month - 1, template.day);
      } else if (template.dynamicRule) {
        const dynamicDate = calculateDynamicDate(template.dynamicRule, year);
        if (!dynamicDate) return null;
        eventDate = dynamicDate;
      } else {
        return null;
      }

      return {
        id: `system-${template.key}-${year}`,
        type: 'system' as const,
        systemKey: template.key,
        title: template.name,
        status: 'pending' as const,
        priority: 'medium' as const,
        startAt: startOfDay(eventDate),
        endAt: endOfDay(eventDate),
        allDay: true,
        bookIds: [],
        tags: template.defaultTags,
        description: template.description,
        checklistItems: [],
        reminders: template.defaultReminders,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as EditorialEvent;
    })
    .filter((event): event is EditorialEvent => event !== null);
}

export function useEvents() {
  const [userEvents, setUserEvents] = useState<EditorialEvent[]>(MOCK_EVENTS);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Generate system events for current and next year
  const systemEvents = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      ...generateSystemEventsForYear(currentYear),
      ...generateSystemEventsForYear(currentYear + 1),
    ];
  }, []);

  // All events combined
  const allEvents = useMemo(() => {
    return [...userEvents, ...systemEvents];
  }, [userEvents, systemEvents]);

  // Filter events
  const filterEvents = useCallback((
    events: EditorialEvent[],
    filters: CalendarFilters
  ): EditorialEvent[] => {
    return events.filter(event => {
      // Type filter
      if (event.type === 'system' && !filters.showSystemEvents) return false;
      if (event.type === 'user' && !filters.showUserEvents) return false;

      // Tag filter
      if (filters.tags.length > 0) {
        const eventTagIds = event.tags.map(t => t.id);
        if (!filters.tags.some(tagId => eventTagIds.includes(tagId))) return false;
      }

      // Marketplace filter
      if (filters.marketplaces.length > 0 && event.marketplace) {
        if (!filters.marketplaces.some(m => event.marketplace?.includes(m))) return false;
      }

      // Status filter
      if (filters.statuses.length > 0) {
        if (!filters.statuses.includes(event.status)) return false;
      }

      // Priority filter
      if (filters.priorities.length > 0) {
        if (!filters.priorities.includes(event.priority)) return false;
      }

      return true;
    });
  }, []);

  // Get events for a specific date range
  const getEventsInRange = useCallback((
    start: Date,
    end: Date,
    filters?: CalendarFilters
  ): EditorialEvent[] => {
    const eventsToFilter = filters ? filterEvents(allEvents, filters) : allEvents;
    
    return eventsToFilter.filter(event => {
      const eventStart = startOfDay(event.startAt);
      const eventEnd = endOfDay(event.endAt);
      
      return isWithinInterval(eventStart, { start, end }) ||
             isWithinInterval(eventEnd, { start, end }) ||
             (eventStart <= start && eventEnd >= end);
    });
  }, [allEvents, filterEvents]);

  // Get events for a specific day
  const getEventsForDay = useCallback((
    date: Date,
    filters?: CalendarFilters
  ): EditorialEvent[] => {
    const eventsToFilter = filters ? filterEvents(allEvents, filters) : allEvents;
    
    return eventsToFilter.filter(event => {
      const eventStart = startOfDay(event.startAt);
      const eventEnd = endOfDay(event.endAt);
      const targetDate = startOfDay(date);
      
      return isWithinInterval(targetDate, { start: eventStart, end: eventEnd });
    });
  }, [allEvents, filterEvents]);

  // Get upcoming events
  const getUpcomingEvents = useCallback((
    count: number = 5,
    filters?: CalendarFilters
  ): EditorialEvent[] => {
    const now = new Date();
    const eventsToFilter = filters ? filterEvents(allEvents, filters) : allEvents;
    
    return eventsToFilter
      .filter(event => event.startAt >= now)
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
      .slice(0, count);
  }, [allEvents, filterEvents]);

  // Get events for this week
  const getThisWeekEvents = useCallback((
    filters?: CalendarFilters
  ): EditorialEvent[] => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    
    return getEventsInRange(weekStart, weekEnd, filters);
  }, [getEventsInRange]);

  // Create event
  const createEvent = useCallback((data: EventFormData): EditorialEvent => {
    const newEvent: EditorialEvent = {
      id: `evt-${Date.now()}`,
      type: data.type,
      title: data.title,
      status: data.status,
      priority: data.priority,
      startAt: data.startAt,
      endAt: data.endAt,
      allDay: data.allDay,
      marketplace: data.marketplace,
      bookIds: data.bookIds,
      tags: data.tags,
      description: data.description,
      checklistItems: data.checklistItems,
      reminders: data.reminders,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setUserEvents(prev => [...prev, newEvent]);
    
    // Simulate save
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 500);
    setTimeout(() => setSaveStatus('idle'), 2000);

    return newEvent;
  }, []);

  // Update event
  const updateEvent = useCallback((id: string, data: Partial<EditorialEvent>): void => {
    setUserEvents(prev => prev.map(event => {
      if (event.id === id) {
        return {
          ...event,
          ...data,
          updatedAt: new Date(),
        };
      }
      return event;
    }));

    // Simulate save
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 500);
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, []);

  // Delete event
  const deleteEvent = useCallback((id: string): void => {
    setUserEvents(prev => prev.filter(event => event.id !== id));
  }, []);

  // Move event to a new date (for drag & drop)
  const moveEvent = useCallback((id: string, newStartDate: Date): void => {
    setUserEvents(prev => prev.map(event => {
      if (event.id === id) {
        const duration = event.endAt.getTime() - event.startAt.getTime();
        const newEndDate = new Date(newStartDate.getTime() + duration);
        
        return {
          ...event,
          startAt: newStartDate,
          endAt: newEndDate,
          updatedAt: new Date(),
        };
      }
      return event;
    }));

    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 500);
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, []);

  // Duplicate system event as user event
  const duplicateAsUserEvent = useCallback((systemEventId: string): EditorialEvent | null => {
    const systemEvent = systemEvents.find(e => e.id === systemEventId);
    if (!systemEvent) return null;

    const newEvent: EditorialEvent = {
      ...systemEvent,
      id: `evt-${Date.now()}`,
      type: 'user',
      systemKey: undefined,
      title: `${systemEvent.title} (copia)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setUserEvents(prev => [...prev, newEvent]);
    return newEvent;
  }, [systemEvents]);

  // Get event by ID
  const getEventById = useCallback((id: string): EditorialEvent | undefined => {
    return allEvents.find(event => event.id === id);
  }, [allEvents]);

  return {
    events: allEvents,
    userEvents,
    systemEvents,
    saveStatus,
    getEventsInRange,
    getEventsForDay,
    getUpcomingEvents,
    getThisWeekEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
    duplicateAsUserEvent,
    getEventById,
    filterEvents,
  };
}

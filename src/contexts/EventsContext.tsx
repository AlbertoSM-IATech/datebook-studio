import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { 
  EditorialEvent, 
  EventFormData, 
  CalendarFilters,
  BookKanbanItem,
  Tag,
  EventStatus,
} from '@/types/calendar';
import { MOCK_EVENTS } from '@/data/mockData';
import { SYSTEM_EVENTS, calculateDynamicDate } from '@/data/systemEvents';
import { 
  startOfDay, 
  endOfDay, 
  isWithinInterval, 
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { toast } from 'sonner';

// Extended EditorialEvent type for system events with KDP-specific fields
interface SystemEditorialEvent extends EditorialEvent {
  campaignType?: 'comercial' | 'estacional' | 'visibilidad';
  recommendedNiches?: string[];
  campaignWindowDays?: number;
}

// Generate system events for a given year
function generateSystemEventsForYear(year: number): SystemEditorialEvent[] {
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
        priority: template.priorityLevel, // Use template's priority level
        startAt: startOfDay(eventDate),
        endAt: endOfDay(eventDate),
        allDay: true,
        bookIds: [],
        tags: template.defaultTags,
        description: template.description,
        checklistItems: [],
        reminders: template.defaultReminders,
        origin: 'local' as const,
        sourceType: 'calendar' as const,
        // KDP-specific strategic fields
        campaignType: template.campaignType,
        recommendedNiches: template.recommendedNiches,
        campaignWindowDays: template.campaignWindowDays,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as SystemEditorialEvent;
    })
    .filter((event): event is SystemEditorialEvent => event !== null);
}

// Generate book events from mock kanban data - UNIFIED as book_events
function generateBookEvents(): EditorialEvent[] {
  const today = new Date();
  const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  
  const mockKanbanItems: BookKanbanItem[] = [
    {
      id: 'kanban-1',
      bookId: 'book-1',
      title: 'Revisar capítulo 3',
      status: 'in_progress',
      priority: 'high',
      dueDate: addDays(today, 4),
      description: 'Revisar y corregir el capítulo 3 del manuscrito',
      tags: [{ id: 'content', name: 'Contenido', color: 'hsl(262 83% 58%)' }],
    },
    {
      id: 'kanban-2',
      bookId: 'book-2',
      title: 'Enviar a editor',
      status: 'pending',
      priority: 'urgent',
      dueDate: addDays(today, 6),
      startDate: addDays(today, 5),
      description: 'Enviar manuscrito completo al editor',
    },
    {
      id: 'kanban-3',
      bookId: 'book-1',
      title: 'Diseño de portada',
      status: 'review',
      priority: 'medium',
      dueDate: addDays(today, 10),
      tags: [{ id: 'marketing', name: 'Marketing', color: 'hsl(142 71% 45%)' }],
    },
    {
      id: 'kanban-4',
      bookId: 'book-3',
      title: 'Corrección ortográfica',
      status: 'pending',
      priority: 'high',
      dueDate: addDays(today, 3),
      description: 'Revisión ortográfica final',
      tags: [{ id: 'deadline', name: 'Deadline', color: 'hsl(0 84% 60%)' }],
    },
  ];
  
  const statusMap: Record<string, EventStatus> = {
    'pending': 'pending',
    'in_progress': 'in_progress',
    'review': 'review',
    'done': 'done',
  };
  
  return mockKanbanItems
    .filter(item => item.dueDate)
    .map(item => ({
      id: `book-event-${item.id}`,
      type: 'user' as const,
      title: item.title,
      status: statusMap[item.status] || 'pending',
      priority: item.priority || 'medium',
      startAt: startOfDay(item.startDate || item.dueDate!),
      endAt: endOfDay(item.dueDate!),
      allDay: true,
      bookIds: [item.bookId],
      tags: item.tags || [],
      description: item.description || '',
      checklistItems: [],
      reminders: [],
      origin: 'book_events' as const, // UNIFIED origin
      sourceType: 'book_events' as const, // UNIFIED sourceType
      // Navigation fields for kanban
      kanban_task_id: item.id,
      book_id: item.bookId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as EditorialEvent));
}

interface EventsContextType {
  events: EditorialEvent[];
  userEvents: EditorialEvent[];
  systemEvents: EditorialEvent[];
  bookEvents: EditorialEvent[]; // Renamed from kanbanEvents
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  filterEvents: (events: EditorialEvent[], filters: CalendarFilters) => EditorialEvent[];
  getEventsInRange: (start: Date, end: Date, filters?: CalendarFilters) => EditorialEvent[];
  getEventsForDay: (date: Date, filters?: CalendarFilters) => EditorialEvent[];
  getEventsForMonth: (month: Date, filters?: CalendarFilters) => EditorialEvent[];
  getUpcomingEvents: (count?: number, filters?: CalendarFilters) => EditorialEvent[];
  getThisWeekEvents: (filters?: CalendarFilters) => EditorialEvent[];
  createEvent: (data: EventFormData) => EditorialEvent | null;
  updateEvent: (id: string, data: Partial<EditorialEvent>) => void;
  deleteEvent: (id: string) => void;
  moveEvent: (id: string, newStartDate: Date) => void;
  duplicateEvent: (id: string) => EditorialEvent | null;
  markEventDone: (id: string) => void;
  addImportedEvents: (events: EditorialEvent[]) => void;
  getEventById: (id: string) => EditorialEvent | undefined;
  getEventsByBookId: (bookId: string) => EditorialEvent[];
  navigateToKanbanItem: (bookId: string, kanbanTaskId: string) => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [userEvents, setUserEvents] = useState<EditorialEvent[]>(MOCK_EVENTS);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Generate system events for current and next year
  const systemEvents = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      ...generateSystemEventsForYear(currentYear),
      ...generateSystemEventsForYear(currentYear + 1),
    ];
  }, []);

  // Generate book events (unified from kanban)
  const bookEvents = useMemo(() => {
    return generateBookEvents();
  }, []);

  // All events combined (user + system + book)
  const allEvents = useMemo(() => {
    return [...userEvents, ...systemEvents, ...bookEvents];
  }, [userEvents, systemEvents, bookEvents]);

  // Filter events with full-text search and source filters
  const filterEvents = useCallback((
    events: EditorialEvent[],
    filters: CalendarFilters
  ): EditorialEvent[] => {
    return events.filter(event => {
      // Type filter (system vs user)
      if (event.type === 'system' && !filters.showSystemEvents) return false;
      if (event.type === 'user' && event.origin === 'local' && !filters.showUserEvents) return false;

      // Origin/Source filters - UNIFIED book_events
      if (event.origin === 'google' && !filters.showGoogleEvents) return false;
      if (event.origin === 'book_events' && !filters.showBookEventsEvents) return false;

      // Search query (full-text)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(query);
        const matchesDescription = event.description.toLowerCase().includes(query);
        const matchesTags = event.tags.some(t => t.name.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDescription && !matchesTags) return false;
      }

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

      // Book filter
      if (filters.bookIds.length > 0) {
        if (!filters.bookIds.some(bookId => event.bookIds.includes(bookId))) return false;
      }

      // Origin filter (explicit)
      if (filters.origin.length > 0) {
        if (!filters.origin.includes(event.origin)) return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const eventStart = startOfDay(event.startAt);
        const rangeStart = startOfDay(filters.dateRange.from);
        const rangeEnd = endOfDay(filters.dateRange.to);
        if (eventStart < rangeStart || eventStart > rangeEnd) return false;
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

  // Get events for current month
  const getEventsForMonth = useCallback((
    month: Date,
    filters?: CalendarFilters
  ): EditorialEvent[] => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return getEventsInRange(start, end, filters);
  }, [getEventsInRange]);

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

  // Create event with validation
  const createEvent = useCallback((data: EventFormData): EditorialEvent | null => {
    // Validation
    if (!data.title.trim()) {
      toast.error('El título es obligatorio');
      return null;
    }

    if (!data.startAt) {
      toast.error('La fecha de inicio es obligatoria');
      return null;
    }

    // Ensure endAt >= startAt
    let endAt = data.endAt;
    if (endAt < data.startAt) {
      endAt = data.startAt;
      toast.warning('La fecha de fin se ajustó a la fecha de inicio');
    }

    const newEvent: EditorialEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: data.type,
      title: data.title.trim(),
      status: data.status,
      priority: data.priority,
      startAt: data.startAt,
      endAt: endAt,
      allDay: data.allDay,
      marketplace: data.marketplace,
      bookIds: data.bookIds,
      tags: data.tags,
      description: data.description,
      checklistItems: data.checklistItems,
      reminders: data.reminders,
      assignedTo: data.assignedTo,
      origin: 'local',
      sourceType: 'calendar',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Optimistic update
    setUserEvents(prev => [...prev, newEvent]);
    
    setSaveStatus('saving');
    
    // Simulate backend save
    setTimeout(() => {
      setSaveStatus('saved');
      toast.success('Evento creado correctamente');
    }, 300);
    
    setTimeout(() => setSaveStatus('idle'), 2000);

    return newEvent;
  }, []);

  // Update event with validation
  const updateEvent = useCallback((id: string, data: Partial<EditorialEvent>): void => {
    // Validate dates if being updated
    if (data.startAt && data.endAt && data.endAt < data.startAt) {
      data.endAt = data.startAt;
      toast.warning('La fecha de fin se ajustó a la fecha de inicio');
    }

    setUserEvents(prev => prev.map(event => {
      if (event.id === id) {
        const updated = {
          ...event,
          ...data,
          updatedAt: new Date(),
        };
        return updated;
      }
      return event;
    }));

    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
    }, 300);
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, []);

  // Delete event
  const deleteEvent = useCallback((id: string): void => {
    setUserEvents(prev => prev.filter(event => event.id !== id));
    toast.success('Evento eliminado');
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
    setTimeout(() => {
      setSaveStatus('saved');
      toast.success('Evento movido');
    }, 300);
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, []);

  // Duplicate event
  const duplicateEvent = useCallback((id: string): EditorialEvent | null => {
    const event = allEvents.find(e => e.id === id);
    if (!event) return null;

    const newEvent: EditorialEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      systemKey: undefined,
      title: `${event.title} (copia)`,
      origin: 'local',
      sourceType: 'calendar',
      googleEventId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setUserEvents(prev => [...prev, newEvent]);
    toast.success('Evento duplicado');
    return newEvent;
  }, [allEvents]);

  // Mark event as done
  const markEventDone = useCallback((id: string): void => {
    updateEvent(id, { status: 'done' });
  }, [updateEvent]);

  // Add imported events (from Google Calendar)
  const addImportedEvents = useCallback((events: EditorialEvent[]): void => {
    setUserEvents(prev => {
      const existingGoogleIds = new Set(
        prev.filter(e => e.googleEventId).map(e => e.googleEventId)
      );
      
      const newEvents = events.filter(e => !existingGoogleIds.has(e.googleEventId));
      const updatedEvents = events.filter(e => existingGoogleIds.has(e.googleEventId));
      
      let result = [...prev];
      
      // Update existing events
      for (const updated of updatedEvents) {
        result = result.map(e => 
          e.googleEventId === updated.googleEventId 
            ? { ...e, ...updated, updatedAt: new Date() }
            : e
        );
      }
      
      // Add new events with proper origin
      const newWithOrigin = newEvents.map(e => ({
        ...e,
        origin: 'google' as const,
        sourceType: 'google' as const,
      }));
      
      return [...result, ...newWithOrigin];
    });
    
    toast.success(`${events.length} eventos importados de Google Calendar`);
  }, []);

  // Get event by ID
  const getEventById = useCallback((id: string): EditorialEvent | undefined => {
    return allEvents.find(event => event.id === id);
  }, [allEvents]);

  // Get events by book ID (for bidirectional relationship)
  const getEventsByBookId = useCallback((bookId: string): EditorialEvent[] => {
    return allEvents.filter(event => event.bookIds.includes(bookId));
  }, [allEvents]);

  // Navigate to kanban item in book page
  const navigateToKanbanItem = useCallback((bookId: string, kanbanTaskId: string): void => {
    // Navigate to the book's kanban and highlight the task
    const url = `/biblioteca/${bookId}?kanban=${kanbanTaskId}`;
    window.location.href = url;
  }, []);

  const value: EventsContextType = {
    events: allEvents,
    userEvents,
    systemEvents,
    bookEvents, // Renamed from kanbanEvents
    saveStatus,
    filterEvents,
    getEventsInRange,
    getEventsForDay,
    getEventsForMonth,
    getUpcomingEvents,
    getThisWeekEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
    duplicateEvent,
    markEventDone,
    addImportedEvents,
    getEventById,
    getEventsByBookId,
    navigateToKanbanItem,
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEventsContext() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEventsContext must be used within EventsProvider');
  }
  return context;
}

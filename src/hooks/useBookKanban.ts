/**
 * BOOK KANBAN INTEGRATION HOOK
 * 
 * This is a stub/mock hook that prepares the calendar for integration
 * with the Book Library's Kanban feature.
 * 
 * The developer can replace the mock data with actual API calls
 * to fetch kanban items from books.
 */

import { useMemo, useCallback } from 'react';
import { 
  BookKanbanItem, 
  CalendarItem, 
  CalendarSourceType,
  EventStatus,
  EventPriority,
  CalendarFilters,
} from '@/types/calendar';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';

// Dynamic mock kanban items based on current date
function generateMockKanbanItems(): BookKanbanItem[] {
  const today = new Date();
  const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  
  return [
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
      description: 'Revisión ortográfica final antes de enviar a maquetación',
      tags: [{ id: 'deadline', name: 'Deadline', color: 'hsl(0 84% 60%)' }],
    },
    {
      id: 'kanban-5',
      bookId: 'book-4',
      title: 'Actualizar sinopsis',
      status: 'done',
      priority: 'low',
      dueDate: addDays(today, -2),
      description: 'Reescribir la sinopsis para mejorar conversión',
    },
  ];
}

const MOCK_KANBAN_ITEMS: BookKanbanItem[] = generateMockKanbanItems();

// Map kanban status to calendar event status
function mapKanbanStatus(status: string): EventStatus {
  const statusMap: Record<string, EventStatus> = {
    'pending': 'pending',
    'todo': 'pending',
    'in_progress': 'in_progress',
    'doing': 'in_progress',
    'review': 'review',
    'done': 'done',
    'completed': 'done',
    'cancelled': 'cancelled',
  };
  return statusMap[status] || 'pending';
}

// Convert BookKanbanItem to CalendarItem
function kanbanToCalendarItem(item: BookKanbanItem): CalendarItem | null {
  // Only include items with due dates
  if (!item.dueDate) return null;
  
  const startAt = item.startDate || item.dueDate;
  const endAt = item.dueDate;
  
  return {
    id: `kanban-${item.id}`,
    sourceType: 'kanban', // Matches CalendarSourceType
    sourceId: item.id,
    title: item.title,
    startAt: startOfDay(startAt),
    endAt: endOfDay(endAt),
    allDay: true,
    status: mapKanbanStatus(item.status),
    priority: item.priority || 'medium',
    bookIds: [item.bookId],
    tags: item.tags || [],
    linkToBookId: item.bookId,
    linkToKanbanItemId: item.id,
    description: item.description,
  };
}

interface UseBookKanbanOptions {
  dateRange?: { from: Date; to: Date };
  bookIds?: string[];
  enabled?: boolean;
}

/**
 * Hook for fetching and managing book kanban items as calendar events
 * 
 * @param options - Filtering options
 * @returns Kanban items converted to calendar items
 */
export function useBookKanban(options: UseBookKanbanOptions = {}) {
  const { dateRange, bookIds, enabled = true } = options;

  // Convert kanban items to calendar items
  const calendarItems = useMemo((): CalendarItem[] => {
    if (!enabled) return [];
    
    let items = MOCK_KANBAN_ITEMS
      .map(kanbanToCalendarItem)
      .filter((item): item is CalendarItem => item !== null);
    
    // Filter by book IDs if specified
    if (bookIds && bookIds.length > 0) {
      items = items.filter(item => 
        item.bookIds.some(id => bookIds.includes(id))
      );
    }
    
    // Filter by date range if specified
    if (dateRange) {
      items = items.filter(item => {
        const itemStart = startOfDay(item.startAt);
        const itemEnd = endOfDay(item.endAt);
        return isWithinInterval(itemStart, { start: dateRange.from, end: dateRange.to }) ||
               isWithinInterval(itemEnd, { start: dateRange.from, end: dateRange.to }) ||
               (itemStart <= dateRange.from && itemEnd >= dateRange.to);
      });
    }
    
    return items;
  }, [enabled, bookIds, dateRange]);

  // Get items for a specific day
  const getItemsForDay = useCallback((date: Date): CalendarItem[] => {
    if (!enabled) return [];
    
    const targetDate = startOfDay(date);
    return calendarItems.filter(item => {
      const itemStart = startOfDay(item.startAt);
      const itemEnd = endOfDay(item.endAt);
      return isWithinInterval(targetDate, { start: itemStart, end: itemEnd });
    });
  }, [calendarItems, enabled]);

  // Get items for a specific book
  const getItemsForBook = useCallback((bookId: string): CalendarItem[] => {
    if (!enabled) return [];
    return calendarItems.filter(item => item.linkToBookId === bookId);
  }, [calendarItems, enabled]);

  // Navigate to book (stub - to be implemented by developer)
  const navigateToBook = useCallback((bookId: string) => {
    console.log('Navigate to book:', bookId);
    // TODO: Implement navigation to book page
    // Example: router.push(`/biblioteca/${bookId}`)
  }, []);

  // Navigate to kanban item (stub - to be implemented by developer)
  const navigateToKanbanItem = useCallback((bookId: string, itemId: string) => {
    console.log('Navigate to kanban item:', bookId, itemId);
    // TODO: Implement navigation to kanban item
    // Example: router.push(`/biblioteca/${bookId}?kanban=${itemId}`)
  }, []);

  return {
    items: calendarItems,
    getItemsForDay,
    getItemsForBook,
    navigateToBook,
    navigateToKanbanItem,
    isLoading: false, // Replace with actual loading state
    error: null, // Replace with actual error state
  };
}

/**
 * Hook for checking if an event is from kanban
 */
export function useIsKanbanItem(eventId: string): boolean {
  return eventId.startsWith('kanban-');
}

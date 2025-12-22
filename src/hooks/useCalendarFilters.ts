import { useState, useCallback } from 'react';
import { 
  CalendarFilters, 
  QuickFilter,
  EventStatus,
  EventPriority,
  Marketplace,
  EventOrigin,
  DEFAULT_FILTERS,
} from '@/types/calendar';

export function useCalendarFilters() {
  const [filters, setFilters] = useState<CalendarFilters>(DEFAULT_FILTERS);
  const [activeQuickFilters, setActiveQuickFilters] = useState<QuickFilter[]>([]);

  const updateFilter = useCallback(<K extends keyof CalendarFilters>(
    key: K,
    value: CalendarFilters[K]
  ): void => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleSystemEvents = useCallback((): void => {
    setFilters(prev => ({ ...prev, showSystemEvents: !prev.showSystemEvents }));
  }, []);

  const toggleUserEvents = useCallback((): void => {
    setFilters(prev => ({ ...prev, showUserEvents: !prev.showUserEvents }));
  }, []);

  const toggleTag = useCallback((tagId: string): void => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId],
    }));
  }, []);

  const toggleMarketplace = useCallback((marketplace: Marketplace): void => {
    setFilters(prev => ({
      ...prev,
      marketplaces: prev.marketplaces.includes(marketplace)
        ? prev.marketplaces.filter(m => m !== marketplace)
        : [...prev.marketplaces, marketplace],
    }));
  }, []);

  const toggleStatus = useCallback((status: EventStatus): void => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status],
    }));
  }, []);

  const togglePriority = useCallback((priority: EventPriority): void => {
    setFilters(prev => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter(p => p !== priority)
        : [...prev.priorities, priority],
    }));
  }, []);

  const toggleBookId = useCallback((bookId: string): void => {
    setFilters(prev => ({
      ...prev,
      bookIds: prev.bookIds.includes(bookId)
        ? prev.bookIds.filter(b => b !== bookId)
        : [...prev.bookIds, bookId],
    }));
  }, []);

  const toggleOrigin = useCallback((origin: EventOrigin): void => {
    setFilters(prev => ({
      ...prev,
      origin: prev.origin.includes(origin)
        ? prev.origin.filter(o => o !== origin)
        : [...prev.origin, origin],
    }));
  }, []);

  const setSearchQuery = useCallback((query: string): void => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setDateRange = useCallback((range: { from: Date; to: Date } | undefined): void => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  }, []);

  const applyQuickFilter = useCallback((quickFilter: QuickFilter): void => {
    const isActive = activeQuickFilters.includes(quickFilter);
    
    if (isActive) {
      setActiveQuickFilters(prev => prev.filter(f => f !== quickFilter));
      switch (quickFilter) {
        case 'system':
          setFilters(prev => ({ ...prev, showSystemEvents: true }));
          break;
        case 'user':
          setFilters(prev => ({ ...prev, showUserEvents: true }));
          break;
        case 'high_priority':
          setFilters(prev => ({ ...prev, priorities: [] }));
          break;
        case 'this_week':
          break;
      }
    } else {
      setActiveQuickFilters(prev => [...prev, quickFilter]);
      switch (quickFilter) {
        case 'system':
          setFilters(prev => ({ ...prev, showSystemEvents: true, showUserEvents: false }));
          break;
        case 'user':
          setFilters(prev => ({ ...prev, showSystemEvents: false, showUserEvents: true }));
          break;
        case 'high_priority':
          setFilters(prev => ({ ...prev, priorities: ['high', 'urgent'] }));
          break;
        case 'this_week':
          break;
      }
    }
  }, [activeQuickFilters]);

  const clearFilters = useCallback((): void => {
    setFilters(DEFAULT_FILTERS);
    setActiveQuickFilters([]);
  }, []);

  const hasActiveFilters = useCallback((): boolean => {
    return (
      !filters.showSystemEvents ||
      !filters.showUserEvents ||
      filters.tags.length > 0 ||
      filters.marketplaces.length > 0 ||
      filters.statuses.length > 0 ||
      filters.priorities.length > 0 ||
      filters.bookIds.length > 0 ||
      filters.origin.length > 0 ||
      filters.searchQuery !== ''
    );
  }, [filters]);

  return {
    filters,
    activeQuickFilters,
    updateFilter,
    toggleSystemEvents,
    toggleUserEvents,
    toggleTag,
    toggleMarketplace,
    toggleStatus,
    togglePriority,
    toggleBookId,
    toggleOrigin,
    setSearchQuery,
    setDateRange,
    applyQuickFilter,
    clearFilters,
    hasActiveFilters,
  };
}

import { useState, useCallback } from 'react';
import { 
  CalendarFilters, 
  QuickFilter,
  EventStatus,
  EventPriority,
  Marketplace 
} from '@/types/calendar';

const DEFAULT_FILTERS: CalendarFilters = {
  showSystemEvents: true,
  showUserEvents: true,
  tags: [],
  marketplaces: [],
  statuses: [],
  priorities: [],
};

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

  const applyQuickFilter = useCallback((quickFilter: QuickFilter): void => {
    const isActive = activeQuickFilters.includes(quickFilter);
    
    if (isActive) {
      setActiveQuickFilters(prev => prev.filter(f => f !== quickFilter));
      // Reset the specific filter
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
          // This is handled at the query level, not filter level
          break;
      }
    } else {
      setActiveQuickFilters(prev => [...prev, quickFilter]);
      // Apply the filter
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
          // This is handled at the query level
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
      filters.priorities.length > 0
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
    applyQuickFilter,
    clearFilters,
    hasActiveFilters,
  };
}

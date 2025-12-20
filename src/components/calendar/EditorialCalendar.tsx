import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Filter, Calendar as CalendarIcon, LayoutGrid } from 'lucide-react';
import { CalendarProvider, useCalendarContext } from '@/contexts/CalendarContext';
import { useCalendarFilters } from '@/hooks/useCalendarFilters';
import { useEvents } from '@/hooks/useEvents';
import { useReminders } from '@/hooks/useReminders';
import { MonthlyView } from './MonthlyView';
import { YearlyView } from './YearlyView';
import { EventPanel } from './EventPanel';
import { QuickCreateModal } from './QuickCreateModal';
import { FilterPanel } from './FilterPanel';
import { CalendarViewMode, CalendarFilters } from '@/types/calendar';

function CalendarContent() {
  const { viewMode, setViewMode, setQuickCreateDate, setIsQuickCreateOpen } = useCalendarContext();
  const { events } = useEvents();
  const { filters, hasActiveFilters, clearFilters } = useCalendarFilters();
  const [localFilters, setLocalFilters] = useState<CalendarFilters>({
    showSystemEvents: true,
    showUserEvents: true,
    tags: [],
    marketplaces: [],
    statuses: [],
    priorities: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Initialize reminders
  useReminders(events);

  const handleQuickCreate = () => {
    setQuickCreateDate(new Date());
    setIsQuickCreateOpen(true);
  };

  const activeFiltersCount = [
    !localFilters.showSystemEvents,
    !localFilters.showUserEvents,
    localFilters.tags.length > 0,
    localFilters.statuses.length > 0,
    localFilters.priorities.length > 0,
    localFilters.marketplaces.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-heading font-bold">Calendario Editorial</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as CalendarViewMode)}>
            <TabsList>
              <TabsTrigger value="month" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                Mes
              </TabsTrigger>
              <TabsTrigger value="year" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                Año
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filter Button */}
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 relative">
                <Filter className="h-4 w-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 w-auto">
              <FilterPanel
                filters={localFilters}
                onFiltersChange={setLocalFilters}
                onClose={() => setShowFilters(false)}
              />
            </PopoverContent>
          </Popover>

          {/* New Event Button */}
          <Button onClick={handleQuickCreate} className="gap-2 shadow-coral">
            <Plus className="h-4 w-4" />
            Nuevo evento
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="flex-1 min-h-0">
        {viewMode === 'month' ? (
          <MonthlyView filters={localFilters} />
        ) : (
          <YearlyView filters={localFilters} />
        )}
      </div>

      {/* Event Panel */}
      <EventPanel />

      {/* Quick Create Modal */}
      <QuickCreateModal />
    </div>
  );
}

export function EditorialCalendar() {
  return (
    <CalendarProvider>
      <CalendarContent />
    </CalendarProvider>
  );
}

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Filter, 
  Calendar as CalendarIcon, 
  LayoutGrid, 
  List,
  Search,
  RefreshCw,
  Cloud,
  CloudOff,
} from 'lucide-react';
import { CalendarProvider, useCalendarContext } from '@/contexts/CalendarContext';
import { useEvents } from '@/hooks/useEvents';
import { useReminders } from '@/hooks/useReminders';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { MonthlyView } from './MonthlyViewLegacy';
import { YearlyView } from './YearlyView';
import { ListView } from './ListView';
import { EventPanel } from './EventPanel';
import { QuickCreateModal } from './QuickCreateModal';
import { FilterPanel } from './FilterPanel';
import { GoogleCalendarModal } from './GoogleCalendarModal';
import { CalendarViewMode, CalendarFilters, CalendarModuleMode, DEFAULT_FILTERS } from '@/types/calendar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface EditorialCalendarModuleProps {
  mode?: CalendarModuleMode;
  initialView?: CalendarViewMode;
  className?: string;
}

function CalendarContent({ mode = 'page', initialView = 'month' }: EditorialCalendarModuleProps) {
  const { viewMode, setViewMode, setQuickCreateDate, setIsQuickCreateOpen } = useCalendarContext();
  const { events } = useEvents();
  const { isConnected, isLoading: isGoogleLoading, lastSyncAt, syncNow } = useGoogleCalendar();
  const [localFilters, setLocalFilters] = useState<CalendarFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Set initial view mode
  useEffect(() => {
    if (initialView) {
      setViewMode(initialView);
    }
  }, [initialView, setViewMode]);
  
  useReminders(events);

  const handleQuickCreate = () => {
    setQuickCreateDate(new Date());
    setIsQuickCreateOpen(true);
  };

  const activeFiltersCount = [
    !localFilters.showSystemEvents,
    !localFilters.showUserEvents,
    !localFilters.showGoogleEvents,
    !localFilters.showBookEventsEvents,
    localFilters.tags.length > 0,
    localFilters.statuses.length > 0,
    localFilters.priorities.length > 0,
    localFilters.marketplaces.length > 0,
    localFilters.bookIds.length > 0,
    localFilters.origin.length > 0,
  ].filter(Boolean).length;

  const filtersWithSearch = {
    ...localFilters,
    searchQuery,
  };

  const isEmbedded = mode === 'embedded';

  return (
    <div className={cn(
      'flex flex-col w-full',
      // Dynamic height based on mode - no fixed heights that cause clipping
      isEmbedded ? 'min-h-0' : 'h-full',
    )}>
      {/* Header/Toolbar - Sticky in embedded mode */}
      <div className={cn(
        'flex items-center justify-between gap-4 flex-wrap shrink-0',
        isEmbedded ? 'mb-4 sticky top-0 z-20 bg-card pb-2' : 'mb-6'
      )}>
        <div className="flex items-center gap-4">
          {!isEmbedded && (
            <h1 className="text-3xl font-heading font-bold">Calendario Editorial</h1>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[180px]"
              aria-label="Buscar eventos"
            />
          </div>

          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as CalendarViewMode)}>
            <TabsList>
              <TabsTrigger value="month" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Mes</span>
              </TabsTrigger>
              <TabsTrigger value="year" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Año</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Lista</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filter Button */}
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 relative" aria-label="Abrir filtros">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </Badge>
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

          {/* Google Calendar Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setShowGoogleModal(true)}
                aria-label="Google Calendar"
              >
                {isConnected ? (
                  <Cloud className="h-4 w-4 text-green-500" />
                ) : (
                  <CloudOff className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="hidden sm:inline">Google</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isConnected 
                ? `Conectado${lastSyncAt ? ` • Último sync: ${lastSyncAt.toLocaleTimeString()}` : ''}`
                : 'Conectar Google Calendar'
              }
            </TooltipContent>
          </Tooltip>

          {/* Sync Button (if connected) */}
          {isConnected && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={syncNow}
              disabled={isGoogleLoading}
              aria-label="Sincronizar"
            >
              <RefreshCw className={cn('h-4 w-4', isGoogleLoading && 'animate-spin')} />
            </Button>
          )}

          {/* New Event Button */}
          <Button onClick={handleQuickCreate} className="gap-2 shadow-coral">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo evento</span>
          </Button>
        </div>
      </div>

      {/* Calendar View - Flexible height based on content */}
      <div className={cn(
        'flex-1 min-h-0',
        // For list view, use internal scroll
        viewMode === 'list' && isEmbedded && 'max-h-[500px] overflow-hidden',
      )}>
        {viewMode === 'month' && <MonthlyView filters={filtersWithSearch} legacyStyle={isEmbedded} />}
        {viewMode === 'year' && <YearlyView filters={filtersWithSearch} />}
        {viewMode === 'list' && (
          <div className="h-full">
            <ListView filters={filtersWithSearch} />
          </div>
        )}
      </div>

      {/* Event Panel */}
      <EventPanel />

      {/* Quick Create Modal */}
      <QuickCreateModal />

      {/* Google Calendar Modal */}
      <GoogleCalendarModal 
        open={showGoogleModal} 
        onOpenChange={setShowGoogleModal} 
      />
    </div>
  );
}

export function EditorialCalendarModule(props: EditorialCalendarModuleProps) {
  return (
    <CalendarProvider>
      <CalendarContent {...props} />
    </CalendarProvider>
  );
}

// Legacy export for backwards compatibility
export function EditorialCalendar() {
  return <EditorialCalendarModule mode="page" />;
}
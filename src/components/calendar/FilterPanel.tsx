import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Filter, RotateCcw } from 'lucide-react';
import { useCalendarFilters } from '@/hooks/useCalendarFilters';
import {
  CalendarFilters as FiltersType,
  DEFAULT_TAGS,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  MARKETPLACE_CONFIG,
  EventStatus,
  EventPriority,
  Marketplace,
} from '@/types/calendar';

interface FilterPanelProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  onClose?: () => void;
}

export function FilterPanel({ filters, onFiltersChange, onClose }: FilterPanelProps) {
  const toggleSystemEvents = () => {
    onFiltersChange({ ...filters, showSystemEvents: !filters.showSystemEvents });
  };

  const toggleUserEvents = () => {
    onFiltersChange({ ...filters, showUserEvents: !filters.showUserEvents });
  };

  const toggleTag = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter(t => t !== tagId)
      : [...filters.tags, tagId];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const toggleStatus = (status: EventStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const togglePriority = (priority: EventPriority) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter(p => p !== priority)
      : [...filters.priorities, priority];
    onFiltersChange({ ...filters, priorities: newPriorities });
  };

  const toggleMarketplace = (marketplace: Marketplace) => {
    const newMarketplaces = filters.marketplaces.includes(marketplace)
      ? filters.marketplaces.filter(m => m !== marketplace)
      : [...filters.marketplaces, marketplace];
    onFiltersChange({ ...filters, marketplaces: newMarketplaces });
  };

  const clearFilters = () => {
    onFiltersChange({
      showSystemEvents: true,
      showUserEvents: true,
      tags: [],
      marketplaces: [],
      statuses: [],
      priorities: [],
    });
  };

  const hasActiveFilters =
    !filters.showSystemEvents ||
    !filters.showUserEvents ||
    filters.tags.length > 0 ||
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.marketplaces.length > 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4 w-64">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-heading font-semibold text-sm">Filtros</h3>
        </div>
        <div className="flex items-center gap-1">
          {hasActiveFilters && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearFilters}>
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-[400px] pr-3">
        <div className="space-y-4">
          {/* Event Type */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Tipo de evento</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="system" className="text-sm font-normal">Eventos del sistema</Label>
                <Switch
                  id="system"
                  checked={filters.showSystemEvents}
                  onCheckedChange={toggleSystemEvents}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="user" className="text-sm font-normal">Mis eventos</Label>
                <Switch
                  id="user"
                  checked={filters.showUserEvents}
                  onCheckedChange={toggleUserEvents}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Estado</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <Badge
                  key={key}
                  variant="outline"
                  className={cn(
                    'cursor-pointer transition-all text-xs',
                    filters.statuses.includes(key as EventStatus) && config.bgClass
                  )}
                  onClick={() => toggleStatus(key as EventStatus)}
                >
                  {config.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Priority */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Prioridad</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <Badge
                  key={key}
                  variant="outline"
                  className={cn(
                    'cursor-pointer transition-all text-xs',
                    filters.priorities.includes(key as EventPriority) && config.bgClass
                  )}
                  onClick={() => togglePriority(key as EventPriority)}
                >
                  {config.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Etiquetas</Label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_TAGS.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className={cn(
                    'cursor-pointer transition-all text-xs',
                    filters.tags.includes(tag.id) && 'ring-2 ring-offset-1'
                  )}
                  style={{
                    borderColor: tag.color,
                    color: filters.tags.includes(tag.id) ? tag.color : undefined,
                  }}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Marketplace */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Mercados</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(MARKETPLACE_CONFIG).map(([key, config]) => (
                <Badge
                  key={key}
                  variant="outline"
                  className={cn(
                    'cursor-pointer transition-all text-xs',
                    filters.marketplaces.includes(key as Marketplace) && 'bg-primary/20 border-primary'
                  )}
                  onClick={() => toggleMarketplace(key as Marketplace)}
                >
                  {config.flag} {key}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

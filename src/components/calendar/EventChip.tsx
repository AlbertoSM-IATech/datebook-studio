import { format, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { EditorialEvent, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types/calendar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowUp, ArrowDown, Minus, AlertTriangle, Calendar, BookOpen } from 'lucide-react';
import { useBooks } from '@/hooks/useBooks';

interface EventChipProps {
  event: EditorialEvent;
  compact?: boolean;
  onClick?: () => void;
  isDragging?: boolean;
}

const PriorityIcon = {
  low: ArrowDown,
  medium: Minus,
  high: ArrowUp,
  urgent: AlertTriangle,
};

export function EventChip({ event, compact = false, onClick, isDragging }: EventChipProps) {
  const { getBooksByIds } = useBooks();
  const books = getBooksByIds(event.bookIds);
  const Icon = PriorityIcon[event.priority];
  const statusConfig = STATUS_CONFIG[event.status];
  const priorityConfig = PRIORITY_CONFIG[event.priority];

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'w-full text-left px-2 py-1 rounded-md text-xs font-medium truncate transition-all',
              'hover:ring-2 hover:ring-primary/30',
              event.type === 'system' ? 'event-system bg-accent/10' : 'event-user bg-primary/10',
              isDragging && 'opacity-50 ring-2 ring-primary'
            )}
          >
            <span className="truncate">{event.title}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">{event.title}</p>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className={statusConfig.bgClass}>
                {statusConfig.label}
              </Badge>
              <span className={cn('flex items-center gap-1', priorityConfig.bgClass, 'px-2 py-0.5 rounded')}>
                <Icon className="h-3 w-3" />
                {priorityConfig.label}
              </span>
            </div>
            {books.length > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {books.map(b => b.title).join(', ')}
              </p>
            )}
            {!event.allDay && (
              <p className="text-xs text-muted-foreground">
                {format(event.startAt, 'HH:mm', { locale: es })} - {format(event.endAt, 'HH:mm', { locale: es })}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg transition-all card-hover',
        'bg-card border border-border',
        event.type === 'system' ? 'event-system' : 'event-user',
        isDragging && 'opacity-50 ring-2 ring-primary shadow-coral'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{event.title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {event.allDay ? 'Todo el día' : format(event.startAt, 'HH:mm', { locale: es })}
          </p>
        </div>
        <Icon className={cn('h-4 w-4 flex-shrink-0', `text-priority-${event.priority}`)} />
      </div>
      
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <Badge variant="outline" className={cn('text-xs', statusConfig.bgClass)}>
          {statusConfig.label}
        </Badge>
        {event.tags.slice(0, 2).map(tag => (
          <Badge 
            key={tag.id} 
            variant="outline" 
            className="text-xs"
            style={{ borderColor: tag.color, color: tag.color }}
          >
            {tag.name}
          </Badge>
        ))}
        {event.tags.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{event.tags.length - 2}
          </Badge>
        )}
      </div>

      {books.length > 0 && (
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <BookOpen className="h-3 w-3" />
          <span className="truncate">{books.map(b => b.title).join(', ')}</span>
        </div>
      )}
    </button>
  );
}

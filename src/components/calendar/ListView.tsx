import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Copy,
  Trash2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Columns,
} from 'lucide-react';
import { useCalendarContext } from '@/contexts/CalendarContext';
import { useEvents } from '@/hooks/useEvents';
import { useBooks } from '@/hooks/useBooks';
import {
  EditorialEvent,
  CalendarFilters,
  SortState,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  DEFAULT_LIST_COLUMNS,
  ListViewColumn,
} from '@/types/calendar';

interface ListViewProps {
  filters: CalendarFilters;
}

const ITEMS_PER_PAGE = 20;

export function ListView({ filters }: ListViewProps) {
  const { setSelectedEvent, setIsEventPanelOpen } = useCalendarContext();
  const { events, filterEvents, duplicateEvent, deleteEvent, markEventDone } = useEvents();
  const { getBooksByIds } = useBooks();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortState, setSortState] = useState<SortState>({ column: 'startAt', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [columns, setColumns] = useState<ListViewColumn[]>(DEFAULT_LIST_COLUMNS);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

  // Filter and search events
  const filteredEvents = useMemo(() => {
    let result = filterEvents(events, { ...filters, searchQuery });
    
    // Additional local search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.tags.some(t => t.name.toLowerCase().includes(query))
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortState.column) {
        case 'startAt':
          comparison = a.startAt.getTime() - b.startAt.getTime();
          break;
        case 'endAt':
          comparison = a.endAt.getTime() - b.endAt.getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        default:
          comparison = 0;
      }
      
      return sortState.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [events, filters, searchQuery, sortState, filterEvents]);

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (column: string) => {
    setSortState(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleOpenEvent = (event: EditorialEvent) => {
    setSelectedEvent(event);
    setIsEventPanelOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEvents(new Set(paginatedEvents.map(e => e.id)));
    } else {
      setSelectedEvents(new Set());
    }
  };

  const handleSelectEvent = (eventId: string, checked: boolean) => {
    const newSelected = new Set(selectedEvents);
    if (checked) {
      newSelected.add(eventId);
    } else {
      newSelected.delete(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const toggleColumn = (columnKey: string) => {
    setColumns(prev => prev.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  };

  const visibleColumns = columns.filter(col => col.visible);

  const renderSortIcon = (column: string) => {
    if (sortState.column !== column) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortState.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  const renderCellContent = (event: EditorialEvent, column: ListViewColumn) => {
    switch (column.key) {
      case 'startAt':
        return (
          <span className="text-sm">
            {format(event.startAt, 'dd MMM yyyy', { locale: es })}
            {!event.allDay && <span className="text-muted-foreground"> {format(event.startAt, 'HH:mm')}</span>}
          </span>
        );
      
      case 'endAt':
        return (
          <span className="text-sm">
            {format(event.endAt, 'dd MMM yyyy', { locale: es })}
          </span>
        );
      
      case 'title':
        return (
          <button 
            onClick={() => handleOpenEvent(event)}
            className="text-left font-medium hover:text-primary transition-colors"
          >
            {event.title}
          </button>
        );
      
      case 'status':
        const statusConfig = STATUS_CONFIG[event.status];
        return (
          <Badge variant="outline" className={cn('text-xs', statusConfig.bgClass)}>
            {statusConfig.label}
          </Badge>
        );
      
      case 'priority':
        const priorityConfig = PRIORITY_CONFIG[event.priority];
        return (
          <Badge variant="outline" className={cn('text-xs', priorityConfig.bgClass)}>
            {priorityConfig.label}
          </Badge>
        );
      
      case 'assignedTo':
        return event.assignedTo || <span className="text-muted-foreground">—</span>;
      
      case 'marketplace':
        if (!event.marketplace?.length) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex gap-1">
            {event.marketplace.slice(0, 2).map(m => (
              <Badge key={m} variant="outline" className="text-xs px-1">
                {m}
              </Badge>
            ))}
            {event.marketplace.length > 2 && (
              <Badge variant="outline" className="text-xs px-1">
                +{event.marketplace.length - 2}
              </Badge>
            )}
          </div>
        );
      
      case 'bookIds':
        const books = getBooksByIds(event.bookIds);
        if (!books.length) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex gap-1 flex-wrap">
            {books.slice(0, 1).map(book => (
              <Badge key={book.id} variant="secondary" className="text-xs truncate max-w-[100px]">
                {book.title}
              </Badge>
            ))}
            {books.length > 1 && (
              <Badge variant="secondary" className="text-xs">
                +{books.length - 1}
              </Badge>
            )}
          </div>
        );
      
      case 'tags':
        if (!event.tags.length) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex gap-1 flex-wrap">
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
        );
      
      case 'type':
        return (
          <Badge variant={event.type === 'system' ? 'secondary' : 'outline'} className="text-xs">
            {event.type === 'system' ? 'Sistema' : 'Usuario'}
          </Badge>
        );
      
      case 'origin':
        return (
          <Badge variant="outline" className="text-xs">
            {event.origin === 'google' ? 'Google' : 'Local'}
          </Badge>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Buscar eventos"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredEvents.length} eventos
          </span>

          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Columns className="h-4 w-4" />
                Columnas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columns.map(col => (
                <DropdownMenuItem
                  key={col.key}
                  onClick={() => toggleColumn(col.key)}
                  className="gap-2"
                >
                  <Checkbox checked={col.visible} className="pointer-events-none" />
                  {col.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 border rounded-lg overflow-hidden">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={paginatedEvents.length > 0 && selectedEvents.size === paginatedEvents.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Seleccionar todos"
                  />
                </TableHead>
                {visibleColumns.map(col => (
                  <TableHead 
                    key={col.key}
                    style={{ width: col.width }}
                    className={col.sortable ? 'cursor-pointer select-none' : ''}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && renderSortIcon(col.key)}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEvents.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={visibleColumns.length + 2} 
                    className="h-32 text-center text-muted-foreground"
                  >
                    No se encontraron eventos
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEvents.map(event => (
                  <TableRow 
                    key={event.id}
                    className={cn(
                      'group',
                      selectedEvents.has(event.id) && 'bg-primary/5'
                    )}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedEvents.has(event.id)}
                        onCheckedChange={(checked) => handleSelectEvent(event.id, !!checked)}
                        aria-label={`Seleccionar ${event.title}`}
                      />
                    </TableCell>
                    {visibleColumns.map(col => (
                      <TableCell key={col.key}>
                        {renderCellContent(event, col)}
                      </TableCell>
                    ))}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Acciones"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEvent(event)} className="gap-2">
                            <Eye className="h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateEvent(event.id)} className="gap-2">
                            <Copy className="h-4 w-4" />
                            Duplicar
                          </DropdownMenuItem>
                          {event.status !== 'done' && (
                            <DropdownMenuItem onClick={() => markEventDone(event.id)} className="gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Marcar como hecho
                            </DropdownMenuItem>
                          )}
                          {event.type === 'user' && (
                            <DropdownMenuItem 
                              onClick={() => deleteEvent(event.id)} 
                              className="gap-2 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

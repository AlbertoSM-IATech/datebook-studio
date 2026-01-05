import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Cloud,
  Kanban,
  BookOpen,
  Calendar,
  GripVertical,
  Check,
  X,
  Pencil,
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
  EventStatus,
  EventPriority,
} from '@/types/calendar';

interface ListViewProps {
  filters: CalendarFilters;
}

const ITEMS_PER_PAGE = 20;

// Column order storage key
const COLUMN_ORDER_KEY = 'publify-list-column-order';

export function ListView({ filters }: ListViewProps) {
  const { setSelectedEvent, setIsEventPanelOpen } = useCalendarContext();
  const { events, filterEvents, duplicateEvent, deleteEvent, markEventDone, updateEvent } = useEvents();
  const { getBooksByIds } = useBooks();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortState, setSortState] = useState<SortState>({ column: 'startAt', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  
  // Column ordering with localStorage persistence
  const [columns, setColumns] = useState<ListViewColumn[]>(() => {
    const saved = localStorage.getItem(COLUMN_ORDER_KEY);
    if (saved) {
      try {
        const savedOrder = JSON.parse(saved);
        // Map saved order to current columns (in case columns changed)
        return DEFAULT_LIST_COLUMNS.map(col => ({
          ...col,
          visible: savedOrder.find((s: any) => s.key === col.key)?.visible ?? col.visible,
        })).sort((a, b) => {
          const aIndex = savedOrder.findIndex((s: any) => s.key === a.key);
          const bIndex = savedOrder.findIndex((s: any) => s.key === b.key);
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
      } catch {
        return DEFAULT_LIST_COLUMNS;
      }
    }
    return DEFAULT_LIST_COLUMNS;
  });

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{ eventId: string; column: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Drag state for column reordering
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  // Save column order to localStorage
  const saveColumnOrder = useCallback((newColumns: ListViewColumn[]) => {
    localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(
      newColumns.map(c => ({ key: c.key, visible: c.visible }))
    ));
  }, []);

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
        case 'origin':
          comparison = a.origin.localeCompare(b.origin);
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
    const newColumns = columns.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    );
    setColumns(newColumns);
    saveColumnOrder(newColumns);
  };

  // Handle column drag start
  const handleDragStart = (columnKey: string) => {
    setDraggedColumn(columnKey);
  };

  // Handle column drag over
  const handleDragOver = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === targetKey) return;
  };

  // Handle column drop - reorder columns
  const handleDrop = (targetKey: string) => {
    if (!draggedColumn || draggedColumn === targetKey) {
      setDraggedColumn(null);
      return;
    }

    const draggedIndex = columns.findIndex(c => c.key === draggedColumn);
    const targetIndex = columns.findIndex(c => c.key === targetKey);

    const newColumns = [...columns];
    const [removed] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, removed);

    setColumns(newColumns);
    saveColumnOrder(newColumns);
    setDraggedColumn(null);
  };

  // Start inline editing
  const startEditing = (eventId: string, column: string, currentValue: string) => {
    setEditingCell({ eventId, column });
    setEditValue(currentValue);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Save inline edit
  const saveEdit = (eventId: string, column: string) => {
    if (!editingCell) return;

    const updates: Partial<EditorialEvent> = {};
    
    switch (column) {
      case 'title':
        if (editValue.trim()) {
          updates.title = editValue.trim();
        }
        break;
      case 'status':
        updates.status = editValue as EventStatus;
        break;
      case 'priority':
        updates.priority = editValue as EventPriority;
        break;
    }

    if (Object.keys(updates).length > 0) {
      updateEvent(eventId, updates);
    }

    cancelEditing();
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

  const getOriginIcon = (origin: string) => {
    switch (origin) {
      case 'google': return <Cloud className="h-3.5 w-3.5 text-blue-500" />;
      case 'kanban': return <Kanban className="h-3.5 w-3.5 text-purple-500" />;
      case 'book': return <BookOpen className="h-3.5 w-3.5 text-orange-500" />;
      default: return <Calendar className="h-3.5 w-3.5 text-primary" />;
    }
  };

  const getOriginLabel = (origin: string) => {
    switch (origin) {
      case 'google': return 'Google';
      case 'kanban': return 'Kanban';
      case 'book': return 'Libro';
      default: return 'Local';
    }
  };

  // Render editable cell content
  const renderCellContent = (event: EditorialEvent, column: ListViewColumn) => {
    const isEditing = editingCell?.eventId === event.id && editingCell?.column === column.key;
    const isEditable = event.type === 'user' && ['title', 'status', 'priority'].includes(column.key);

    switch (column.key) {
      case 'startAt':
        return (
          <span className="text-sm whitespace-nowrap">
            {format(event.startAt, 'dd MMM yyyy', { locale: es })}
            {!event.allDay && <span className="text-muted-foreground"> {format(event.startAt, 'HH:mm')}</span>}
          </span>
        );
      
      case 'endAt':
        return (
          <span className="text-sm whitespace-nowrap">
            {format(event.endAt, 'dd MMM yyyy', { locale: es })}
          </span>
        );
      
      case 'title':
        if (isEditing) {
          return (
            <div className="flex items-center gap-1">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="h-7 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit(event.id, column.key);
                  if (e.key === 'Escape') cancelEditing();
                }}
              />
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => saveEdit(event.id, column.key)}>
                <Check className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={cancelEditing}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-1 group/cell">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => handleOpenEvent(event)}
                  className="text-left font-medium hover:text-primary transition-colors truncate max-w-[200px] block"
                >
                  {event.title}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>{event.title}</p>
                {event.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                )}
              </TooltipContent>
            </Tooltip>
            {isEditable && (
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5 opacity-0 group-hover/cell:opacity-100 transition-opacity"
                onClick={() => startEditing(event.id, column.key, event.title)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            )}
          </div>
        );
      
      case 'status':
        const statusConfig = STATUS_CONFIG[event.status];
        if (isEditing) {
          return (
            <div className="flex items-center gap-1">
              <Select value={editValue} onValueChange={(value) => { setEditValue(value); }}>
                <SelectTrigger className="h-7 text-xs w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => saveEdit(event.id, column.key)}>
                <Check className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={cancelEditing}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-1 group/cell">
            <Badge variant="outline" className={cn('text-xs whitespace-nowrap', statusConfig.bgClass)}>
              {statusConfig.label}
            </Badge>
            {isEditable && (
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5 opacity-0 group-hover/cell:opacity-100 transition-opacity"
                onClick={() => startEditing(event.id, column.key, event.status)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            )}
          </div>
        );
      
      case 'priority':
        const priorityConfig = PRIORITY_CONFIG[event.priority];
        if (isEditing) {
          return (
            <div className="flex items-center gap-1">
              <Select value={editValue} onValueChange={(value) => { setEditValue(value); }}>
                <SelectTrigger className="h-7 text-xs w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => saveEdit(event.id, column.key)}>
                <Check className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={cancelEditing}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-1 group/cell">
            <Badge variant="outline" className={cn('text-xs whitespace-nowrap', priorityConfig.bgClass)}>
              {priorityConfig.label}
            </Badge>
            {isEditable && (
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5 opacity-0 group-hover/cell:opacity-100 transition-opacity"
                onClick={() => startEditing(event.id, column.key, event.priority)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            )}
          </div>
        );
      
      case 'assignedTo':
        return event.assignedTo || <span className="text-muted-foreground">—</span>;
      
      case 'marketplace':
        if (!event.marketplace?.length) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex gap-1 flex-nowrap">
            {event.marketplace.slice(0, 2).map(m => (
              <Badge key={m} variant="outline" className="text-xs px-1 whitespace-nowrap">
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
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex gap-1 flex-nowrap">
                {books.slice(0, 1).map(book => (
                  <Badge key={book.id} variant="secondary" className="text-xs truncate max-w-[80px]">
                    {book.title}
                  </Badge>
                ))}
                {books.length > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    +{books.length - 1}
                  </Badge>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <ul className="text-xs space-y-1">
                {books.map(book => (
                  <li key={book.id}>📚 {book.title}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        );
      
      case 'tags':
        if (!event.tags.length) return <span className="text-muted-foreground">—</span>;
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex gap-1 flex-nowrap">
                {event.tags.slice(0, 2).map(tag => (
                  <Badge 
                    key={tag.id} 
                    variant="outline" 
                    className="text-xs whitespace-nowrap"
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
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="flex flex-wrap gap-1">
                {event.tags.map(tag => (
                  <span 
                    key={tag.id} 
                    className="text-xs px-1 rounded"
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        );
      
      case 'type':
        return (
          <Badge variant={event.type === 'system' ? 'secondary' : 'outline'} className="text-xs whitespace-nowrap">
            {event.type === 'system' ? 'Sistema' : 'Usuario'}
          </Badge>
        );
      
      case 'origin':
        return (
          <div className="flex items-center gap-1.5">
            {getOriginIcon(event.origin)}
            <span className="text-xs">{getOriginLabel(event.origin)}</span>
          </div>
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
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {filteredEvents.length} eventos
          </span>

          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Columns className="h-4 w-4" />
                <span className="hidden sm:inline">Columnas</span>
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

      {/* Table with horizontal scroll */}
      <div className="flex-1 border rounded-lg overflow-hidden">
        <div className="overflow-x-auto h-full">
          <Table className="min-w-[900px]">
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={paginatedEvents.length > 0 && selectedEvents.size === paginatedEvents.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Seleccionar todos"
                  />
                </TableHead>
                {visibleColumns.map((col, index) => (
                  <TableHead 
                    key={col.key}
                    draggable
                    onDragStart={() => handleDragStart(col.key)}
                    onDragOver={(e) => handleDragOver(e, col.key)}
                    onDrop={() => handleDrop(col.key)}
                    onDragEnd={() => setDraggedColumn(null)}
                    style={{ width: col.width, minWidth: col.width }}
                    className={cn(
                      col.sortable ? 'cursor-pointer select-none' : '',
                      'whitespace-nowrap',
                      draggedColumn === col.key && 'opacity-50 bg-muted'
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                    aria-sort={sortState.column === col.key 
                      ? sortState.direction === 'asc' ? 'ascending' : 'descending'
                      : undefined
                    }
                  >
                    <div className="flex items-center gap-1">
                      <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab" />
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
                      <TableCell key={col.key} className="py-2">
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
        </div>
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
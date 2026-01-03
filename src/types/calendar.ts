// ============================================
// PUBLIFY EDITORIAL CALENDAR - TYPE DEFINITIONS
// ============================================

// Event Types
export type EventType = 'system' | 'user';

// Event Status
export type EventStatus = 'pending' | 'in_progress' | 'review' | 'done' | 'cancelled';

// Event Priority
export type EventPriority = 'low' | 'medium' | 'high' | 'urgent';

// Reminder Channel
export type ReminderChannel = 'in_app' | 'email' | 'push';

// Marketplace
export type Marketplace = 'ES' | 'US' | 'DE' | 'FR' | 'IT' | 'UK' | 'CA' | 'AU' | 'MX' | 'BR' | 'JP';

// Event Origin - Unified: book_events replaces kanban and book
export type EventOrigin = 'local' | 'google' | 'book_events';

// Calendar Source Type (for unified calendar items)
export type CalendarSourceType = 'calendar' | 'google' | 'book_events';

// Checklist Item
export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  section?: string;
}

// Reminder
export interface Reminder {
  id: string;
  offsetMinutes: number;
  channel: ReminderChannel;
  enabled: boolean;
  triggered?: boolean;
}

// Tag
export interface Tag {
  id: string;
  name: string;
  color: string;
}

// Book (simplified for calendar reference)
export interface Book {
  id: string;
  title: string;
  coverUrl?: string;
  author?: string;
}

// Editorial Event
export interface EditorialEvent {
  id: string;
  type: EventType;
  systemKey?: string;
  title: string;
  status: EventStatus;
  priority: EventPriority;
  startAt: Date;
  endAt: Date;
  allDay: boolean;
  marketplace?: Marketplace[];
  bookIds: string[];
  tags: Tag[];
  description: string;
  checklistItems: ChecklistItem[];
  reminders: Reminder[];
  assignedTo?: string;
  origin: EventOrigin;
  sourceType?: CalendarSourceType;
  // Google Calendar sync fields
  googleEventId?: string;
  googleCalendarId?: string;
  syncedAt?: Date;
  conflictState?: 'none' | 'local_changed' | 'google_changed' | 'both_changed';
  // Google Calendar OAuth fields for sync
  gcal_event_id?: string;
  gcal_calendar_id?: string;
  gcal_sync_status?: 'not_linked' | 'linked' | 'pending' | 'error';
  gcal_last_synced_at?: Date;
  gcal_etag?: string;
  // Kanban navigation
  kanban_task_id?: string;
  book_id?: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
}

// System Event Template
export interface SystemEventTemplate {
  key: string;
  name: string;
  description: string;
  month: number;
  day: number | null;
  dynamicRule?: string;
  category: string;
  defaultTags: Tag[];
  defaultReminders: Reminder[];
  enabled: boolean;
}

// Calendar View Mode - Now includes 'list'
export type CalendarViewMode = 'month' | 'year' | 'list';

// Calendar Module Mode
export type CalendarModuleMode = 'embedded' | 'page';

// Filter State - Unified with showBookEventsEvents
export interface CalendarFilters {
  showSystemEvents: boolean;
  showUserEvents: boolean;
  showGoogleEvents: boolean;
  showBookEventsEvents: boolean; // Unified: replaces showKanbanEvents and showBookEvents
  tags: string[];
  marketplaces: Marketplace[];
  statuses: EventStatus[];
  priorities: EventPriority[];
  bookIds: string[];
  assignedTo: string[];
  dateRange?: { from: Date; to: Date };
  origin: EventOrigin[];
  searchQuery: string;
}

// Quick Filter Chip
export type QuickFilter = 'system' | 'user' | 'high_priority' | 'this_week';

// Event Form Data
export interface EventFormData {
  title: string;
  type: EventType;
  status: EventStatus;
  priority: EventPriority;
  startAt: Date;
  endAt: Date;
  allDay: boolean;
  marketplace: Marketplace[];
  bookIds: string[];
  tags: Tag[];
  description: string;
  checklistItems: ChecklistItem[];
  reminders: Reminder[];
  assignedTo?: string;
}

// Calendar Day Cell Data
export interface CalendarDayData {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: EditorialEvent[];
}

// Calendar Month Data
export interface CalendarMonthData {
  year: number;
  month: number;
  days: CalendarDayData[];
}

// Google Calendar Info (for calendar selector)
export interface GoogleCalendarInfo {
  id: string;
  name: string;
  primary: boolean;
  color: string;
  selected: boolean;
}

// Google Calendar Types
export interface GoogleCalendarConnection {
  isConnected: boolean;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  selectedCalendars: string[];
  availableCalendars?: GoogleCalendarInfo[];
  lastSyncAt?: Date;
  syncEnabled: boolean;
}

// Google OAuth Settings for sync configuration
export interface GoogleOAuthSettings {
  syncUserEvents: boolean;
  syncBookEvents: boolean;
  syncSystemEvents: boolean;
  syncDirection: 'to_google' | 'from_google' | 'bidirectional';
  targetCalendarId?: string;
}

// Google OAuth Connection entity for database
export interface GoogleOAuthConnection {
  user_id: string;
  provider: 'google';
  access_token: string; // encrypted
  refresh_token: string; // encrypted
  scope: string;
  expires_at: Date;
  status: 'connected' | 'revoked' | 'error';
  created_at: Date;
  updated_at: Date;
}

export interface GoogleCalendarSyncLog {
  id: string;
  timestamp: Date;
  action: 'import' | 'export' | 'sync';
  status: 'success' | 'error' | 'partial';
  eventsProcessed: number;
  eventsCreated: number;
  eventsUpdated: number;
  eventsFailed: number;
  errors?: string[];
}

// List View Column
export interface ListViewColumn {
  key: string;
  label: string;
  visible: boolean;
  sortable: boolean;
  width?: string;
}

// Sort State
export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

// Status configuration
export const STATUS_CONFIG: Record<EventStatus, { label: string; color: string; bgClass: string }> = {
  pending: { label: 'Pendiente', color: 'hsl(var(--status-pending))', bgClass: 'badge-pending' },
  in_progress: { label: 'En progreso', color: 'hsl(var(--status-in-progress))', bgClass: 'badge-in-progress' },
  review: { label: 'En revisión', color: 'hsl(var(--status-review))', bgClass: 'badge-review' },
  done: { label: 'Hecho', color: 'hsl(var(--status-done))', bgClass: 'badge-done' },
  cancelled: { label: 'Cancelado', color: 'hsl(var(--status-cancelled))', bgClass: 'badge-cancelled' },
};

// Priority configuration
export const PRIORITY_CONFIG: Record<EventPriority, { label: string; color: string; icon: string; bgClass: string }> = {
  low: { label: 'Baja', color: 'hsl(var(--priority-low))', icon: 'ArrowDown', bgClass: 'badge-priority-low' },
  medium: { label: 'Media', color: 'hsl(var(--priority-medium))', icon: 'Minus', bgClass: 'badge-priority-medium' },
  high: { label: 'Alta', color: 'hsl(var(--priority-high))', icon: 'ArrowUp', bgClass: 'badge-priority-high' },
  urgent: { label: 'Urgente', color: 'hsl(var(--priority-urgent))', icon: 'AlertTriangle', bgClass: 'badge-priority-urgent' },
};

// Marketplace configuration
export const MARKETPLACE_CONFIG: Record<Marketplace, { label: string; flag: string }> = {
  ES: { label: 'España', flag: '🇪🇸' },
  US: { label: 'Estados Unidos', flag: '🇺🇸' },
  DE: { label: 'Alemania', flag: '🇩🇪' },
  FR: { label: 'Francia', flag: '🇫🇷' },
  IT: { label: 'Italia', flag: '🇮🇹' },
  UK: { label: 'Reino Unido', flag: '🇬🇧' },
  CA: { label: 'Canadá', flag: '🇨🇦' },
  AU: { label: 'Australia', flag: '🇦🇺' },
  MX: { label: 'México', flag: '🇲🇽' },
  BR: { label: 'Brasil', flag: '🇧🇷' },
  JP: { label: 'Japón', flag: '🇯🇵' },
};

// Default reminder presets
export const REMINDER_PRESETS = [
  { label: '10 minutos antes', offsetMinutes: 10 },
  { label: '30 minutos antes', offsetMinutes: 30 },
  { label: '1 hora antes', offsetMinutes: 60 },
  { label: '2 horas antes', offsetMinutes: 120 },
  { label: '1 día antes', offsetMinutes: 1440 },
  { label: '2 días antes', offsetMinutes: 2880 },
  { label: '1 semana antes', offsetMinutes: 10080 },
];

// Default tags
export const DEFAULT_TAGS: Tag[] = [
  { id: 'launch', name: 'Lanzamiento', color: 'hsl(24 94% 59%)' },
  { id: 'promo', name: 'Promoción', color: 'hsl(217 91% 60%)' },
  { id: 'marketing', name: 'Marketing', color: 'hsl(142 71% 45%)' },
  { id: 'content', name: 'Contenido', color: 'hsl(262 83% 58%)' },
  { id: 'deadline', name: 'Deadline', color: 'hsl(0 84% 60%)' },
  { id: 'meeting', name: 'Reunión', color: 'hsl(38 92% 50%)' },
];

// Calendar Source
export interface CalendarSource {
  id: string;
  type: CalendarSourceType;
  name: string;
  enabledByDefault: boolean;
  icon?: string;
}

// Available Calendar Sources - Unified: single book_events source
export const CALENDAR_SOURCES: CalendarSource[] = [
  { id: 'calendar', type: 'calendar', name: 'Eventos propios', enabledByDefault: true, icon: 'Calendar' },
  { id: 'google', type: 'google', name: 'Google Calendar', enabledByDefault: true, icon: 'Cloud' },
  { id: 'book_events', type: 'book_events', name: 'Eventos de libros', enabledByDefault: true, icon: 'BookOpen' },
];

// Unified Calendar Item (can be from events or kanban)
export interface CalendarItem {
  id: string;
  sourceType: CalendarSourceType;
  sourceId: string;
  title: string;
  startAt: Date;
  endAt: Date;
  allDay: boolean;
  status: EventStatus;
  priority: EventPriority;
  bookIds: string[];
  tags: Tag[];
  linkToBookId?: string;
  linkToKanbanItemId?: string;
  description?: string;
}

// Book Kanban Item (from library)
export interface BookKanbanItem {
  id: string;
  bookId: string;
  title: string;
  status: string;
  priority?: EventPriority;
  dueDate?: Date;
  startDate?: Date;
  description?: string;
  tags?: Tag[];
}

// Default filters - Unified with showBookEventsEvents
export const DEFAULT_FILTERS: CalendarFilters = {
  showSystemEvents: true,
  showUserEvents: true,
  showGoogleEvents: true,
  showBookEventsEvents: true, // Unified
  tags: [],
  marketplaces: [],
  statuses: [],
  priorities: [],
  bookIds: [],
  assignedTo: [],
  origin: [],
  searchQuery: '',
};

// Default list columns
export const DEFAULT_LIST_COLUMNS: ListViewColumn[] = [
  { key: 'startAt', label: 'Fecha inicio', visible: true, sortable: true, width: '120px' },
  { key: 'endAt', label: 'Fecha fin', visible: true, sortable: true, width: '120px' },
  { key: 'title', label: 'Título', visible: true, sortable: true },
  { key: 'status', label: 'Estado', visible: true, sortable: true, width: '120px' },
  { key: 'priority', label: 'Prioridad', visible: true, sortable: true, width: '100px' },
  { key: 'assignedTo', label: 'Asignado', visible: false, sortable: true, width: '120px' },
  { key: 'marketplace', label: 'Mercado', visible: true, sortable: false, width: '100px' },
  { key: 'bookIds', label: 'Libros', visible: true, sortable: false, width: '150px' },
  { key: 'tags', label: 'Etiquetas', visible: true, sortable: false, width: '150px' },
  { key: 'type', label: 'Tipo', visible: true, sortable: true, width: '90px' },
  { key: 'origin', label: 'Origen', visible: true, sortable: true, width: '90px' },
];

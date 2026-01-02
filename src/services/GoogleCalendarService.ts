// ============================================
// GOOGLE CALENDAR SERVICE (Mock/Abstract)
// ============================================
// This service provides the contract for Google Calendar integration.
// In production, this would connect to actual Google Calendar API.

import { EditorialEvent, GoogleCalendarConnection, GoogleCalendarSyncLog, GoogleCalendarInfo } from '@/types/calendar';

// Google Calendar API mock responses
interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  location?: string;
  attendees?: { email: string; displayName?: string }[];
  updated: string;
}

interface GoogleCalendar {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
}

class GoogleCalendarServiceClass {
  private connection: GoogleCalendarConnection = {
    isConnected: false,
    selectedCalendars: [],
    availableCalendars: [],
    syncEnabled: false,
  };

  private syncLogs: GoogleCalendarSyncLog[] = [];

  // Mock available calendars
  private mockCalendars: GoogleCalendar[] = [
    { id: 'primary', summary: 'Calendario principal', primary: true, backgroundColor: '#4285f4' },
    { id: 'work', summary: 'Trabajo', backgroundColor: '#7986cb' },
    { id: 'personal', summary: 'Personal', backgroundColor: '#33b679' },
    { id: 'deadlines', summary: 'Fechas límite', backgroundColor: '#e67c73' },
    { id: 'meetings', summary: 'Reuniones', backgroundColor: '#f6bf26' },
  ];

  // ==================== Authentication ====================

  async initiateOAuth(): Promise<string> {
    // In production: redirect to Google OAuth consent screen
    // Returns authorization URL
    const clientId = 'YOUR_CLIENT_ID';
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'https://www.googleapis.com/auth/calendar';
    
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline`;
  }

  async handleOAuthCallback(code: string): Promise<boolean> {
    // In production: exchange code for tokens via backend
    console.log('Handling OAuth callback with code:', code);
    
    // Mock successful connection with available calendars
    const availableCalendars: GoogleCalendarInfo[] = this.mockCalendars.map(cal => ({
      id: cal.id,
      name: cal.summary,
      primary: cal.primary || false,
      color: cal.backgroundColor || '#4285f4',
      selected: cal.primary || false, // Select primary by default
    }));

    this.connection = {
      isConnected: true,
      email: 'usuario@gmail.com',
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      tokenExpiresAt: new Date(Date.now() + 3600000),
      selectedCalendars: ['primary'],
      availableCalendars,
      lastSyncAt: undefined,
      syncEnabled: true,
    };

    return true;
  }

  async disconnect(): Promise<void> {
    // In production: revoke tokens
    this.connection = {
      isConnected: false,
      selectedCalendars: [],
      availableCalendars: [],
      syncEnabled: false,
    };
  }

  getConnection(): GoogleCalendarConnection {
    return { ...this.connection };
  }

  isConnected(): boolean {
    return this.connection.isConnected;
  }

  // ==================== Calendars ====================

  async getCalendars(): Promise<GoogleCalendarInfo[]> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to Google Calendar');
    }

    return this.connection.availableCalendars || [];
  }

  async selectCalendars(calendarIds: string[]): Promise<void> {
    this.connection.selectedCalendars = calendarIds;
    
    // Update available calendars selection state
    if (this.connection.availableCalendars) {
      this.connection.availableCalendars = this.connection.availableCalendars.map(cal => ({
        ...cal,
        selected: calendarIds.includes(cal.id),
      }));
    }
  }

  getSelectedCalendars(): string[] {
    return this.connection.selectedCalendars;
  }

  // ==================== Import ====================

  async importEvents(
    dateFrom: Date,
    dateTo: Date,
    options: { readOnly?: boolean } = {}
  ): Promise<{ imported: EditorialEvent[]; log: GoogleCalendarSyncLog }> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to Google Calendar');
    }

    const log: GoogleCalendarSyncLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      action: 'import',
      status: 'success',
      eventsProcessed: 0,
      eventsCreated: 0,
      eventsUpdated: 0,
      eventsFailed: 0,
    };

    // Mock imported events
    const mockGoogleEvents: GoogleCalendarEvent[] = [
      {
        id: 'google-evt-1',
        summary: 'Reunión con editor',
        description: 'Discutir el próximo manuscrito',
        start: { dateTime: new Date(Date.now() + 86400000 * 3).toISOString() },
        end: { dateTime: new Date(Date.now() + 86400000 * 3 + 3600000).toISOString() },
        updated: new Date().toISOString(),
      },
      {
        id: 'google-evt-2',
        summary: 'Deadline entrega capítulos',
        start: { date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0] },
        end: { date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0] },
        updated: new Date().toISOString(),
      },
    ];

    const importedEvents: EditorialEvent[] = mockGoogleEvents.map(gEvent => 
      this.mapGoogleEventToLocal(gEvent)
    );

    log.eventsProcessed = mockGoogleEvents.length;
    log.eventsCreated = importedEvents.length;
    
    this.syncLogs.unshift(log);
    this.connection.lastSyncAt = new Date();

    return { imported: importedEvents, log };
  }

  // ==================== Export ====================

  async exportEvents(
    events: EditorialEvent[],
    targetCalendarId: string = 'primary'
  ): Promise<{ exported: number; log: GoogleCalendarSyncLog }> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to Google Calendar');
    }

    const log: GoogleCalendarSyncLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      action: 'export',
      status: 'success',
      eventsProcessed: events.length,
      eventsCreated: 0,
      eventsUpdated: 0,
      eventsFailed: 0,
    };

    for (const event of events) {
      try {
        if (event.googleEventId) {
          // Update existing
          await this.updateGoogleEvent(event, targetCalendarId);
          log.eventsUpdated++;
        } else {
          // Create new
          await this.createGoogleEvent(event, targetCalendarId);
          log.eventsCreated++;
        }
      } catch (error) {
        log.eventsFailed++;
        log.errors = log.errors || [];
        log.errors.push(`Error exporting event ${event.id}: ${error}`);
      }
    }

    if (log.eventsFailed > 0) {
      log.status = log.eventsFailed === events.length ? 'error' : 'partial';
    }

    this.syncLogs.unshift(log);
    
    return { exported: log.eventsCreated + log.eventsUpdated, log };
  }

  private async createGoogleEvent(
    event: EditorialEvent,
    calendarId: string
  ): Promise<string> {
    // In production: POST to Google Calendar API
    console.log('Creating Google event:', event.title, 'in calendar:', calendarId);
    
    // Return mock Google event ID
    return `google-${event.id}`;
  }

  private async updateGoogleEvent(
    event: EditorialEvent,
    calendarId: string
  ): Promise<void> {
    // In production: PUT to Google Calendar API
    console.log('Updating Google event:', event.googleEventId, 'in calendar:', calendarId);
  }

  // ==================== Sync ====================

  async syncBidirectional(): Promise<GoogleCalendarSyncLog> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to Google Calendar');
    }

    const log: GoogleCalendarSyncLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      action: 'sync',
      status: 'success',
      eventsProcessed: 0,
      eventsCreated: 0,
      eventsUpdated: 0,
      eventsFailed: 0,
    };

    // In production: compare local and remote, sync differences
    this.syncLogs.unshift(log);
    this.connection.lastSyncAt = new Date();

    return log;
  }

  // ==================== Conflict Resolution ====================

  async resolveConflict(
    eventId: string,
    resolution: 'keep_local' | 'keep_google'
  ): Promise<void> {
    console.log('Resolving conflict for event:', eventId, 'with resolution:', resolution);
    // In production: apply resolution and update both systems
  }

  // ==================== Helpers ====================

  private mapGoogleEventToLocal(gEvent: GoogleCalendarEvent): EditorialEvent {
    const startAt = gEvent.start.dateTime 
      ? new Date(gEvent.start.dateTime)
      : new Date(gEvent.start.date + 'T00:00:00');
    
    const endAt = gEvent.end.dateTime
      ? new Date(gEvent.end.dateTime)
      : new Date(gEvent.end.date + 'T23:59:59');

    const allDay = !gEvent.start.dateTime;

    return {
      id: `imported-${gEvent.id}`,
      type: 'user',
      title: gEvent.summary,
      status: 'pending',
      priority: 'medium',
      startAt,
      endAt,
      allDay,
      bookIds: [],
      tags: [],
      description: gEvent.description || '',
      checklistItems: [],
      reminders: [],
      origin: 'google',
      sourceType: 'google',
      googleEventId: gEvent.id,
      syncedAt: new Date(),
      conflictState: 'none',
      createdAt: new Date(),
      updatedAt: new Date(gEvent.updated),
    };
  }

  mapLocalEventToGoogle(event: EditorialEvent): Partial<GoogleCalendarEvent> {
    return {
      summary: event.title,
      description: event.description,
      start: event.allDay
        ? { date: event.startAt.toISOString().split('T')[0] }
        : { dateTime: event.startAt.toISOString() },
      end: event.allDay
        ? { date: event.endAt.toISOString().split('T')[0] }
        : { dateTime: event.endAt.toISOString() },
    };
  }

  // ==================== Logs ====================

  getSyncLogs(limit: number = 10): GoogleCalendarSyncLog[] {
    return this.syncLogs.slice(0, limit);
  }

  getLastSync(): Date | undefined {
    return this.connection.lastSyncAt;
  }

  // ==================== Mock Connect (for testing) ====================

  mockConnect(): void {
    const availableCalendars: GoogleCalendarInfo[] = this.mockCalendars.map(cal => ({
      id: cal.id,
      name: cal.summary,
      primary: cal.primary || false,
      color: cal.backgroundColor || '#4285f4',
      selected: cal.primary || false,
    }));

    this.connection = {
      isConnected: true,
      email: 'demo@gmail.com',
      accessToken: 'mock_token',
      selectedCalendars: ['primary'],
      availableCalendars,
      lastSyncAt: new Date(),
      syncEnabled: true,
    };
  }
}

// Export singleton instance
export const GoogleCalendarService = new GoogleCalendarServiceClass();
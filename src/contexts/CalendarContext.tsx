import { createContext, useContext, useState, ReactNode } from 'react';
import { EditorialEvent, CalendarFilters, CalendarViewMode } from '@/types/calendar';

interface CalendarContextType {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  viewMode: CalendarViewMode;
  setViewMode: (mode: CalendarViewMode) => void;
  selectedEvent: EditorialEvent | null;
  setSelectedEvent: (event: EditorialEvent | null) => void;
  isEventPanelOpen: boolean;
  setIsEventPanelOpen: (open: boolean) => void;
  isQuickCreateOpen: boolean;
  setIsQuickCreateOpen: (open: boolean) => void;
  quickCreateDate: Date | null;
  setQuickCreateDate: (date: Date | null) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [selectedEvent, setSelectedEvent] = useState<EditorialEvent | null>(null);
  const [isEventPanelOpen, setIsEventPanelOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [quickCreateDate, setQuickCreateDate] = useState<Date | null>(null);

  return (
    <CalendarContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        viewMode,
        setViewMode,
        selectedEvent,
        setSelectedEvent,
        isEventPanelOpen,
        setIsEventPanelOpen,
        isQuickCreateOpen,
        setIsQuickCreateOpen,
        quickCreateDate,
        setQuickCreateDate,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendarContext() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendarContext must be used within CalendarProvider');
  }
  return context;
}

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EditorialCalendar } from '@/components/calendar';
import { CalendarProvider, useCalendarContext } from '@/contexts/CalendarContext';

function CalendarPageContent() {
  const [searchParams] = useSearchParams();
  const { setIsQuickCreateOpen, setQuickCreateDate } = useCalendarContext();

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setQuickCreateDate(new Date());
      setIsQuickCreateOpen(true);
    }
  }, [searchParams, setIsQuickCreateOpen, setQuickCreateDate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <EditorialCalendar />
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <CalendarProvider>
      <CalendarPageContent />
    </CalendarProvider>
  );
}

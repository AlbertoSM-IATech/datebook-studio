import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout';
import { EditorialCalendar } from '@/components/calendar';
import { CalendarProvider, useCalendarContext } from '@/contexts/CalendarContext';

function CalendarPageContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setIsQuickCreateOpen, setQuickCreateDate } = useCalendarContext();

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setQuickCreateDate(new Date());
      setIsQuickCreateOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, setIsQuickCreateOpen, setQuickCreateDate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <EditorialCalendar />
      </main>
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

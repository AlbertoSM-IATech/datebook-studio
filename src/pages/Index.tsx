import { CalendarContent, UpcomingEventsBlock } from '@/components/calendar';
import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { startOfMonth, endOfMonth } from 'date-fns';
import { CalendarProvider } from '@/contexts/CalendarContext';

const Index = () => {
  const { events } = useEvents();
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  
  const eventsThisMonth = events.filter(
    e => e.startAt >= monthStart && e.startAt <= monthEnd
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-heading font-bold mb-2">Bienvenido a Publify</h2>
          <p className="text-muted-foreground">Tu centro de control editorial. Orden, foco y control.</p>
        </div>

        {/* Single CalendarProvider wrapping both calendar and upcoming events */}
        <CalendarProvider>
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Full Calendar Module (3 cols) */}
            <div className="lg:col-span-3">
              <Card className="overflow-visible">
                <CardHeader className="pb-2">
                  <CardTitle className="font-heading text-xl flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Calendario Editorial
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {/* Dynamic height container - adapts to content, no clipping */}
                  <div className="w-full">
                    <CalendarContent mode="embedded" initialView="month" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Stats & Upcoming Events (1 col) */}
            <div className="flex flex-col gap-6">
              {/* Events This Month Card */}
              <Card className="card-hover flex-shrink-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Eventos Este Mes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <span className="text-3xl font-heading font-bold">{eventsThisMonth}</span>
                      <p className="text-xs text-muted-foreground">eventos programados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events Block - Expands to fill remaining space */}
              <UpcomingEventsBlock 
                showActions={true} 
                className="flex-1 min-h-[400px]"
              />
            </div>
          </div>
        </CalendarProvider>
      </main>
    </div>
  );
};

export default Index;

import { EditorialCalendarModule, UpcomingEventsBlock } from '@/components/calendar';
import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BookOpen, Bell, Calendar } from 'lucide-react';
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
                <CalendarProvider>
                  {/* Dynamic height container - no fixed height, adapts to content */}
                  <div className="min-h-[500px]">
                    <EditorialCalendarModule mode="embedded" initialView="month" />
                  </div>
                </CalendarProvider>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Upcoming Events (1 col) */}
          <div className="space-y-6">
            {/* Events This Month Card */}
            <Card className="card-hover">
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

            {/* Activity Feed */}
            <Card className="card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: 'Lanzamiento programado', book: 'El Último Verano', time: 'En 5 días', icon: BookOpen },
                    { action: 'Nuevo review', book: 'Secretos del Mar', time: 'Hace 2 horas', icon: TrendingUp },
                    { action: 'Recordatorio activado', book: 'El Detective', time: 'Hace 1 día', icon: Bell },
                  ].map((activity, i) => {
                    const Icon = activity.icon;
                    return (
                      <div 
                        key={i} 
                        className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{activity.action}</p>
                          <p className="text-xs text-muted-foreground truncate">{activity.book}</p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events Block */}
            <CalendarProvider>
              <UpcomingEventsBlock maxEvents={5} showActions={true} />
            </CalendarProvider>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

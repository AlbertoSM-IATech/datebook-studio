import { CalendarWidget } from '@/components/calendar';
import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-heading font-bold mb-2">Bienvenido a Publify</h2>
          <p className="text-muted-foreground">Tu centro de control editorial. Orden, foco y control.</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Events This Month Card */}
            <Card className="card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Eventos Este Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="h-8 w-8 text-accent" />
                  <span className="text-3xl font-heading font-bold">12</span>
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="font-heading">Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'Lanzamiento programado', book: 'El Último Verano', time: 'En 5 días' },
                    { action: 'Nuevo review', book: 'Secretos del Mar', time: 'Hace 2 horas' },
                    { action: 'Campaña AMS iniciada', book: 'El Detective', time: 'Hace 1 día' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.book}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Calendar Widget */}
          <div className="space-y-6">
            <CalendarWidget />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

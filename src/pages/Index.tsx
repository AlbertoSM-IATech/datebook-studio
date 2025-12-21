import { CalendarWidget } from '@/components/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, TrendingUp, Users } from 'lucide-react';
const Index = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl">Publify</h1>
              <p className="text-xs text-muted-foreground">Sistema Operativo Editorial</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            
            <Button variant="ghost" onClick={() => navigate('/calendario')} className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendario
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-heading font-bold mb-2">Bienvenido a Publify</h2>
          <p className="text-muted-foreground">Tu centro de control editorial. Orden, foco y control.</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="card-hover">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Libros Activos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-8 w-8 text-primary" />
                    <span className="text-3xl font-heading font-bold">8</span>
                  </div>
                </CardContent>
              </Card>

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

              <Card className="card-hover">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ventas Hoy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <span className="text-3xl font-heading font-bold">€247</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Placeholder Cards */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="font-heading">Rendimiento de Libros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">Gráfico de ventas por libro</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="font-heading">Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[{
                  action: 'Lanzamiento programado',
                  book: 'El Último Verano',
                  time: 'En 5 días'
                }, {
                  action: 'Nuevo review',
                  book: 'Secretos del Mar',
                  time: 'Hace 2 horas'
                }, {
                  action: 'Campaña AMS iniciada',
                  book: 'El Detective',
                  time: 'Hace 1 día'
                }].map((activity, i) => <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.book}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Calendar Widget */}
          <div className="space-y-6">
            <CalendarWidget />

            {/* Quick Actions */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BookOpen className="h-4 w-4" />
                  Añadir nuevo libro
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Ver analytics
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="h-4 w-4" />
                  Gestionar lista de correo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>;
};
export default Index;
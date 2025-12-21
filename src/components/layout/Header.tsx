import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Calendar, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from '@/contexts/ThemeContext';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
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
        
        <nav className="flex items-center gap-2">
          <Button
            variant={isActive('/') ? 'default' : 'ghost'}
            onClick={() => navigate('/')}
            aria-label="Ir al Dashboard"
          >
            Dashboard
          </Button>
          <Button
            variant={isActive('/calendario') ? 'default' : 'ghost'}
            onClick={() => navigate('/calendario')}
            className="gap-2"
            aria-label="Ir al Calendario"
          >
            <Calendar className="h-4 w-4" />
            Calendario
          </Button>
          
          <div className="w-px h-6 bg-border mx-2" />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            </TooltipContent>
          </Tooltip>
        </nav>
      </div>
    </header>
  );
}

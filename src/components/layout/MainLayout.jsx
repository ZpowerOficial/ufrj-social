import React from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Bell, Home, Menu, MessageSquare, Search, Users, Calendar, Sun, Moon, PlusCircle } from 'lucide-react';

// Componentes de UI
import { Avatar, AvatarImage, AvatarFallback } from '../ui/Avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function MainLayout() {
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link to="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="rounded-lg bg-primary p-1.5">
                <div className="h-6 w-6 text-primary-foreground font-bold flex items-center justify-center">H</div>
              </div>
              <span className="hidden font-bold text-xl md:inline-block tracking-tight">UFRJ Hub</span>
            </Link>
          </div>
          <div className="hidden md:flex md:w-1/3">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar no UFRJ Hub..."
                className="w-full pl-8 rounded-full bg-muted/50 hover:bg-muted focus:bg-background"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/search" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
              <Search className="h-5 w-5 md:hidden" />
              <span className="sr-only">Pesquisar</span>
            </Link>
            {user && (
              <>
                <Link to="/notifications" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notificações</span>
                </Link>
                <Link to="/messages" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
                  <MessageSquare className="h-5 w-5" />
                  <span className="sr-only">Mensagens</span>
                </Link>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <span className="sr-only">Alternar tema</span>
            </Button>
            {user ? (
              <div className="relative profile-dropdown-trigger">
                <Button variant="ghost" className="gap-2 p-1 hover:bg-accent">
                  <Avatar>
                    <AvatarImage 
                      src={profile?.avatar_url} 
                      alt={profile?.display_name || "Usuário"} 
                    />
                    <AvatarFallback name={profile?.display_name || user.email}>
                    </AvatarFallback>
                  </Avatar>
                </Button>
                <div className="absolute right-0 mt-2 w-56 bg-card rounded-lg border shadow-lg overflow-hidden z-20 profile-dropdown">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium">{profile?.display_name || 'Usuário'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" className="flex items-center px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground">
                      Perfil
                    </Link>
                    <Link to="/settings" className="flex items-center px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground">
                      Configurações
                    </Link>
                    <div className="border-t my-1"></div>
                    <button 
                      onClick={handleSignOut}
                      className="flex w-full items-center px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                  Login
                </Link>
                <Link to="/register" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-6 py-6">
        {/* Barra lateral esquerda */}
        <div className="hidden md:flex flex-col gap-4">
          <nav className="grid gap-1">
            <Link to="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-full justify-start gap-2 px-3">
              <Home className="h-5 w-5" />
              Página Inicial
            </Link>
            <Link to="/communities" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-full justify-start gap-2 px-3">
              <Users className="h-5 w-5" />
              Comunidades
            </Link>
            <Link to="/events" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-full justify-start gap-2 px-3">
              <Calendar className="h-5 w-5" />
              Eventos
            </Link>
          </nav>
          
          {user && (
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between px-4 mb-2">
                <h3 className="text-lg font-semibold">Suas Comunidades</h3>
                <Link to="/communities/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
                  <PlusCircle className="h-5 w-5" />
                  <span className="sr-only">Criar Comunidade</span>
                </Link>
              </div>
              <div className="grid gap-1">
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Você ainda não participa de nenhuma comunidade</p>
                  <Link to="/communities" className="inline-flex items-center justify-center text-sm font-medium text-primary hover:underline mt-2">
                    Explorar Comunidades
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {!user && (
            <div className="mt-4 border-t pt-4">
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Faça login para ver suas comunidades</p>
                <Link to="/login" className="inline-flex items-center justify-center text-sm font-medium text-primary hover:underline mt-2">
                  Entrar
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Conteúdo principal */}
        <main className="md:col-span-2">
          <Outlet />
        </main>
        
        {/* Barra lateral direita */}
        <div className="hidden md:flex flex-col gap-4">
          <div className="bg-card rounded-lg border shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Próximos Eventos</h2>
              {user && (
                <Link to="/events/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
                  <PlusCircle className="h-5 w-5" />
                  <span className="sr-only">Criar Evento</span>
                </Link>
              )}
            </div>
            {user ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Nenhum evento programado</p>
                <Link to="/events" className="inline-flex items-center justify-center text-sm font-medium text-primary hover:underline mt-2">
                  Ver Eventos
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Faça login para ver eventos</p>
                <Link to="/login" className="inline-flex items-center justify-center text-sm font-medium text-primary hover:underline mt-2">
                  Entrar
                </Link>
              </div>
            )}
          </div>
          
          {!user && (
            <div className="bg-card rounded-lg border shadow-sm p-4">
              <h2 className="font-semibold text-lg mb-2">Junte-se ao UFRJ Hub</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Conecte-se com a comunidade acadêmica da UFRJ.
              </p>
              <Link to="/register" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                Criar Conta
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile navigation bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
        <div className="container flex items-center justify-between py-2">
          <Link to="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
            <Home className="h-5 w-5" />
            <span className="sr-only">Página Inicial</span>
          </Link>
          <Link to="/communities" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
            <Users className="h-5 w-5" />
            <span className="sr-only">Comunidades</span>
          </Link>
          <Link to="/events" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
            <Calendar className="h-5 w-5" />
            <span className="sr-only">Eventos</span>
          </Link>
          {user ? (
            <Link to="/profile" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
              <Avatar className="h-6 w-6">
                <AvatarImage 
                  src={profile?.avatar_url} 
                  alt={profile?.display_name || "Usuário"} 
                />
                <AvatarFallback name={profile?.display_name || user?.email}>
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Perfil</span>
            </Link>
          ) : (
            <Link to="/login" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
              <Avatar className="h-6 w-6">
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              <span className="sr-only">Login</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
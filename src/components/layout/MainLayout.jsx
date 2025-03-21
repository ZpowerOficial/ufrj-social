import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Home, Menu, MessageSquare, Search, Users, Calendar } from 'lucide-react';

// Componentes de UI
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function MainLayout({ children }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <div className="rounded-full bg-primary p-1">
                <div className="h-6 w-6 text-white font-bold flex items-center justify-center">U</div>
              </div>
              <span className="hidden font-bold text-xl md:inline-block">UFRJ Social</span>
            </Link>
          </div>
          <div className="hidden md:flex md:w-1/3">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar..."
                className="w-full pl-8 rounded-full bg-muted"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/search">
                <Search className="h-5 w-5 md:hidden" />
                <span className="sr-only">Pesquisar</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/notifications">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notificações</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/messages">
                <MessageSquare className="h-5 w-5" />
                <span className="sr-only">Mensagens</span>
              </Link>
            </Button>
            {user ? (
              <div className="relative group">
                <Button variant="ghost" className="gap-2 p-0">
                  <Avatar>
                    <AvatarImage 
                      src={profile?.avatar_url} 
                      alt={profile?.display_name || "Usuário"} 
                    />
                    <AvatarFallback>
                      {profile?.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block">
                  <div className="py-1">
                    <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground">Perfil</Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground">Configurações</Link>
                    <button 
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Cadastrar</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-6 py-6">
        {/* Barra lateral esquerda */}
        <div className="hidden md:flex flex-col gap-4">
          <nav className="grid gap-2">
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link to="/">
                <Home className="h-5 w-5" />
                Página Inicial
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link to="/communities">
                <Users className="h-5 w-5" />
                Comunidades
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link to="/events">
                <Calendar className="h-5 w-5" />
                Eventos
              </Link>
            </Button>
          </nav>
          
          <div className="mt-4 border-t pt-4">
            <h3 className="mb-2 text-lg font-semibold">Comunidades Populares</h3>
            <div className="grid gap-2">
              <Button variant="ghost" className="justify-start" asChild>
                <Link to="/community/geral">r/Geral UFRJ</Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link to="/community/computacao">r/Computação</Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link to="/community/engenharia">r/Engenharia</Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link to="/communities">Ver todas</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Conteúdo principal */}
        <div className="md:col-span-2">
          {children}
        </div>
        
        {/* Barra lateral direita */}
        <div className="hidden md:flex flex-col gap-4">
          <div className="bg-card rounded-lg border shadow-sm p-4">
            <h2 className="font-semibold text-lg mb-2">Próximos Eventos</h2>
            <div className="space-y-4">
              <div className="grid gap-1">
                <h4 className="font-medium">Palestra: IA na Medicina</h4>
                <p className="text-sm text-muted-foreground">Amanhã, 15:00 - Auditório Central</p>
              </div>
              <div className="grid gap-1">
                <h4 className="font-medium">Hackathon de Sustentabilidade</h4>
                <p className="text-sm text-muted-foreground">Sábado, 09:00 - Centro de Tecnologia</p>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/events">Ver todos os eventos</Link>
              </Button>
            </div>
          </div>
          
          {!user && (
            <div className="bg-card rounded-lg border shadow-sm p-4">
              <h2 className="font-semibold text-lg mb-2">Junte-se à UFRJ Social</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Crie uma conta para participar da comunidade.
              </p>
              <Button className="w-full" asChild>
                <Link to="/register">Criar Conta</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile navigation bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-40">
        <div className="container flex items-center justify-between py-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <Home className="h-5 w-5" />
              <span className="sr-only">Página Inicial</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/communities">
              <Users className="h-5 w-5" />
              <span className="sr-only">Comunidades</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/events">
              <Calendar className="h-5 w-5" />
              <span className="sr-only">Eventos</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/profile">
              <Avatar className="h-6 w-6">
                <AvatarImage 
                  src={profile?.avatar_url} 
                  alt={profile?.display_name || "Usuário"} 
                />
                <AvatarFallback>
                  {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Perfil</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
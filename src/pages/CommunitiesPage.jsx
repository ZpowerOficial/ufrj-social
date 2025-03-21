import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users } from 'lucide-react';

// Componentes
import MainLayout from '../components/layout/MainLayout';

// Componentes de UI
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

// Adicionar importação de serviços
import { getCommunities } from '../lib/api';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCommunities();
  }, []);

  async function fetchCommunities() {
    setLoading(true);
    try {
      const allCommunities = await getCommunities();
      setCommunities(allCommunities);
      
      // Filtrar comunidades do usuário (se estiver logado)
      // Esta lógica dependeria da sua implementação de autenticação
      const userComms = allCommunities.filter(c => c.isMember);
      setUserCommunities(userComms);
    } catch (error) {
      console.error('Erro ao buscar comunidades:', error);
      setError('Não foi possível carregar as comunidades. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }

  // Filtrar comunidades com base na pesquisa
  const filteredCommunities = communities.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (community.description && community.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Comunidades</h1>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Pesquisar comunidades..." 
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="minhas">Minhas Comunidades</TabsTrigger>
            <TabsTrigger value="recomendadas">Recomendadas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="todas" className="mt-6">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <CommunityCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="bg-destructive/15 text-destructive rounded-md p-4 text-center">
                <p>{error}</p>
                <Button variant="outline" className="mt-2" onClick={fetchCommunities}>
                  Tentar novamente
                </Button>
              </div>
            ) : filteredCommunities.length === 0 ? (
              <div className="bg-card rounded-lg border shadow-sm p-8 text-center">
                <h3 className="text-lg font-medium">Nenhuma comunidade encontrada</h3>
                <p className="text-muted-foreground mt-2">
                  Tente pesquisar outro termo ou crie uma nova comunidade
                </p>
                <Button className="mt-4" asChild>
                  <Link to="/communities/new">Criar Comunidade</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCommunities.map(community => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="minhas" className="mt-6">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2].map(i => (
                  <CommunityCardSkeleton key={i} />
                ))}
              </div>
            ) : userCommunities.length === 0 ? (
              <div className="bg-card rounded-lg border shadow-sm p-8 text-center">
                <h3 className="text-lg font-medium">Você ainda não participa de nenhuma comunidade</h3>
                <p className="text-muted-foreground mt-2">
                  Explore as comunidades disponíveis ou crie a sua própria
                </p>
                <div className="mt-4 flex justify-center gap-4">
                  <Button variant="outline" asChild>
                    <Link to="/communities?tab=todas">Explorar Comunidades</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/communities/new">Criar Comunidade</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userCommunities.map(community => (
                  <CommunityCard key={community.id} community={community} isMember={true} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recomendadas" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Lógica para exibir comunidades recomendadas poderia ser adicionada aqui */}
              {filteredCommunities.slice(0, 3).map(community => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

function CommunityCard({ community, isMember = false }) {
  // Função para gerar cores de fundo baseadas no nome da comunidade
  const getColorFromName = (name) => {
    const colors = ['bg-blue-600', 'bg-red-600', 'bg-green-600', 'bg-purple-600', 'bg-amber-600'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const bgColor = getColorFromName(community.name);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={community.icon} alt={community.name} />
          <AvatarFallback className={`${bgColor} text-white`}>
            {community.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{community.name}</CardTitle>
          <CardDescription>{community.memberCount || 0} membros</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {community.description}
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full gap-2" variant={isMember ? "outline" : "default"}>
          <Users className="h-4 w-4" />
          {isMember ? 'Participando' : 'Participar'}
        </Button>
      </CardFooter>
    </Card>
  );
}

function CommunityCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-3 w-16 bg-muted animate-pulse rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-3 w-full bg-muted animate-pulse rounded" />
          <div className="h-3 w-full bg-muted animate-pulse rounded" />
          <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="h-9 w-full bg-muted animate-pulse rounded" />
      </CardFooter>
    </Card>
  );
}
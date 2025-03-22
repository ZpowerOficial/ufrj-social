import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Users, PlusCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getCommunities, joinCommunity, leaveCommunity } from '../lib/api.js';
import { toast } from '../components/ui/use-toast';

// Componentes de UI
import { Input } from '../components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';

export default function CommunitiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [membershipLoading, setMembershipLoading] = useState({});
  const [activeTab, setActiveTab] = useState('todas');

  useEffect(() => {
    fetchCommunities();
  }, [user]);

  async function fetchCommunities() {
    setLoading(true);
    setError(null);
    try {
      const allCommunities = await getCommunities();
      setCommunities(allCommunities);
      
      if (user) {
        const userComms = allCommunities.filter(c => 
          c.community_members?.some(m => m.user_id === user.id)
        );
        setUserCommunities(userComms);
      } else {
        setUserCommunities([]);
      }
    } catch (error) {
      console.error('Erro ao buscar comunidades:', error);
      setError('Não foi possível carregar as comunidades. Tente novamente mais tarde.');
      toast({
        title: "Erro",
        description: "Não foi possível carregar as comunidades",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const handleJoinCommunity = async (communityId) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para participar de comunidades.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    setMembershipLoading(prev => ({ ...prev, [communityId]: true }));
    try {
      const success = await joinCommunity(communityId);
      if (success) {
        toast({
          title: "Sucesso!",
          description: "Você agora faz parte desta comunidade."
        });
        // Atualizar a lista localmente para feedback instantâneo
        const community = communities.find(c => c.id === communityId);
        if (community) {
          setUserCommunities(prev => [...prev, community]);
        }
      } else {
        throw new Error("Não foi possível entrar na comunidade");
      }
    } catch (error) {
      console.error("Erro ao entrar na comunidade:", error);
      toast({
        title: "Erro",
        description: "Não foi possível entrar na comunidade. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setMembershipLoading(prev => ({ ...prev, [communityId]: false }));
    }
  };

  const handleLeaveCommunity = async (communityId) => {
    setMembershipLoading(prev => ({ ...prev, [communityId]: true }));
    try {
      const success = await leaveCommunity(communityId);
      if (success) {
        toast({
          title: "Sucesso!",
          description: "Você saiu desta comunidade."
        });
        // Atualizar a lista localmente para feedback instantâneo
        setUserCommunities(prev => prev.filter(c => c.id !== communityId));
      } else {
        throw new Error("Não foi possível sair da comunidade");
      }
    } catch (error) {
      console.error("Erro ao sair da comunidade:", error);
      toast({
        title: "Erro",
        description: "Não foi possível sair da comunidade. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setMembershipLoading(prev => ({ ...prev, [communityId]: false }));
    }
  };

  // Filtrar comunidades com base na pesquisa
  const filteredCommunities = communities.filter(community => 
    community.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (community.description && community.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getRecommendedCommunities = () => {
    return communities
      .filter(c => !userCommunities.some(uc => uc.id === c.id))
      .slice(0, 6);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Comunidades</h1>
        {user && (
          <Button asChild>
            <Link to="/communities/new" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Nova Comunidade
            </Link>
          </Button>
        )}
      </div>
      
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="minhas" disabled={!user}>
            Minhas Comunidades
            {userCommunities.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {userCommunities.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="recomendadas">Recomendadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="todas" className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array(6).fill(0).map((_, i) => (
                <CommunityCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Erro</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={fetchCommunities}>
                  Tentar novamente
                </Button>
              </CardFooter>
            </Card>
          ) : filteredCommunities.length === 0 ? (
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Nenhuma comunidade encontrada</CardTitle>
                <CardDescription>
                  Tente pesquisar outro termo ou crie uma nova comunidade
                </CardDescription>
              </CardHeader>
              {user && (
                <CardFooter className="flex justify-center">
                  <Button asChild>
                    <Link to="/communities/new">Criar Comunidade</Link>
                  </Button>
                </CardFooter>
              )}
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCommunities.map(community => (
                <CommunityCard 
                  key={community.id} 
                  community={community}
                  isMember={userCommunities.some(c => c.id === community.id)}
                  onJoin={() => handleJoinCommunity(community.id)}
                  onLeave={() => handleLeaveCommunity(community.id)}
                  isLoading={membershipLoading[community.id]}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="minhas" className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array(2).fill(0).map((_, i) => (
                <CommunityCardSkeleton key={i} />
              ))}
            </div>
          ) : !user ? (
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Faça login para ver suas comunidades</CardTitle>
                <CardDescription>
                  Entre na sua conta para participar das comunidades
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <Button asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : userCommunities.length === 0 ? (
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Você ainda não participa de nenhuma comunidade</CardTitle>
                <CardDescription>
                  Explore as comunidades disponíveis ou crie a sua própria
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => setActiveTab("todas")}>
                  Explorar Comunidades
                </Button>
                <Button asChild>
                  <Link to="/communities/new">Criar Comunidade</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userCommunities.map(community => (
                <CommunityCard 
                  key={community.id} 
                  community={community} 
                  isMember={true}
                  onLeave={() => handleLeaveCommunity(community.id)}
                  isLoading={membershipLoading[community.id]}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recomendadas" className="mt-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array(3).fill(0).map((_, i) => (
                <CommunityCardSkeleton key={i} />
              ))}
            </div>
          ) : getRecommendedCommunities().length === 0 ? (
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Nenhuma recomendação disponível</CardTitle>
                <CardDescription>
                  {user ? 
                    "Você já participa de todas as comunidades!" : 
                    "Faça login para ver recomendações personalizadas"}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                {!user ? (
                  <Button asChild>
                    <Link to="/login">Entrar</Link>
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setActiveTab("todas")}>
                    Ver Todas Comunidades
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getRecommendedCommunities().map(community => (
                <CommunityCard 
                  key={community.id} 
                  community={community}
                  onJoin={() => handleJoinCommunity(community.id)}
                  isLoading={membershipLoading[community.id]}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CommunityCard({ community, isMember = false, onJoin, onLeave, isLoading }) {
  const getColorFromName = (name) => {
    const colors = ['bg-blue-600', 'bg-red-600', 'bg-green-600', 'bg-purple-600', 'bg-amber-600', 'bg-indigo-600', 'bg-pink-600', 'bg-teal-600'];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  const bgColor = getColorFromName(community?.name);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-12 w-12">
          <AvatarImage src={community?.icon_url} alt={community?.name} />
          <AvatarFallback className={`${bgColor} text-white`}>
            {community?.name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-xl">{community?.name}</CardTitle>
          <CardDescription>{community?.member_count || 0} membros</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {community?.description || "Sem descrição disponível."}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          className="flex-1 gap-2" 
          variant={isMember ? "outline" : "default"}
          onClick={isMember ? onLeave : onJoin}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isMember ? "Saindo..." : "Entrando..."}
            </>
          ) : (
            <>
              <Users className="h-4 w-4" />
              {isMember ? "Participando" : "Participar"}
            </>
          )}
        </Button>
        <Button variant="secondary" asChild className="gap-2">
          <Link to={`/communities/${community?.id}`}>
            Ver
          </Link>
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
          <div className="h-5 w-24 bg-muted animate-pulse rounded" />
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
      </CardFooter>
    </Card>
  );
}
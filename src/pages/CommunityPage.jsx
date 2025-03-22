import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Skeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/use-toast';
import { Users, Calendar, MessageSquare, FileText, Loader2, InfoIcon, Bell, BellOff, RefreshCw, Settings, PlusCircle } from 'lucide-react';
import PostCard from '../components/posts/PostCard';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getCommunity, joinCommunity, leaveCommunity, getCommunityPosts } from '../lib/api.js';

export default function CommunityPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [refreshing, setRefreshing] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  useEffect(() => {
    fetchCommunity();
  }, [slug]);
  
  useEffect(() => {
    if (community) {
      fetchCommunityPosts();
      
      // Verificar se o usuário é membro
      if (user) {
        const isMember = community.community_members?.some(m => m.user_id === user.id);
        setIsSubscribed(isMember);
      }
    }
  }, [community, user]);
  
  const fetchCommunity = async () => {
    setLoading(true);
    setError(null);
    try {
      const communityData = await getCommunity(slug);
      setCommunity(communityData);
    } catch (err) {
      console.error('Erro ao buscar comunidade:', err);
      setError('Não foi possível carregar a comunidade. Tente novamente mais tarde.');
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da comunidade",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCommunityPosts = async () => {
    if (!community?.id) return;
    
    setPostsLoading(true);
    try {
      const postsData = await getCommunityPosts(community.id);
      setPosts(postsData);
    } catch (err) {
      console.error('Erro ao buscar posts da comunidade:', err);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as postagens",
        variant: "destructive"
      });
    } finally {
      setPostsLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCommunityPosts();
      toast({
        title: "Atualizado",
        description: "Postagens atualizadas com sucesso"
      });
    } catch (err) {
      console.error('Erro ao atualizar posts:', err);
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleJoinCommunity = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para participar da comunidade",
        variant: "destructive"
      });
      return;
    }
    
    setMembershipLoading(true);
    try {
      const success = await joinCommunity(community.id);
      if (success) {
        setIsSubscribed(true);
        toast({
          title: "Sucesso!",
          description: "Você agora faz parte desta comunidade"
        });
      }
    } catch (err) {
      console.error('Erro ao entrar na comunidade:', err);
      toast({
        title: "Erro",
        description: "Não foi possível entrar na comunidade",
        variant: "destructive"
      });
    } finally {
      setMembershipLoading(false);
    }
  };
  
  const handleLeaveCommunity = async () => {
    setMembershipLoading(true);
    try {
      const success = await leaveCommunity(community.id);
      if (success) {
        setIsSubscribed(false);
        toast({
          title: "Sucesso!",
          description: "Você saiu desta comunidade"
        });
      }
    } catch (err) {
      console.error('Erro ao sair da comunidade:', err);
      toast({
        title: "Erro",
        description: "Não foi possível sair da comunidade",
        variant: "destructive"
      });
    } finally {
      setMembershipLoading(false);
    }
  };
  
  if (loading) {
    return <CommunityPageSkeleton />;
  }
  
  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button 
              onClick={fetchCommunity} 
              className="mt-4"
              variant="outline"
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!community) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Comunidade não encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <p>A comunidade que você está procurando não existe ou foi removida.</p>
            <Link to="/communities">
              <Button className="mt-4">Ver todas as comunidades</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Cabeçalho da Comunidade */}
      <Card className="border-b">
        <div className="relative h-[120px] overflow-hidden rounded-t-lg">
          <div className="absolute inset-0">
            <div className="h-full w-full bg-gradient-to-r from-primary/80 to-primary/40" />
          </div>
        </div>
        
        <CardHeader className="pt-8 px-6 flex flex-row items-start justify-between">
          <div className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16 border-4 border-background -mt-12">
              <AvatarImage src={community.icon_url} alt={community.name} />
              <AvatarFallback className="text-xl">
                {community.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{community.name}</CardTitle>
              <CardDescription className="flex flex-wrap gap-2 items-center mt-1">
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>{community.member_count || 0} membros</span>
                </div>
                <span>•</span>
                <span className="text-xs">
                  Criada {formatDistanceToNow(new Date(community.created_at), { addSuffix: true, locale: ptBR })}
                </span>
              </CardDescription>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isSubscribed ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLeaveCommunity}
                disabled={membershipLoading}
                className="gap-2"
              >
                {membershipLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
                Sair
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleJoinCommunity}
                disabled={membershipLoading}
                className="gap-2"
              >
                {membershipLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
                Participar
              </Button>
            )}
            
            {community.is_admin && (
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <Link to={`/communities/${slug}/edit`}>
                  <Settings className="h-4 w-4" />
                  Gerenciar
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="px-6 pb-4">
          <p className="text-muted-foreground">
            {community.description || "Sem descrição disponível"}
          </p>
        </CardContent>
        
        <CardFooter className="px-6 py-4 border-t flex justify-between">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <FileText className="h-3.5 w-3.5" />
                <span>{posts.length || 0}</span>
              </Badge>
              <span className="text-xs text-muted-foreground">Posts</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{community.comment_count || 0}</span>
              </Badge>
              <span className="text-xs text-muted-foreground">Comentários</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{community.post_today_count || 0}</span>
              </Badge>
              <span className="text-xs text-muted-foreground">Hoje</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            
            {isSubscribed && (
              <Button variant="default" size="sm" className="gap-1" asChild>
                <Link to={`/communities/${slug}/post/new`}>
                  <PlusCircle className="h-4 w-4" />
                  Novo Post
                </Link>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      
      {/* Conteúdo Principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts" className="gap-2">
            <FileText className="h-4 w-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="about" className="gap-2">
            <InfoIcon className="h-4 w-4" />
            Sobre
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-4">
          {postsLoading ? (
            <PostsSkeleton />
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardHeader className="text-center pb-2">
                <CardTitle>Nenhuma publicação ainda</CardTitle>
                <CardDescription>Seja o primeiro a postar nesta comunidade</CardDescription>
              </CardHeader>
              {isSubscribed && (
                <CardFooter className="flex justify-center pt-2">
                  <Button asChild>
                    <Link to={`/communities/${slug}/post/new`}>Criar Post</Link>
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>Sobre {community.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Descrição</h3>
                <p className="text-muted-foreground">
                  {community.description || "Sem descrição disponível"}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Informações</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Criada em: {new Date(community.created_at).toLocaleDateString('pt-BR')}</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{community.member_count || 0} membros</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-1">Administradores</h3>
                <div className="flex flex-wrap gap-2">
                  {community.admins?.map(admin => (
                    <Link key={admin.id} to={`/profile/${admin.username}`}>
                      <Badge variant="secondary" className="cursor-pointer">
                        {admin.display_name || admin.username}
                      </Badge>
                    </Link>
                  )) || (
                    <Badge variant="outline">Sem informações de administradores</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CommunityPageSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-b">
        <div className="h-[120px] bg-muted rounded-t-lg" />
        <CardHeader className="pt-8 px-6 flex flex-row items-start justify-between">
          <div className="flex flex-row items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full -mt-12" />
            <div>
              <Skeleton className="h-7 w-[200px]" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[120px]" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5 mt-2" />
        </CardContent>
        <CardFooter className="px-6 py-4 border-t flex justify-between">
          <div className="flex gap-6">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-6 w-24" />
            ))}
          </div>
          <Skeleton className="h-9 w-28" />
        </CardFooter>
      </Card>
      
      <Skeleton className="h-10 w-[200px]" />
      
      <PostsSkeleton />
    </div>
  );
}

function PostsSkeleton() {
  return (
    <div className="space-y-4">
      {Array(2).fill(0).map((_, i) => (
        <Card key={i} className="space-y-3 p-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
          </div>
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-20 w-full" />
          <div className="flex pt-2">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md ml-2" />
          </div>
        </Card>
      ))}
    </div>
  );
}
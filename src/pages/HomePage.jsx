import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/use-toast';
import PostCard from '../components/posts/PostCard';
import { getPosts, getUserJoinedCommunities } from '../lib/api.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/Avatar';
import { Loader } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('recent');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);

  useEffect(() => {
    fetchPosts();
    fetchCommunities();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Se estiver apenas atualizando, mantenha os dados atuais visíveis
      if (!refreshing) {
        setPosts([]);
      }
      
      const data = await getPosts({
        limit: 20,
        sort: activeTab === 'popular' ? 'votes' : 'recent',
        following: activeTab === 'following'
      });
      
      setPosts(data || []);
    } catch (err) {
      console.error('Erro ao carregar posts:', err);
      setError('Não foi possível carregar os posts. Tente novamente mais tarde.');
      toast({
        title: "Erro ao carregar posts",
        description: "Verifique sua conexão e tente novamente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setLoading(true);
    setError(null);
    
    // Atraso mínimo para melhor feedback visual
    setTimeout(() => {
      fetchPosts();
    }, 300);
  };

  const filteredPosts = () => {
    switch (activeTab) {
      case 'popular':
        return [...posts].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      case 'following':
        return posts.filter(post => post.community?.is_following);
      default:
        return [...posts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  };

  const fetchCommunities = async () => {
    if (user) {
      try {
        setLoadingCommunities(true);
        const userCommunities = await getUserJoinedCommunities(user.id);
        setCommunities(userCommunities);
      } catch (error) {
        console.error("Erro ao carregar comunidades:", error);
      } finally {
        setLoadingCommunities(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Feed</h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRefresh}
                disabled={loading}
                title="Atualizar posts"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="sr-only">Atualizar</span>
              </Button>
              
              {user && (
                <Button asChild className="gap-2">
                  <Link to="/posts/new">
                    <span className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Novo Post
                    </span>
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-md">
            <Button
              variant={activeTab === "recent" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleTabChange("recent")}
              className="flex-1"
            >
              Recentes
            </Button>
            <Button
              variant={activeTab === "popular" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleTabChange("popular")}
              className="flex-1"
            >
              Populares
            </Button>
            {user && (
              <Button
                variant={activeTab === "following" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTabChange("following")}
                className="flex-1"
              >
                Seguindo
              </Button>
            )}
          </div>

          {renderContent()}
        </div>

        <div className="md:w-1/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Comunidades</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCommunities ? (
                <div className="flex justify-center py-4">
                  <Loader className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : communities.length > 0 ? (
                <div className="space-y-3">
                  {communities.slice(0, 5).map((community) => (
                    <div 
                      key={community.id} 
                      className="flex items-center gap-3 cursor-pointer hover:bg-muted p-2 rounded-md"
                      onClick={() => navigate(`/community/${community.slug}`)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{community.name}</p>
                      </div>
                    </div>
                  ))}
                  {communities.length > 5 && (
                    <Button 
                      variant="link" 
                      className="w-full text-xs text-muted-foreground"
                      onClick={() => navigate('/communities')}
                    >
                      Ver todas ({communities.length})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Você ainda não participa de nenhuma comunidade
                  </p>
                  <Button 
                    size="sm"
                    onClick={() => navigate('/communities')}
                  >
                    Explorar comunidades
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  function renderContent() {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-10">
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            Tentar Novamente
          </Button>
        </div>
      );
    }

    const filtered = filteredPosts();

    if (filtered.length === 0) {
      if (activeTab === 'following' && !user) {
        return (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground mb-4">Faça login para ver posts das comunidades que você segue</p>
            <Button asChild>
              <Link to="/login">Entrar</Link>
            </Button>
          </div>
        );
      }

      return (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground mb-4">
            {activeTab === 'following'
              ? 'Você ainda não segue nenhuma comunidade'
              : 'Nenhum post encontrado'}
          </p>
          <div className="flex justify-center gap-2">
            {user ? (
              <>
                {activeTab === 'following' ? (
                  <Button variant="outline" asChild>
                    <Link to="/communities">
                      Explorar Comunidades
                    </Link>
                  </Button>
                ) : null}
                <Button asChild>
                  <Link to="/posts/new">
                    <span className="flex items-center">
                      Criar Primeiro Post
                    </span>
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/login">
                    <span className="flex items-center">
                      Entrar
                    </span>
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/register">
                    <span className="flex items-center">
                      Criar Conta
                    </span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      );
    }

    return filtered.map(post => (
      <PostCard key={post.id} post={post} />
    ));
  }
}
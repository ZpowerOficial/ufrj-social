import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/use-toast';
import PostCard from '../components/posts/PostCard';
import { getPosts } from '../lib/api.js';

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('recent');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
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

  return (
    <div className="space-y-4">
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

      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange} 
        className="space-y-4"
      >
        <div className="border-b">
          <TabsList className="w-full justify-start rounded-none bg-transparent p-0">
            <TabsTrigger
              value="recent"
              className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              Recentes
            </TabsTrigger>
            <TabsTrigger
              value="popular"
              className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              Populares
            </TabsTrigger>
            {user && (
              <TabsTrigger
                value="following"
                className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                Seguindo
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="recent" className="space-y-4 min-h-[200px]">
          {renderContent()}
        </TabsContent>
        <TabsContent value="popular" className="space-y-4 min-h-[200px]">
          {renderContent()}
        </TabsContent>
        {user && (
          <TabsContent value="following" className="space-y-4 min-h-[200px]">
            {renderContent()}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );

  function renderContent() {
    if (loading) {
      return Array(3).fill(0).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex pt-4">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full ml-2" />
          </div>
        </div>
      ));
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
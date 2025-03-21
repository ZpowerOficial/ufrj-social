import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus } from 'lucide-react';

// Componentes
import MainLayout from '../components/layout/MainLayout';
import PostCard from '../components/posts/PostCard';

// Componentes de UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';

// Serviços
import { getPosts } from '../lib/api';

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState('recentes');

  useEffect(() => {
    fetchPosts(currentTab);
  }, [currentTab]);

  async function fetchPosts(tab) {
    setLoading(true);
    try {
      let options = { limit: 10 };
      
      if (tab === 'populares') {
        // Ordenar por popularidade/engajamento
        options.sort = 'popularity';
      } else if (tab === 'seguindo') {
        // Apenas posts de comunidades/pessoas que o usuário segue
        options.following = true;
      }
      
      const fetchedPosts = await getPosts(options);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      setError('Não foi possível carregar os posts. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        {user && (
          <div className="bg-card rounded-lg border shadow-sm p-4 flex justify-center">
            <Button asChild className="w-full gap-2">
              <Link to="/new-post">
                <Plus className="h-4 w-4" />
                Criar Nova Publicação
              </Link>
            </Button>
          </div>
        )}
        
        <Tabs defaultValue="recentes" onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recentes">Recentes</TabsTrigger>
            <TabsTrigger value="populares">Populares</TabsTrigger>
            <TabsTrigger value="seguindo">Seguindo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recentes" className="mt-4 space-y-4">
            {loading ? (
              <PostsLoading />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : posts.length === 0 ? (
              <EmptyState />
            ) : (
              posts.map(post => <PostCard key={post.id} post={post} />)
            )}
          </TabsContent>
          
          <TabsContent value="populares" className="mt-4 space-y-4">
            {loading ? (
              <PostsLoading />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : posts.length === 0 ? (
              <EmptyState />
            ) : (
              posts.map(post => <PostCard key={post.id} post={post} />)
            )}
          </TabsContent>
          
          <TabsContent value="seguindo" className="mt-4 space-y-4">
            {!user ? (
              <div className="bg-card rounded-lg border shadow-sm p-8 text-center">
                <h3 className="text-lg font-medium">Faça login para ver posts personalizados</h3>
                <p className="text-muted-foreground mt-2">
                  Siga comunidades e usuários para personalizar seu feed
                </p>
                <div className="mt-4 flex justify-center gap-4">
                  <Button asChild variant="outline">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Cadastrar</Link>
                  </Button>
                </div>
              </div>
            ) : loading ? (
              <PostsLoading />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : posts.length === 0 ? (
              <div className="bg-card rounded-lg border shadow-sm p-8 text-center">
                <h3 className="text-lg font-medium">Seu feed está vazio</h3>
                <p className="text-muted-foreground mt-2">
                  Siga comunidades e usuários para ver posts aqui
                </p>
                <Button asChild className="mt-4">
                  <Link to="/communities">Explorar Comunidades</Link>
                </Button>
              </div>
            ) : (
              posts.map(post => <PostCard key={post.id} post={post} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

function PostsLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-card rounded-lg border shadow-sm p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="bg-destructive/15 text-destructive rounded-md p-4 text-center">
      <p>{message}</p>
      <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
        Tentar novamente
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-card rounded-lg border shadow-sm p-8 text-center">
      <h3 className="text-lg font-medium">Nenhum post encontrado</h3>
      <p className="text-muted-foreground mt-2">Seja o primeiro a criar um post!</p>
    </div>
  );
}
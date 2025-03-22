import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { Button } from '../components/ui/button';
import { Calendar, MapPin, GraduationCap, BookOpen, Link as LinkIcon, Github, Linkedin, Loader2, Edit, Bookmark, MessageSquare, Users } from 'lucide-react';
import { toast } from '../components/ui/use-toast';
import EditProfileDialog from '../components/profile/EditProfileDialog';
import PostCard from '../components/posts/PostCard';
import { Skeleton } from '../components/ui/Skeleton';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [loading, setLoading] = useState({
    posts: true,
    comments: false,
    communities: false
  });
  
  useEffect(() => {
    // Simulando carregamento inicial de posts
    const timer = setTimeout(() => {
      setLoading(prev => ({...prev, posts: false}));
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Carrega dados conforme a aba selecionada
  useEffect(() => {
    const loadTabData = (tab) => {
      if (tab === 'posts' && userPosts.length === 0) {
        // Simular carregamento de posts (aqui você usaria sua API)
        setLoading(prev => ({...prev, posts: true}));
        setTimeout(() => {
          setLoading(prev => ({...prev, posts: false}));
          // setUserPosts([]); // Simulando que não há posts
        }, 1000);
      } 
      else if (tab === 'comments' && userComments.length === 0) {
        setLoading(prev => ({...prev, comments: true}));
        setTimeout(() => {
          setLoading(prev => ({...prev, comments: false}));
          // setUserComments([]);
        }, 1000);
      }
      else if (tab === 'communities' && userCommunities.length === 0) {
        setLoading(prev => ({...prev, communities: true}));
        setTimeout(() => {
          setLoading(prev => ({...prev, communities: false}));
          // setUserCommunities([]);
        }, 1000);
      }
    };
    
    loadTabData(activeTab);
  }, [activeTab]);
  
  const handleProfileUpdate = (updatedProfile) => {
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram atualizadas com sucesso."
    });
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner e Avatar */}
      <div className="relative h-[200px]">
        <div className="absolute inset-0">
          <div className="h-full w-full bg-gradient-to-r from-primary/80 to-primary/40 rounded-lg" />
        </div>
        <div className="absolute -bottom-16 left-6">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage 
              src={profile?.avatar_url} 
              alt={profile?.display_name || "Usuário"} 
            />
            <AvatarFallback className="text-4xl">
              {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="absolute bottom-4 right-6">
          <Button 
            onClick={() => setIsEditDialogOpen(true)} 
            variant="outline" 
            className="bg-background/80 backdrop-blur-sm gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar Perfil
          </Button>
        </div>
      </div>

      {/* Informações do Perfil */}
      <div className="pt-20 px-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{profile?.display_name || 'Usuário'}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <p className="text-muted-foreground max-w-2xl">
              {profile.bio}
            </p>
          )}

          {/* Detalhes Acadêmicos e Profissionais */}
          <div className="grid gap-6 md:grid-cols-2 max-w-2xl">
            <div className="space-y-3">
              {profile?.curso && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-4 w-4 shrink-0" />
                  <span>{profile.curso}</span>
                </div>
              )}
              {profile?.centro && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span>{profile.centro}</span>
                </div>
              )}
              {profile?.periodo_ingresso && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Ingresso em {profile.periodo_ingresso}</span>
                </div>
              )}
              {profile?.dre && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>DRE: {profile.dre}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {profile?.lattes && (
                <a 
                  href={profile.lattes}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <LinkIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate">Currículo Lattes</span>
                </a>
              )}
              {profile?.github && (
                <a 
                  href={`https://github.com/${profile.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Github className="h-4 w-4 shrink-0" />
                  <span className="truncate">{profile.github}</span>
                </a>
              )}
              {profile?.linkedin && (
                <a 
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Linkedin className="h-4 w-4 shrink-0" />
                  <span className="truncate">LinkedIn</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tabs de Conteúdo */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="mt-8"
        >
          <TabsList className="w-full justify-start">
            <TabsTrigger value="posts" className="gap-2">
              <Bookmark className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Comentários
            </TabsTrigger>
            <TabsTrigger value="communities" className="gap-2">
              <Users className="h-4 w-4" />
              Comunidades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6 space-y-4">
            {loading.posts ? (
              <PostsSkeleton />
            ) : userPosts && userPosts.length > 0 ? (
              userPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <EmptyState 
                title="Nenhuma publicação ainda" 
                description="Suas publicações aparecerão aqui"
                action={
                  <Button asChild>
                    <Link to="/posts/new">Criar Publicação</Link>
                  </Button>
                }
              />
            )}
          </TabsContent>

          <TabsContent value="comments" className="mt-6 space-y-4">
            {loading.comments ? (
              <CommentsSkeleton />
            ) : userComments && userComments.length > 0 ? (
              userComments.map(comment => (
                <CommentCard key={comment.id} comment={comment} />
              ))
            ) : (
              <EmptyState 
                title="Nenhum comentário ainda" 
                description="Seus comentários aparecerão aqui"
              />
            )}
          </TabsContent>

          <TabsContent value="communities" className="mt-6 space-y-4">
            {loading.communities ? (
              <CommunitiesSkeleton />
            ) : userCommunities && userCommunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userCommunities.map(community => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
            ) : (
              <EmptyState 
                title="Nenhuma comunidade ainda" 
                description="Você ainda não participa de nenhuma comunidade"
                action={
                  <Button asChild>
                    <Link to="/communities">Explorar Comunidades</Link>
                  </Button>
                }
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo de Edição */}
      <EditProfileDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        onSave={handleProfileUpdate}
      />
    </div>
  );
}

// Componentes auxiliares
function EmptyState({ title, description, action }) {
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {action && (
        <CardFooter className="flex justify-center pt-2">
          {action}
        </CardFooter>
      )}
    </Card>
  );
}

function PostsSkeleton() {
  return (
    <>
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
    </>
  );
}

function CommentsSkeleton() {
  return (
    <>
      {Array(3).fill(0).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center space-x-4 mb-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[180px]" />
              <Skeleton className="h-3 w-[120px]" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5 mt-2" />
        </Card>
      ))}
    </>
  );
}

function CommunitiesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array(4).fill(0).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CommentCard({ comment }) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to={`/posts/${comment.post_id}`} className="font-medium text-sm hover:underline">
              {comment.post_title}
            </Link>
            <span className="text-xs text-muted-foreground">
              • {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm">{comment.content}</p>
      </CardContent>
    </Card>
  );
}

function CommunityCard({ community }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 p-4 pb-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src={community.icon_url} alt={community.name} />
          <AvatarFallback>{community.name?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg">{community.name}</CardTitle>
          <CardDescription>{community.member_count || 0} membros</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {community.description || "Sem descrição disponível"}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" asChild className="w-full">
          <Link to={`/communities/${community.id}`}>
            Visitar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
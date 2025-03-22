import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "../components/ui/use-toast";
import { SearchIcon, Users, FileText, School, CalendarDays, AtSign } from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Loader } from "../components/ui/Loader";
import { Badge } from "../components/ui/Badge";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { searchContent } from "../lib/api";

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    posts: [],
    communities: [],
    users: [], 
    events: []
  });
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query) => {
    if (!query || query.trim().length < 2) return;

    try {
      setLoading(true);
      const data = await searchContent(query);
      setResults(data);
    } catch (error) {
      console.error("Erro na pesquisa:", error);
      toast.error("Ocorreu um erro ao realizar a pesquisa");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length < 2) {
      toast.error("Digite pelo menos 2 caracteres para pesquisar");
      return;
    }
    
    setSearchParams({ q: searchQuery });
    performSearch(searchQuery);
  };

  const getResultsCount = () => {
    return (
      results.posts.length +
      results.communities.length +
      results.users.length +
      results.events.length
    );
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Pesquisa</h1>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <form onSubmit={handleSearch} className="flex w-full gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Pesquisar posts, comunidades, usuários, eventos..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Pesquisando..." : "Pesquisar"}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {searchParams.get("q") && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-4">
              Resultados para "{searchParams.get("q")}"
              {!loading && (
                <Badge variant="outline" className="ml-2">
                  {getResultsCount()} resultados
                </Badge>
              )}
            </h2>

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader />
              </div>
            ) : getResultsCount() === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">
                    Nenhum resultado encontrado para "{searchParams.get("q")}".
                    <br />
                    Tente pesquisar termos diferentes.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="all">
                    Todos ({getResultsCount()})
                  </TabsTrigger>
                  <TabsTrigger value="posts">
                    Posts ({results.posts.length})
                  </TabsTrigger>
                  <TabsTrigger value="communities">
                    Comunidades ({results.communities.length})
                  </TabsTrigger>
                  <TabsTrigger value="users">
                    Usuários ({results.users.length})
                  </TabsTrigger>
                  <TabsTrigger value="events">
                    Eventos ({results.events.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0 space-y-6">
                  {results.posts.length > 0 && (
                    <div>
                      <div className="flex items-center mb-4">
                        <FileText className="mr-2 h-5 w-5" />
                        <h3 className="text-lg font-medium">Posts</h3>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {results.posts.slice(0, 4).map((post) => (
                          <Card key={post.id}>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base line-clamp-2">
                                <Link
                                  to={`/posts/${post.id}`}
                                  className="hover:underline"
                                >
                                  {post.title}
                                </Link>
                              </CardTitle>
                              <CardDescription>
                                <Link
                                  to={`/communities/${post.community?.slug}`}
                                  className="text-primary hover:underline"
                                >
                                  {post.community?.name}
                                </Link>
                                {" • "}
                                <span>{formatDate(post.created_at)}</span>
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-3">
                              <p className="line-clamp-2 text-sm">
                                {post.content}
                              </p>
                            </CardContent>
                            <CardFooter>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="ml-auto"
                              >
                                <Link to={`/posts/${post.id}`}>
                                  Ler post
                                </Link>
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                      {results.posts.length > 4 && (
                        <div className="text-center mt-2">
                          <Button
                            variant="link"
                            onClick={() => setActiveTab("posts")}
                          >
                            Ver todos os {results.posts.length} posts
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {results.communities.length > 0 && (
                    <div>
                      <div className="flex items-center mb-4">
                        <School className="mr-2 h-5 w-5" />
                        <h3 className="text-lg font-medium">Comunidades</h3>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {results.communities.slice(0, 3).map((community) => (
                          <Card key={community.id}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {community.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-base">
                                    <Link
                                      to={`/communities/${community.slug}`}
                                      className="hover:underline"
                                    >
                                      {community.name}
                                    </Link>
                                  </CardTitle>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-3">
                              <p className="line-clamp-2 text-sm">
                                {community.description}
                              </p>
                            </CardContent>
                            <CardFooter>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="ml-auto"
                              >
                                <Link to={`/communities/${community.slug}`}>
                                  Ver comunidade
                                </Link>
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                      {results.communities.length > 3 && (
                        <div className="text-center mt-2">
                          <Button
                            variant="link"
                            onClick={() => setActiveTab("communities")}
                          >
                            Ver todas as {results.communities.length} comunidades
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {results.users.length > 0 && (
                    <div>
                      <div className="flex items-center mb-4">
                        <Users className="mr-2 h-5 w-5" />
                        <h3 className="text-lg font-medium">Usuários</h3>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {results.users.slice(0, 3).map((user) => (
                          <Card key={user.id}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={user.avatar_url} />
                                  <AvatarFallback>
                                    {user.display_name?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-base">
                                    <Link
                                      to={`/profile/${user.id}`}
                                      className="hover:underline"
                                    >
                                      {user.display_name}
                                    </Link>
                                  </CardTitle>
                                  {user.username && (
                                    <p className="text-xs text-muted-foreground flex items-center">
                                      <AtSign className="h-3 w-3 mr-1" />
                                      {user.username}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardFooter>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="ml-auto"
                              >
                                <Link to={`/profile/${user.id}`}>
                                  Ver perfil
                                </Link>
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                      {results.users.length > 3 && (
                        <div className="text-center mt-2">
                          <Button
                            variant="link"
                            onClick={() => setActiveTab("users")}
                          >
                            Ver todos os {results.users.length} usuários
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {results.events.length > 0 && (
                    <div>
                      <div className="flex items-center mb-4">
                        <CalendarDays className="mr-2 h-5 w-5" />
                        <h3 className="text-lg font-medium">Eventos</h3>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {results.events.slice(0, 4).map((event) => (
                          <Card key={event.id}>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base line-clamp-2">
                                <Link
                                  to={`/events/${event.id}`}
                                  className="hover:underline"
                                >
                                  {event.title}
                                </Link>
                              </CardTitle>
                              <CardDescription>
                                <Link
                                  to={`/communities/${event.community?.slug}`}
                                  className="text-primary hover:underline"
                                >
                                  {event.community?.name}
                                </Link>
                                {" • "}
                                <span>
                                  {format(
                                    new Date(event.event_date),
                                    "PPP",
                                    { locale: ptBR }
                                  )}
                                </span>
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-3">
                              <p className="line-clamp-2 text-sm">
                                {event.description}
                              </p>
                            </CardContent>
                            <CardFooter>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="ml-auto"
                              >
                                <Link to={`/events/${event.id}`}>
                                  Ver evento
                                </Link>
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                      {results.events.length > 4 && (
                        <div className="text-center mt-2">
                          <Button
                            variant="link"
                            onClick={() => setActiveTab("events")}
                          >
                            Ver todos os {results.events.length} eventos
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="posts" className="mt-0">
                  {results.posts.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {results.posts.map((post) => (
                        <Card key={post.id}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base line-clamp-2">
                              <Link
                                to={`/posts/${post.id}`}
                                className="hover:underline"
                              >
                                {post.title}
                              </Link>
                            </CardTitle>
                            <CardDescription>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={post.author?.avatar_url} />
                                  <AvatarFallback>
                                    {post.author?.display_name?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <Link
                                  to={`/profile/${post.author?.id}`}
                                  className="hover:underline text-xs"
                                >
                                  {post.author?.display_name}
                                </Link>
                              </div>
                              <div className="mt-1 text-xs">
                                <Link
                                  to={`/communities/${post.community?.slug}`}
                                  className="text-primary hover:underline"
                                >
                                  {post.community?.name}
                                </Link>
                                {" • "}
                                <span>{formatDate(post.created_at)}</span>
                              </div>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <p className="line-clamp-3 text-sm">{post.content}</p>
                          </CardContent>
                          <CardFooter>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="ml-auto"
                            >
                              <Link to={`/posts/${post.id}`}>
                                Ler post
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-10 text-center">
                        <p className="text-muted-foreground">
                          Nenhum post encontrado para "{searchParams.get("q")}".
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="communities" className="mt-0">
                  {results.communities.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {results.communities.map((community) => (
                        <Card key={community.id}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {community.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-base">
                                  <Link
                                    to={`/communities/${community.slug}`}
                                    className="hover:underline"
                                  >
                                    {community.name}
                                  </Link>
                                </CardTitle>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <p className="line-clamp-3 text-sm">
                              {community.description}
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="ml-auto"
                            >
                              <Link to={`/communities/${community.slug}`}>
                                Ver comunidade
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-10 text-center">
                        <p className="text-muted-foreground">
                          Nenhuma comunidade encontrada para "{searchParams.get("q")}".
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="users" className="mt-0">
                  {results.users.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {results.users.map((user) => (
                        <Card key={user.id}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback>
                                  {user.display_name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-base">
                                  <Link
                                    to={`/profile/${user.id}`}
                                    className="hover:underline"
                                  >
                                    {user.display_name}
                                  </Link>
                                </CardTitle>
                                {user.username && (
                                  <p className="text-xs text-muted-foreground flex items-center">
                                    <AtSign className="h-3 w-3 mr-1" />
                                    {user.username}
                                  </p>
                                )}
                                {user.is_staff && (
                                  <Badge variant="outline" className="mt-1">
                                    Staff
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardFooter>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="ml-auto"
                            >
                              <Link to={`/profile/${user.id}`}>
                                Ver perfil
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-10 text-center">
                        <p className="text-muted-foreground">
                          Nenhum usuário encontrado para "{searchParams.get("q")}".
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="events" className="mt-0">
                  {results.events.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {results.events.map((event) => (
                        <Card key={event.id}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base line-clamp-2">
                              <Link
                                to={`/events/${event.id}`}
                                className="hover:underline"
                              >
                                {event.title}
                              </Link>
                            </CardTitle>
                            <CardDescription>
                              <Link
                                to={`/communities/${event.community?.slug}`}
                                className="text-primary hover:underline"
                              >
                                {event.community?.name}
                              </Link>
                              {" • "}
                              <span>
                                {format(
                                  new Date(event.event_date),
                                  "PPP",
                                  { locale: ptBR }
                                )}
                              </span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <p className="line-clamp-3 text-sm">
                              {event.description}
                            </p>
                            {event.location && (
                              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span className="line-clamp-1">{event.location}</span>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="ml-auto"
                            >
                              <Link to={`/events/${event.id}`}>
                                Ver evento
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-10 text-center">
                        <p className="text-muted-foreground">
                          Nenhum evento encontrado para "{searchParams.get("q")}".
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 
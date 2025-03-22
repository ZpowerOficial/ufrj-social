import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "../components/ui/use-toast";
import { CalendarDays, MapPin, ExternalLink, CalendarPlus, Clock, CalendarClock } from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";
import { Badge } from "../components/ui/Badge";
import { Loader } from "../components/ui/Loader";
import { getEvents, participateInEvent } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function EventsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    fetchEvents(activeTab);
  }, [activeTab]);

  const fetchEvents = async (filter = "upcoming") => {
    try {
      setLoading(true);
      const data = await getEvents({ filter });
      setEvents(data || []);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      toast.error("Não foi possível carregar os eventos");
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "PPP 'às' HH:mm", { locale: ptBR });
  };

  const isEventSoon = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const twoDaysFromNow = addDays(today, 2);
    return isAfter(eventDate, today) && isBefore(eventDate, twoDaysFromNow);
  };

  const handleJoinEvent = async (eventId) => {
    if (!user) {
      toast.error("Você precisa estar logado para participar de eventos");
      navigate("/login");
      return;
    }

    try {
      await participateInEvent(eventId);
      toast.success("Você está participando deste evento!");
    } catch (error) {
      console.error("Erro ao participar do evento:", error);
      toast.error("Não foi possível participar do evento");
    }
  };

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Eventos</h1>
          <Button onClick={() => navigate("/events/new")}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Criar Evento
          </Button>
        </div>

        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Próximos Eventos</TabsTrigger>
            <TabsTrigger value="past">Eventos Passados</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-0">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Nenhum evento futuro encontrado</h3>
                <p className="text-muted-foreground mt-2">
                  Seja o primeiro a criar um evento para sua comunidade!
                </p>
                <Button className="mt-4" onClick={() => navigate("/events/new")}>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Criar Evento
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Card key={event.id} className="overflow-hidden h-full flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                        {isEventSoon(event.event_date) && (
                          <Badge variant="purple" className="ml-2 whitespace-nowrap">
                            Em breve
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        <Link 
                          to={`/communities/${event.community?.slug}`}
                          className="text-primary hover:underline"
                        >
                          {event.community?.name}
                        </Link>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3 flex-grow">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span>{formatEventDate(event.event_date)}</span>
                        </div>
                        
                        {event.is_online ? (
                          <div className="flex items-start gap-2">
                            <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <span>Evento online</span>
                          </div>
                        ) : event.location ? (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <span>{event.location}</span>
                          </div>
                        ) : null}
                        
                        <p className="text-sm mt-3 line-clamp-3">{event.description}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-3 border-t">
                      <div className="flex gap-3 w-full">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          Ver Detalhes
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={() => handleJoinEvent(event.id)}
                        >
                          Participar
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-0">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Nenhum evento passado encontrado</h3>
                <p className="text-muted-foreground mt-2">
                  Eventos passados aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Card key={event.id} className="overflow-hidden h-full flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                      <CardDescription>
                        <Link 
                          to={`/communities/${event.community?.slug}`}
                          className="text-primary hover:underline"
                        >
                          {event.community?.name}
                        </Link>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3 flex-grow">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span>{formatEventDate(event.event_date)}</span>
                        </div>
                        
                        {event.is_online ? (
                          <div className="flex items-start gap-2">
                            <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <span>Evento online</span>
                          </div>
                        ) : event.location ? (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <span>{event.location}</span>
                          </div>
                        ) : null}
                        
                        <p className="text-sm mt-3 line-clamp-3">{event.description}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-3 border-t">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        Ver Detalhes
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
} 
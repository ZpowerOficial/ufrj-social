import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "../components/ui/use-toast";
import { CalendarIcon, Clock, MapPin, LinkIcon, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import { cn } from "@/lib/utils";
import { createEvent, getUserJoinedCommunities } from "@/lib/api";

export default function NewEventPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("12:00");
  const [communities, setCommunities] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      eventLink: "",
    },
  });

  const watchLocation = watch("location");
  const watchEventLink = watch("eventLink");

  useEffect(() => {
    async function fetchCommunities() {
      try {
        const data = await getUserJoinedCommunities();
        setCommunities(data || []);
        
        // Se tiver comunidades, selecionar a primeira por padrão
        if (data && data.length > 0) {
          setSelectedCommunity(data[0]);
        }
      } catch (error) {
        console.error("Erro ao buscar comunidades:", error);
        toast.error("Não foi possível carregar suas comunidades");
      }
    }

    fetchCommunities();
  }, []);

  const onSubmit = async (data) => {
    if (!selectedCommunity) {
      toast.error("Selecione uma comunidade para o evento");
      return;
    }

    if (isOnline && !data.eventLink) {
      toast.error("Forneça um link para o evento online");
      return;
    }

    if (!isOnline && !data.location) {
      toast.error("Forneça uma localização para o evento presencial");
      return;
    }

    try {
      setLoading(true);

      // Combinar data e hora
      const [hours, minutes] = time.split(":");
      const eventDate = new Date(date);
      eventDate.setHours(parseInt(hours, 10));
      eventDate.setMinutes(parseInt(minutes, 10));

      await createEvent({
        title: data.title,
        description: data.description,
        communityId: selectedCommunity.id,
        eventDate: eventDate.toISOString(),
        location: data.location,
        isOnline,
        eventLink: data.eventLink,
      });

      toast.success("Evento criado com sucesso!");
      navigate(`/communities/${selectedCommunity.slug}`);
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      toast.error("Não foi possível criar o evento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-3xl py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Criar Novo Evento</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Evento</Label>
                <Input
                  id="title"
                  placeholder="Título do evento"
                  {...register("title", { required: "Título é obrigatório" })}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Comunidade</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {selectedCommunity
                        ? selectedCommunity.name
                        : "Selecione uma comunidade..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar comunidade..." />
                      <CommandEmpty>Nenhuma comunidade encontrada</CommandEmpty>
                      <CommandGroup>
                        {communities.map((community) => (
                          <CommandItem
                            key={community.id}
                            value={community.name}
                            onSelect={() => {
                              setSelectedCommunity(community);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCommunity?.id === community.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {community.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {communities.length === 0 && (
                  <p className="text-sm text-amber-500">
                    Você precisa participar de pelo menos uma comunidade para criar um evento
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? (
                          format(date, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Horário</Label>
                  <div className="flex w-full items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "time";
                        input.value = time;
                        input.addEventListener("change", (e) => {
                          setTime(e.target.value);
                        });
                        input.click();
                      }}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {time}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is-online"
                  checked={isOnline}
                  onCheckedChange={setIsOnline}
                />
                <Label htmlFor="is-online">Evento Online</Label>
              </div>

              {!isOnline && (
                <div className="space-y-2">
                  <Label htmlFor="location">Local do Evento</Label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        className="pl-9"
                        placeholder="Local do evento"
                        {...register("location", {
                          required: !isOnline ? "Local é obrigatório para eventos presenciais" : false,
                        })}
                      />
                    </div>
                  </div>
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location.message}</p>
                  )}
                </div>
              )}

              {isOnline && (
                <div className="space-y-2">
                  <Label htmlFor="eventLink">Link do Evento</Label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="eventLink"
                        className="pl-9"
                        placeholder="https://meet.google.com/..."
                        {...register("eventLink", {
                          required: isOnline ? "Link é obrigatório para eventos online" : false,
                          pattern: {
                            value: /^(http|https):\/\/[^ "]+$/,
                            message: "URL inválida",
                          },
                        })}
                      />
                    </div>
                  </div>
                  {errors.eventLink && (
                    <p className="text-sm text-red-500">{errors.eventLink.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o evento..."
                  rows={5}
                  {...register("description", {
                    required: "Descrição é obrigatória",
                    minLength: {
                      value: 10,
                      message: "A descrição deve ter pelo menos 10 caracteres",
                    },
                  })}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || communities.length === 0}>
                {loading ? "Criando..." : "Criar Evento"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
} 
"use client"

import Link from "next/link"
import { Bell, Home, Menu, MessageSquare, Search, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-full bg-blue-600 p-1">
                <div className="h-6 w-6 text-white font-bold flex items-center justify-center">U</div>
              </div>
              <span className="hidden font-bold text-xl md:inline-block">UFRJ Hub</span>
            </Link>
          </div>
          <div className="hidden md:flex md:w-1/3">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar no UFRJ Hub..."
                className="w-full pl-8 rounded-full bg-muted"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/search">
                <Search className="h-5 w-5 md:hidden" />
                <span className="sr-only">Pesquisar</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notificações</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/messages">
                <MessageSquare className="h-5 w-5" />
                <span className="sr-only">Mensagens</span>
              </Link>
            </Button>
            <Link href="/profile">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@usuario" />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container grid grid-cols-1 md:grid-cols-4 gap-6 py-6">
          <div className="hidden md:flex flex-col gap-4">
            <nav className="grid gap-2">
              <Button variant="ghost" className="justify-start gap-2" asChild>
                <Link href="/">
                  <Home className="h-5 w-5" />
                  Página Inicial
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start gap-2" asChild>
                <Link href="/communities">
                  <Users className="h-5 w-5" />
                  Comunidades
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start gap-2" asChild>
                <Link href="/events">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                    <path d="M8 14h.01" />
                    <path d="M12 14h.01" />
                    <path d="M16 14h.01" />
                    <path d="M8 18h.01" />
                    <path d="M12 18h.01" />
                    <path d="M16 18h.01" />
                  </svg>
                  Eventos
                </Link>
              </Button>
            </nav>
            <Separator />
            <div>
              <h3 className="mb-2 text-lg font-semibold">Comunidades Populares</h3>
              <div className="grid gap-2">
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/communities/computacao">r/Computação</Link>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/communities/engenharia">r/Engenharia</Link>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/communities/medicina">r/Medicina</Link>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/communities/direito">r/Direito</Link>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/communities/all">Ver todas</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <Tabs defaultValue="recentes" className="mb-6">
              <TabsList className="w-full">
                <TabsTrigger value="recentes" className="flex-1">
                  Recentes
                </TabsTrigger>
                <TabsTrigger value="populares" className="flex-1">
                  Populares
                </TabsTrigger>
                <TabsTrigger value="seguindo" className="flex-1">
                  Seguindo
                </TabsTrigger>
              </TabsList>
              <TabsContent value="recentes" className="mt-4 space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-start gap-4 p-4">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="@usuario" />
                      <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Maria Silva</span>
                        <span className="text-sm text-muted-foreground">@mariasilva</span>
                        <span className="text-sm text-muted-foreground">· 2h</span>
                      </div>
                      <span className="text-sm text-blue-600">r/Computação</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p>
                      Pessoal, alguém sabe se as inscrições para o Hackathon de IA já estão abertas? O site da UFRJ não
                      está atualizando as informações. 🤔
                    </p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between p-4 pt-0">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                        12
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <MessageSquare className="h-4 w-4" />5
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M8 16H3v5" />
                      </svg>
                    </Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-start gap-4 p-4">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="@usuario" />
                      <AvatarFallback>JC</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">João Costa</span>
                        <span className="text-sm text-muted-foreground">@joaocosta</span>
                        <span className="text-sm text-muted-foreground">· 5h</span>
                      </div>
                      <span className="text-sm text-blue-600">r/Engenharia</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p>
                      Acabei de receber a notícia que nosso projeto de Engenharia Sustentável foi aprovado para a fase
                      final da competição nacional! 🎉 Quem mais vai participar?
                    </p>
                    <div className="mt-4 rounded-lg overflow-hidden">
                      <img
                        src="/placeholder.svg?height=300&width=500"
                        alt="Projeto de Engenharia"
                        className="w-full object-cover"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between p-4 pt-0">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                        48
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <MessageSquare className="h-4 w-4" />
                        23
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M8 16H3v5" />
                      </svg>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="populares" className="mt-4 space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-start gap-4 p-4">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="@usuario" />
                      <AvatarFallback>AC</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Ana Cardoso</span>
                        <span className="text-sm text-muted-foreground">@anacardoso</span>
                        <span className="text-sm text-muted-foreground">· 1d</span>
                      </div>
                      <span className="text-sm text-blue-600">r/Medicina</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p>
                      ATENÇÃO: O Hospital Universitário está com vagas abertas para estágio em diversas especialidades!
                      Inscrições até sexta-feira. Link nos comentários 👇
                    </p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between p-4 pt-0">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                        156
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <MessageSquare className="h-4 w-4" />
                        42
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M8 16H3v5" />
                      </svg>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="seguindo" className="mt-4 space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-start gap-4 p-4">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="@usuario" />
                      <AvatarFallback>RL</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Rafael Lima</span>
                        <span className="text-sm text-muted-foreground">@rafaellima</span>
                        <span className="text-sm text-muted-foreground">· 3h</span>
                      </div>
                      <span className="text-sm text-blue-600">r/Direito</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p>
                      Alguém tem as anotações da aula de Direito Constitucional de ontem? Não consegui comparecer por
                      motivos de saúde. Agradeço muito! 🙏
                    </p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between p-4 pt-0">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                        8
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <MessageSquare className="h-4 w-4" />3
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M8 16H3v5" />
                      </svg>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <div className="hidden md:flex flex-col gap-4">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Próximos Eventos</h3>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-1">
                  <h4 className="font-medium">Palestra: IA na Medicina</h4>
                  <p className="text-sm text-muted-foreground">Amanhã, 15:00 - Auditório Central</p>
                </div>
                <div className="grid gap-1">
                  <h4 className="font-medium">Hackathon de Sustentabilidade</h4>
                  <p className="text-sm text-muted-foreground">Sábado, 09:00 - Centro de Tecnologia</p>
                </div>
                <div className="grid gap-1">
                  <h4 className="font-medium">Workshop de Fotografia</h4>
                  <p className="text-sm text-muted-foreground">Segunda, 14:00 - Escola de Belas Artes</p>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/events">Ver todos os eventos</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Sugestões para seguir</h3>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@usuario" />
                      <AvatarFallback>CA</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Centro Acadêmico</p>
                      <p className="text-xs text-muted-foreground">@centroacademico</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Seguir
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@usuario" />
                      <AvatarFallback>AT</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Atlética UFRJ</p>
                      <p className="text-xs text-muted-foreground">@atleticaufrj</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Seguir
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@usuario" />
                      <AvatarFallback>BU</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Biblioteca Universitária</p>
                      <p className="text-xs text-muted-foreground">@bibliotecaufrj</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Seguir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background md:hidden">
        <div className="container flex items-center justify-between py-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <Home className="h-5 w-5" />
              <span className="sr-only">Página Inicial</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/communities">
              <Users className="h-5 w-5" />
              <span className="sr-only">Comunidades</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/events">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
                <path d="M8 14h.01" />
                <path d="M12 14h.01" />
                <path d="M16 14h.01" />
                <path d="M8 18h.01" />
                <path d="M12 18h.01" />
                <path d="M16 18h.01" />
              </svg>
              <span className="sr-only">Eventos</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder.svg?height=24&width=24" alt="@usuario" />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
              <span className="sr-only">Perfil</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}


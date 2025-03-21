"use client"

import Link from "next/link"
import { ArrowLeft, Calendar, Edit, MapPin, MoreHorizontal, Settings, Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center gap-4 py-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Perfil</h1>
            <p className="text-sm text-muted-foreground">@usuario</p>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Configurações</span>
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
            <span className="sr-only">Mais opções</span>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <div className="relative">
          <div className="h-40 w-full bg-gradient-to-r from-blue-600 to-blue-400"></div>
          <div className="container relative">
            <Avatar className="absolute -bottom-16 left-4 h-32 w-32 border-4 border-background">
              <AvatarImage src="/placeholder.svg?height=128&width=128" alt="@usuario" />
              <AvatarFallback className="text-4xl">UN</AvatarFallback>
            </Avatar>
            <div className="flex justify-end py-4">
              <Button className="gap-2">
                <Edit className="h-4 w-4" />
                Editar Perfil
              </Button>
            </div>
          </div>
        </div>
        <div className="container mt-16 grid gap-6">
          <div>
            <h2 className="text-2xl font-bold">Usuário da UFRJ</h2>
            <p className="text-muted-foreground">@usuario</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Rio de Janeiro, RJ
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Membro desde Março 2023
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>120 seguidores</span>
                <span className="mx-1">·</span>
                <span>45 seguindo</span>
              </div>
            </div>
            <p className="mt-4">
              Estudante de Ciência da Computação na UFRJ. Apaixonado por tecnologia, desenvolvimento web e inteligência
              artificial.
            </p>
          </div>
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="posts" className="flex-1">
                Posts
              </TabsTrigger>
              <TabsTrigger value="comentarios" className="flex-1">
                Comentários
              </TabsTrigger>
              <TabsTrigger value="curtidas" className="flex-1">
                Curtidas
              </TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-start gap-4 p-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="@usuario" />
                    <AvatarFallback>UN</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Usuário da UFRJ</span>
                      <span className="text-sm text-muted-foreground">@usuario</span>
                      <span className="text-sm text-muted-foreground">· 1d</span>
                    </div>
                    <span className="text-sm text-blue-600">r/Computação</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p>
                    Acabei de terminar meu projeto de Estruturas de Dados! Implementei uma árvore AVL com visualização
                    gráfica. Quem quiser dar uma olhada, o código está no meu GitHub.
                  </p>
                  <div className="mt-4 rounded-lg overflow-hidden">
                    <img
                      src="/placeholder.svg?height=300&width=500"
                      alt="Projeto de Estruturas de Dados"
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
                      32
                    </Button>
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
                        <path d="M12 20.25c4.5 0 8.25-3.75 8.25-8.25v-1.5M12 20.25c-4.5 0-8.25-3.75-8.25-8.25v-1.5M12 20.25v-1.5m0-16.5v1.5m0 0c4.5 0 8.25 3.75 8.25 8.25M12 3.75c-4.5 0-8.25 3.75-8.25 8.25m16.5 0c0 4.5-3.75 8.25-8.25 8.25" />
                      </svg>
                      15
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
                    <AvatarFallback>UN</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Usuário da UFRJ</span>
                      <span className="text-sm text-muted-foreground">@usuario</span>
                      <span className="text-sm text-muted-foreground">· 3d</span>
                    </div>
                    <span className="text-sm text-blue-600">r/UFRJ</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p>
                    Alguém sabe se o Restaurante Universitário vai funcionar durante o recesso? Não encontrei
                    informações no site.
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
                      18
                    </Button>
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
                        <path d="M12 20.25c4.5 0 8.25-3.75 8.25-8.25v-1.5M12 20.25c-4.5 0-8.25-3.75-8.25-8.25v-1.5M12 20.25v-1.5m0-16.5v1.5m0 0c4.5 0 8.25 3.75 8.25 8.25M12 3.75c-4.5 0-8.25 3.75-8.25 8.25m16.5 0c0 4.5-3.75 8.25-8.25 8.25" />
                      </svg>
                      7
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
            <TabsContent value="comentarios" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="p-4">
                  <div className="text-sm text-muted-foreground">
                    Comentário em <span className="text-blue-600">r/Computação</span> · 12h
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p>
                    Eu participei do Hackathon ano passado e foi uma experiência incrível! As inscrições geralmente
                    abrem duas semanas antes do evento. Fique de olho no Instagram do departamento de Ciência da
                    Computação, eles sempre postam lá primeiro.
                  </p>
                </CardContent>
                <CardFooter className="flex items-center p-4 pt-0">
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
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <div className="text-sm text-muted-foreground">
                    Comentário em <span className="text-blue-600">r/UFRJ</span> · 2d
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p>
                    A biblioteca central estará aberta durante todo o recesso, mas com horário reduzido (9h às 17h).
                    Acabei de confirmar isso com a administração.
                  </p>
                </CardContent>
                <CardFooter className="flex items-center p-4 pt-0">
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
                    15
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="curtidas" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-start gap-4 p-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="@mariasilva" />
                    <AvatarFallback>MS</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Maria Silva</span>
                      <span className="text-sm text-muted-foreground">@mariasilva</span>
                      <span className="text-sm text-muted-foreground">· 5h</span>
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
                    <Button variant="ghost" size="sm" className="gap-1 text-blue-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                      13
                    </Button>
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
                        <path d="M12 20.25c4.5 0 8.25-3.75 8.25-8.25v-1.5M12 20.25c-4.5 0-8.25-3.75-8.25-8.25v-1.5M12 20.25v-1.5m0-16.5v1.5m0 0c4.5 0 8.25 3.75 8.25 8.25M12 3.75c-4.5 0-8.25 3.75-8.25 8.25m16.5 0c0 4.5-3.75 8.25-8.25 8.25" />
                      </svg>
                      5
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
      </main>
    </div>
  )
}


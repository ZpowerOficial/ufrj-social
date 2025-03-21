"use client"

import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SearchPage() {
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
          <h1 className="text-xl font-bold">Pesquisar</h1>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="relative mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Pesquisar no UFRJ Hub..." className="w-full pl-8 rounded-lg bg-muted" />
          </div>
          <Tabs defaultValue="tudo" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="tudo" className="flex-1">
                Tudo
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex-1">
                Posts
              </TabsTrigger>
              <TabsTrigger value="pessoas" className="flex-1">
                Pessoas
              </TabsTrigger>
              <TabsTrigger value="comunidades" className="flex-1">
                Comunidades
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tudo" className="mt-6 space-y-6">
              <div>
                <h2 className="mb-4 text-lg font-semibold">Pessoas</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-4 p-4">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="@mariasilva" />
                        <AvatarFallback>MS</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                        <div className="font-semibold">Maria Silva</div>
                        <div className="text-sm text-muted-foreground">@mariasilva</div>
                      </div>
                      <Button size="sm" className="ml-auto">
                        Seguir
                      </Button>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-4 p-4">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="@joaocosta" />
                        <AvatarFallback>JC</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                        <div className="font-semibold">João Costa</div>
                        <div className="text-sm text-muted-foreground">@joaocosta</div>
                      </div>
                      <Button size="sm" className="ml-auto">
                        Seguir
                      </Button>
                    </CardHeader>
                  </Card>
                </div>
              </div>
              <div>
                <h2 className="mb-4 text-lg font-semibold">Comunidades</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-4 p-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="r/Computação" />
                        <AvatarFallback className="bg-blue-600 text-white">CP</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                        <div className="font-semibold">r/Computação</div>
                        <div className="text-sm text-muted-foreground">5.2k membros</div>
                      </div>
                      <Button size="sm" className="ml-auto">
                        Participar
                      </Button>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-4 p-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="r/Engenharia" />
                        <AvatarFallback className="bg-red-600 text-white">EG</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                        <div className="font-semibold">r/Engenharia</div>
                        <div className="text-sm text-muted-foreground">4.8k membros</div>
                      </div>
                      <Button size="sm" className="ml-auto">
                        Participar
                      </Button>
                    </CardHeader>
                  </Card>
                </div>
              </div>
              <div>
                <h2 className="mb-4 text-lg font-semibold">Posts</h2>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/placeholder.svg?height=24&width=24" alt="@mariasilva" />
                          <AvatarFallback>MS</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">Maria Silva</span>
                        <span className="text-xs text-muted-foreground">em r/Computação</span>
                      </div>
                      <p className="text-sm">
                        Pessoal, alguém sabe se as inscrições para o Hackathon de IA já estão abertas? O site da UFRJ
                        não está atualizando as informações. 🤔
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/placeholder.svg?height=24&width=24" alt="@joaocosta" />
                          <AvatarFallback>JC</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">João Costa</span>
                        <span className="text-xs text-muted-foreground">em r/Engenharia</span>
                      </div>
                      <p className="text-sm">
                        Acabei de receber a notícia que nosso projeto de Engenharia Sustentável foi aprovado para a fase
                        final da competição nacional! 🎉
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="posts" className="mt-6 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg?height=24&width=24" alt="@mariasilva" />
                      <AvatarFallback>MS</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">Maria Silva</span>
                    <span className="text-xs text-muted-foreground">em r/Computação</span>
                  </div>
                  <p className="text-sm">
                    Pessoal, alguém sabe se as inscrições para o Hackathon de IA já estão abertas? O site da UFRJ não
                    está atualizando as informações. 🤔
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg?height=24&width=24" alt="@joaocosta" />
                      <AvatarFallback>JC</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">João Costa</span>
                    <span className="text-xs text-muted-foreground">em r/Engenharia</span>
                  </div>
                  <p className="text-sm">
                    Acabei de receber a notícia que nosso projeto de Engenharia Sustentável foi aprovado para a fase
                    final da competição nacional! 🎉
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg?height=24&width=24" alt="@anacardoso" />
                      <AvatarFallback>AC</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">Ana Cardoso</span>
                    <span className="text-xs text-muted-foreground">em r/Medicina</span>
                  </div>
                  <p className="text-sm">
                    ATENÇÃO: O Hospital Universitário está com vagas abertas para estágio em diversas especialidades!
                    Inscrições até sexta-feira.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="pessoas" className="mt-6 grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="@mariasilva" />
                    <AvatarFallback>MS</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="font-semibold">Maria Silva</div>
                    <div className="text-sm text-muted-foreground">@mariasilva</div>
                  </div>
                  <Button size="sm" className="ml-auto">
                    Seguir
                  </Button>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="@joaocosta" />
                    <AvatarFallback>JC</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="font-semibold">João Costa</div>
                    <div className="text-sm text-muted-foreground">@joaocosta</div>
                  </div>
                  <Button size="sm" className="ml-auto">
                    Seguir
                  </Button>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="@anacardoso" />
                    <AvatarFallback>AC</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="font-semibold">Ana Cardoso</div>
                    <div className="text-sm text-muted-foreground">@anacardoso</div>
                  </div>
                  <Button size="sm" className="ml-auto">
                    Seguir
                  </Button>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="@rafaellima" />
                    <AvatarFallback>RL</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="font-semibold">Rafael Lima</div>
                    <div className="text-sm text-muted-foreground">@rafaellima</div>
                  </div>
                  <Button size="sm" className="ml-auto">
                    Seguir
                  </Button>
                </CardHeader>
              </Card>
            </TabsContent>
            <TabsContent value="comunidades" className="mt-6 grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="r/Computação" />
                    <AvatarFallback className="bg-blue-600 text-white">CP</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="font-semibold">r/Computação</div>
                    <div className="text-sm text-muted-foreground">5.2k membros</div>
                  </div>
                  <Button size="sm" className="ml-auto">
                    Participar
                  </Button>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="r/Engenharia" />
                    <AvatarFallback className="bg-red-600 text-white">EG</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="font-semibold">r/Engenharia</div>
                    <div className="text-sm text-muted-foreground">4.8k membros</div>
                  </div>
                  <Button size="sm" className="ml-auto">
                    Participar
                  </Button>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="r/Medicina" />
                    <AvatarFallback className="bg-green-600 text-white">MD</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="font-semibold">r/Medicina</div>
                    <div className="text-sm text-muted-foreground">3.9k membros</div>
                  </div>
                  <Button size="sm" className="ml-auto">
                    Participar
                  </Button>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="r/Direito" />
                    <AvatarFallback className="bg-purple-600 text-white">DR</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="font-semibold">r/Direito</div>
                    <div className="text-sm text-muted-foreground">3.5k membros</div>
                  </div>
                  <Button size="sm" className="ml-auto">
                    Participar
                  </Button>
                </CardHeader>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}


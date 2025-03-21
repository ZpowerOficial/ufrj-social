"use client"

import Link from "next/link"
import { ArrowLeft, Search, Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CommunitiesPage() {
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
          <h1 className="text-xl font-bold">Comunidades</h1>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="relative mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Pesquisar comunidades..." className="w-full pl-8 rounded-lg bg-muted" />
          </div>
          <Tabs defaultValue="todas" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="todas" className="flex-1">
                Todas
              </TabsTrigger>
              <TabsTrigger value="minhas" className="flex-1">
                Minhas Comunidades
              </TabsTrigger>
              <TabsTrigger value="recomendadas" className="flex-1">
                Recomendadas
              </TabsTrigger>
            </TabsList>
            <TabsContent value="todas" className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" alt="r/Computação" />
                    <AvatarFallback className="bg-blue-600 text-white">CP</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>r/Computação</CardTitle>
                    <CardDescription>5.2k membros</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Comunidade para estudantes e profissionais de Ciência da Computação, Engenharia de Software e áreas
                    afins.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2">
                    <Users className="h-4 w-4" />
                    Participar
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" alt="r/Engenharia" />
                    <AvatarFallback className="bg-red-600 text-white">EG</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>r/Engenharia</CardTitle>
                    <CardDescription>4.8k membros</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Espaço para discussões sobre todas as áreas da Engenharia: Civil, Elétrica, Mecânica, Química e
                    mais.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2">
                    <Users className="h-4 w-4" />
                    Participar
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" alt="r/Medicina" />
                    <AvatarFallback className="bg-green-600 text-white">MD</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>r/Medicina</CardTitle>
                    <CardDescription>3.9k membros</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Comunidade para estudantes e profissionais de Medicina compartilharem conhecimentos e experiências.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2">
                    <Users className="h-4 w-4" />
                    Participar
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" alt="r/Direito" />
                    <AvatarFallback className="bg-purple-600 text-white">DR</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>r/Direito</CardTitle>
                    <CardDescription>3.5k membros</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Fórum para discussões jurídicas, dúvidas sobre legislação e compartilhamento de materiais de estudo.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2">
                    <Users className="h-4 w-4" />
                    Participar
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" alt="r/UFRJ" />
                    <AvatarFallback className="bg-blue-600 text-white">UF</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>r/UFRJ</CardTitle>
                    <CardDescription>8.7k membros</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Comunidade oficial da UFRJ. Notícias, eventos, avisos e discussões gerais sobre a universidade.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full gap-2">
                    <Users className="h-4 w-4" />
                    Participando
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" alt="r/Estágios" />
                    <AvatarFallback className="bg-amber-600 text-white">ES</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>r/Estágios</CardTitle>
                    <CardDescription>6.3k membros</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Oportunidades de estágio, dicas para entrevistas e compartilhamento de experiências profissionais.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2">
                    <Users className="h-4 w-4" />
                    Participar
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="minhas" className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" alt="r/UFRJ" />
                    <AvatarFallback className="bg-blue-600 text-white">UF</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>r/UFRJ</CardTitle>
                    <CardDescription>8.7k membros</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Comunidade oficial da UFRJ. Notícias, eventos, avisos e discussões gerais sobre a universidade.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full gap-2">
                    <Users className="h-4 w-4" />
                    Participando
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" alt="r/Computação" />
                    <AvatarFallback className="bg-blue-600 text-white">CP</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>r/Computação</CardTitle>
                    <CardDescription>5.2k membros</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Comunidade para estudantes e profissionais de Ciência da Computação, Engenharia de Software e áreas
                    afins.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full gap-2">
                    <Users className="h-4 w-4" />
                    Participando
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="recomendadas" className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" alt="r/Engenharia" />
                    <AvatarFallback className="bg-red-600 text-white">EG</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>r/Engenharia</CardTitle>
                    <CardDescription>4.8k membros</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Espaço para discussões sobre todas as áreas da Engenharia: Civil, Elétrica, Mecânica, Química e
                    mais.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2">
                    <Users className="h-4 w-4" />
                    Participar
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" alt="r/Estágios" />
                    <AvatarFallback className="bg-amber-600 text-white">ES</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>r/Estágios</CardTitle>
                    <CardDescription>6.3k membros</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Oportunidades de estágio, dicas para entrevistas e compartilhamento de experiências profissionais.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2">
                    <Users className="h-4 w-4" />
                    Participar
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


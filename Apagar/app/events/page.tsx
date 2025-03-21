import Link from "next/link"
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, MapPin, Plus } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EventsPage() {
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
          <h1 className="text-xl font-bold">Eventos</h1>
          <Button size="sm" className="ml-auto gap-1">
            <Plus className="h-4 w-4" />
            Criar Evento
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Março 2023</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Mês anterior</span>
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Próximo mês</span>
              </Button>
            </div>
          </div>
          <Tabs defaultValue="proximos" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="proximos" className="flex-1">
                Próximos
              </TabsTrigger>
              <TabsTrigger value="meus" className="flex-1">
                Meus Eventos
              </TabsTrigger>
              <TabsTrigger value="passados" className="flex-1">
                Passados
              </TabsTrigger>
            </TabsList>
            <TabsContent value="proximos" className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Amanhã, 15:00
                    </CardDescription>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg?height=24&width=24" alt="r/Medicina" />
                      <AvatarFallback className="bg-green-600 text-white text-xs">MD</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">Palestra: IA na Medicina</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Auditório Central
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Palestra sobre as aplicações da Inteligência Artificial no diagnóstico médico e tratamentos
                    personalizados. Palestrante: Dr. Carlos Mendes (Hospital Universitário).
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">128 participantes</div>
                  <Button size="sm">Participar</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Sábado, 09:00
                    </CardDescription>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg?height=24&width=24" alt="r/Engenharia" />
                      <AvatarFallback className="bg-red-600 text-white text-xs">EG</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">Hackathon de Sustentabilidade</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Centro de Tecnologia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Desenvolva soluções tecnológicas para problemas ambientais em 48 horas. Prêmios para as melhores
                    ideias e oportunidade de incubação no Parque Tecnológico.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">75 participantes</div>
                  <Button size="sm">Participar</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Segunda, 14:00
                    </CardDescription>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg?height=24&width=24" alt="r/Artes" />
                      <AvatarFallback className="bg-orange-600 text-white text-xs">AR</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">Workshop de Fotografia</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Escola de Belas Artes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Aprenda técnicas de fotografia urbana com o fotógrafo premiado Ricardo Alves. Traga sua câmera ou
                    smartphone. Vagas limitadas.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">42 participantes</div>
                  <Button size="sm">Participar</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Quarta, 18:30
                    </CardDescription>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg?height=24&width=24" alt="r/Direito" />
                      <AvatarFallback className="bg-purple-600 text-white text-xs">DR</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">Debate: Reforma Tributária</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Faculdade de Direito
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Debate sobre os impactos da reforma tributária na economia brasileira. Participação de professores e
                    especialistas convidados.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">63 participantes</div>
                  <Button size="sm">Participar</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Sexta, 10:00
                    </CardDescription>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg?height=24&width=24" alt="r/UFRJ" />
                      <AvatarFallback className="bg-blue-600 text-white text-xs">UF</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">Feira de Estágios</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Centro de Convenções
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Mais de 50 empresas oferecendo vagas de estágio e trainee. Traga seu currículo e participe de
                    processos seletivos no local.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">215 participantes</div>
                  <Button size="sm">Participar</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Domingo, 16:00
                    </CardDescription>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg?height=24&width=24" alt="r/Música" />
                      <AvatarFallback className="bg-pink-600 text-white text-xs">MS</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">Concerto de Música Clássica</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Escola de Música
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Apresentação da Orquestra Sinfônica da UFRJ com obras de Mozart, Beethoven e compositores
                    brasileiros. Entrada gratuita.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">89 participantes</div>
                  <Button size="sm">Participar</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="meus" className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Sábado, 09:00
                    </CardDescription>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg?height=24&width=24" alt="r/Engenharia" />
                      <AvatarFallback className="bg-red-600 text-white text-xs">EG</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">Hackathon de Sustentabilidade</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Centro de Tecnologia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Desenvolva soluções tecnológicas para problemas ambientais em 48 horas. Prêmios para as melhores
                    ideias e oportunidade de incubação no Parque Tecnológico.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">75 participantes</div>
                  <Button variant="outline" size="sm">
                    Cancelar
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Sexta, 10:00
                    </CardDescription>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg?height=24&width=24" alt="r/UFRJ" />
                      <AvatarFallback className="bg-blue-600 text-white text-xs">UF</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">Feira de Estágios</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Centro de Convenções
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Mais de 50 empresas oferecendo vagas de estágio e trainee. Traga seu currículo e participe de
                    processos seletivos no local.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">215 participantes</div>
                  <Button variant="outline" size="sm">
                    Cancelar
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="passados" className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="opacity-70">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      15/02/2023, 13:00
                    </CardDescription>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg?height=24&width=24" alt="r/Computação" />
                      <AvatarFallback className="bg-blue-600 text-white text-xs">CP</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">Workshop de React</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Laboratório de Informática
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Introdução ao desenvolvimento web com React. Aprenda a criar interfaces modernas e responsivas com a
                    biblioteca mais popular do mercado.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">53 participantes</div>
                  <Button variant="outline" size="sm">
                    Ver fotos
                  </Button>
                </CardFooter>
              </Card>
              <Card className="opacity-70">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      10/02/2023, 18:00
                    </CardDescription>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg?height=24&width=24" alt="r/UFRJ" />
                      <AvatarFallback className="bg-blue-600 text-white text-xs">UF</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">Aula Inaugural</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Auditório Principal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Cerimônia de boas-vindas aos novos alunos com apresentação dos departamentos, projetos de extensão e
                    oportunidades acadêmicas.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">312 participantes</div>
                  <Button variant="outline" size="sm">
                    Ver fotos
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


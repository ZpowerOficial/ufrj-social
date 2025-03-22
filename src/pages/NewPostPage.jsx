import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { createPost, getCommunities } from '../lib/api.js';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/ui/use-toast';

// Componentes UI modernos
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Switch } from '../components/ui/Switch';
import { 
  Loader2, 
  ImageIcon, 
  LinkIcon, 
  EyeIcon, 
  PencilIcon,
  Code,
  Bold,
  Italic,
  List,
  ListOrdered,
  Upload,
  AlertCircle
} from 'lucide-react';

export default function NewPostPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { communitySlug } = useParams();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [communities, setCommunities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('editar');
  const [imageUrl, setImageUrl] = useState('');
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Formatar data atual para placeholder
  const today = new Date();
  const dateOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  const formattedDate = today.toLocaleDateString('pt-BR', dateOptions);

  useEffect(() => {
    async function fetchCommunities() {
      try {
        setIsLoading(true);
        const data = await getCommunities();
        setCommunities(data || []);
        
        // Se o slug da comunidade foi passado como parâmetro, pré-selecionar
        if (communitySlug && data) {
          const targetCommunity = data.find(c => c.slug === communitySlug);
          if (targetCommunity) {
            setCommunityId(targetCommunity.id);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar comunidades:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as comunidades",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchCommunities();
  }, [communitySlug]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = "O título é obrigatório";
    } else if (title.length < 5) {
      newErrors.title = "O título deve ter ao menos 5 caracteres";
    }
    
    if (!content.trim()) {
      newErrors.content = "O conteúdo é obrigatório";
    } else if (content.length < 10) {
      newErrors.content = "O conteúdo deve ter ao menos 10 caracteres";
    }
    
    if (!communityId) {
      newErrors.community = "Selecione uma comunidade";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Campos incompletos",
        description: "Verifique os campos obrigatórios e tente novamente",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const postData = {
        title,
        content,
        community_id: communityId,
        author_id: isAnonymous ? null : user.id,
        image_url: imageUrl || null
      };
      
      const newPost = await createPost(postData);
      
      toast({
        title: "Publicação criada!",
        description: "Sua publicação foi criada com sucesso"
      });
      
      // Redirecionar para o post criado ou para a página da comunidade
      if (communitySlug) {
        navigate(`/community/${communitySlug}`);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Erro ao criar publicação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a publicação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleFormatClick = (format) => {
    // Implementar formatação básica (simulando)
    let updatedContent = content;
    
    switch (format) {
      case 'bold':
        updatedContent += '**texto em negrito**';
        break;
      case 'italic':
        updatedContent += '_texto em itálico_';
        break;
      case 'list':
        updatedContent += '\n- Item da lista\n- Outro item';
        break;
      case 'orderedList':
        updatedContent += '\n1. Primeiro item\n2. Segundo item';
        break;
      case 'code':
        updatedContent += '\n```\ncode block\n```';
        break;
      case 'link':
        updatedContent += '[texto do link](URL)';
        break;
      default:
        break;
    }
    
    setContent(updatedContent);
  };
  
  const handleImageUpload = (e) => {
    // Simulando upload de imagem
    setIsImageUploading(true);
    setTimeout(() => {
      setImageUrl('https://exemplo.com/imagem.jpg');
      setIsImageUploading(false);
      toast({
        title: "Imagem enviada",
        description: "A imagem foi anexada à sua postagem"
      });
    }, 1500);
  };
  
  // Converter markdown para HTML básico (simplificado)
  const renderMarkdown = (text) => {
    if (!text) return '';
    
    // Converter negrito
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Converter itálico
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Converter quebras de linha
    html = html.replace(/\n/g, '<br>');
    
    return html;
  };
  
  const getSelectedCommunity = () => {
    return communities.find(c => c.id === communityId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Criar Nova Publicação</h1>
        <div className="flex items-center gap-2">
          {communitySlug && (
            <Button variant="outline" className="gap-2" asChild>
              <Link to={`/community/${communitySlug}`}>
                Voltar à Comunidade
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Nova Publicação</CardTitle>
              <CardDescription>
                Compartilhe ideias, dúvidas, anúncios ou notícias com a comunidade
              </CardDescription>
            </CardHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="editar" className="gap-2">
                    <PencilIcon className="h-4 w-4" />
                    Editar
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2">
                    <EyeIcon className="h-4 w-4" />
                    Visualizar
                  </TabsTrigger>
                </TabsList>
              </div>
            
              <form onSubmit={handleSubmit}>
                <TabsContent value="editar" className="mt-0">
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="flex items-center gap-1">
                        Título
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Um título claro e objetivo"
                        className={errors.title ? "border-destructive" : ""}
                      />
                      {errors.title && (
                        <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.title}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="content" className="flex items-center gap-1">
                          Conteúdo
                          <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex items-center gap-1 flex-wrap">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            onClick={() => handleFormatClick('bold')}
                          >
                            <Bold className="h-4 w-4" />
                            <span className="sr-only">Negrito</span>
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            onClick={() => handleFormatClick('italic')}
                          >
                            <Italic className="h-4 w-4" />
                            <span className="sr-only">Itálico</span>
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            onClick={() => handleFormatClick('list')}
                          >
                            <List className="h-4 w-4" />
                            <span className="sr-only">Lista</span>
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            onClick={() => handleFormatClick('orderedList')}
                          >
                            <ListOrdered className="h-4 w-4" />
                            <span className="sr-only">Lista Numerada</span>
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            onClick={() => handleFormatClick('code')}
                          >
                            <Code className="h-4 w-4" />
                            <span className="sr-only">Código</span>
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            onClick={() => handleFormatClick('link')}
                          >
                            <LinkIcon className="h-4 w-4" />
                            <span className="sr-only">Link</span>
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Compartilhe seu pensamento, dúvida ou ideia..."
                        rows={10}
                        className={errors.content ? "border-destructive" : ""}
                      />
                      {errors.content && (
                        <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.content}
                        </p>
                      )}
                    </div>
                    
                    <div className="pt-2 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="flex-1">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="gap-2"
                          onClick={handleImageUpload}
                          disabled={isImageUploading}
                        >
                          {isImageUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          Adicionar Imagem
                        </Button>
                        {imageUrl && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Uma imagem foi anexada
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          id="anonymous"
                          checked={isAnonymous}
                          onCheckedChange={setIsAnonymous}
                        />
                        <Label htmlFor="anonymous" className="cursor-pointer">
                          Publicar anonimamente
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="preview" className="mt-0">
                  <CardContent className="pt-4">
                    <Card className="border shadow-sm">
                      <CardHeader>
                        <CardTitle>{title || "Título da sua publicação"}</CardTitle>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            {!isAnonymous ? (
                              <>
                                <Avatar className="h-6 w-6">
                                  <AvatarImage 
                                    src={profile?.avatar_url} 
                                    alt={profile?.display_name || "Usuário"} 
                                  />
                                  <AvatarFallback>
                                    {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{profile?.display_name || "Seu nome"}</span>
                              </>
                            ) : (
                              <>
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>A</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">Anônimo</span>
                              </>
                            )}
                          </div>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{formattedDate}</span>
                          
                          {getSelectedCommunity() && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <Badge variant="outline" className="rounded-sm">
                                {getSelectedCommunity().name}
                              </Badge>
                            </>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        {imageUrl && (
                          <div className="rounded-md overflow-hidden mb-4 bg-muted/50 border aspect-video flex items-center justify-center">
                            <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                          </div>
                        )}
                        
                        <div 
                          className="prose prose-sm max-w-none dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) || "O conteúdo da sua postagem aparecerá aqui..." }}
                        ></div>
                      </CardContent>
                    </Card>
                    <div className="text-center mt-4 text-muted-foreground text-sm">
                      <p>Este é apenas um preview de como sua publicação aparecerá</p>
                    </div>
                  </CardContent>
                </TabsContent>
              
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || isLoading}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publicando...
                      </>
                    ) : (
                      'Publicar'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Tabs>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Comunidade</CardTitle>
              <CardDescription>Selecione onde publicar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="community" className="flex items-center gap-1">
                  Escolha uma comunidade
                  <span className="text-destructive">*</span>
                </Label>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Carregando comunidades...</span>
                  </div>
                ) : (
                  <>
                    <select
                      id="community"
                      value={communityId}
                      onChange={(e) => setCommunityId(e.target.value)}
                      className={`flex h-10 w-full rounded-md border ${errors.community ? "border-destructive" : "border-input"} bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                    >
                      <option value="">Selecione uma comunidade</option>
                      {communities.map((community) => (
                        <option key={community.id} value={community.id}>
                          {community.name}
                        </option>
                      ))}
                    </select>
                    {errors.community && (
                      <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.community}
                      </p>
                    )}
                  </>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 items-start">
              <div className="text-sm text-muted-foreground">
                <h3 className="font-medium text-foreground mb-1">Dicas para uma boa publicação:</h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Escolha um título descritivo e claro</li>
                  <li>Forneça detalhes suficientes no conteúdo</li>
                  <li>Seja respeitoso com todos os membros</li>
                  <li>Verifique se está na comunidade correta</li>
                </ul>
              </div>
              
              <div className="w-full pt-2 border-t">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/communities">
                    Ver todas as comunidades
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
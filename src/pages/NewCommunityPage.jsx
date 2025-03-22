import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCommunity } from '../lib/api';
import { toast } from '../components/ui/use-toast';

// Componentes de UI
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/Textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { AlertCircle } from 'lucide-react';

export default function NewCommunityPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Gerar slug a partir do nome
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    
    // Gerar slug automaticamente quando o usuário digitar o nome
    const newSlug = newName
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')  // Remove caracteres especiais
      .replace(/\s+/g, '-');     // Substitui espaços por hífens
      
    setSlug(newSlug);
  };

  // Validar os campos do formulário
  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Nome da comunidade é obrigatório';
    }
    
    if (!slug.trim()) {
      newErrors.slug = 'Slug da comunidade é obrigatório';
    } else if (!/^[a-z0-9\-]+$/.test(slug)) {
      newErrors.slug = 'Slug deve conter apenas letras minúsculas, números e hífens';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Descrição da comunidade é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para criar a comunidade
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Criar comunidade com os dados do formulário
      const communityData = {
        name,
        slug,
        description,
        icon_url: iconUrl || null,
        banner_url: bannerUrl || null
      };
      
      const newCommunity = await createCommunity(communityData);
      
      toast({
        title: "Comunidade criada com sucesso!",
        description: `A comunidade ${name} foi criada.`
      });
      
      // Redirecionar para a página da nova comunidade
      navigate(`/community/${slug}`);
    } catch (error) {
      console.error('Erro ao criar comunidade:', error);
      
      // Tratamento de erros específicos
      if (error.message === 'slug_already_exists' || 
          error.message.includes('unique constraint') || 
          (error.code && error.code === '23505')) {
        setErrors({
          ...errors,
          slug: 'Este slug já está em uso. Escolha outro nome para sua comunidade.'
        });
        
        toast({
          title: "Erro ao criar comunidade",
          description: "Este slug já está em uso. Escolha outro nome para sua comunidade.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro ao criar comunidade",
          description: "Não foi possível criar a comunidade. Tente novamente.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Criar Nova Comunidade</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Informações da Comunidade</CardTitle>
          <CardDescription>
            Preencha os dados para criar sua comunidade na UFRJ Hub
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="appearance">Aparência</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit}>
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nome da Comunidade
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Ex: Engenharia de Computação UFRJ"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">
                    Slug da Comunidade
                    <span className="text-destructive">*</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      (será usado na URL)
                    </span>
                  </Label>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-1">/community/</span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^\w\-]/g, ''))}
                      placeholder="engenharia-computacao"
                      className={`${errors.slug ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.slug && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.slug}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Descrição
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva sua comunidade..."
                    rows={4}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Uma boa descrição ajuda as pessoas a entenderem o propósito da sua comunidade.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="appearance" className="space-y-4 mt-4">
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-md mb-4">
                  <p className="text-amber-700 dark:text-amber-400 text-sm">
                    <strong>Nota:</strong> O upload de imagens não está disponível no momento. 
                    As URLs de ícone e banner serão ignoradas ao criar a comunidade.
                  </p>
                </div>
                
                <div className="space-y-2 opacity-60">
                  <Label htmlFor="icon_url">URL do Ícone (não suportado)</Label>
                  <Input
                    id="icon_url"
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    placeholder="https://exemplo.com/icone.png"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    URL para uma imagem quadrada que será usada como ícone da comunidade.
                  </p>
                </div>
                
                <div className="space-y-2 opacity-60">
                  <Label htmlFor="banner_url">URL do Banner (não suportado)</Label>
                  <Input
                    id="banner_url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://exemplo.com/banner.jpg"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    URL para uma imagem de capa que será exibida no topo da página da comunidade.
                  </p>
                </div>
                
                <div className="rounded-md border p-4 mt-4 opacity-60">
                  <h3 className="font-medium mb-2">Dicas para futuras implementações:</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Use um ícone quadrado com pelo menos 128x128 pixels</li>
                    <li>O banner deve ter proporção 3:1 (ex: 1200x400 pixels)</li>
                    <li>Formatos recomendados: PNG ou JPG</li>
                    <li>Tamanho máximo: 2MB por imagem</li>
                  </ul>
                </div>
              </TabsContent>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/communities')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Comunidade'}
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 
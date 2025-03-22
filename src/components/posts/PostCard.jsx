import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, BookmarkIcon, MoreVertical, AlertTriangle, Flag, Copy, ExternalLink, Eye, Trash2, SendHorizontal } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { deletePost, createComment, getPostComments } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { toast } from '../../components/ui/use-toast';

// Componentes de UI
import { Avatar, AvatarImage, AvatarFallback } from '../ui/Avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/Badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/Textarea';
import { Loader } from '../ui/Loader';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';

export default function PostCard({ post, onUpdate }) {
  const {
    id,
    title,
    content,
    created_at,
    upvotes = 0,
    downvotes = 0,
    comment_count = 0,
    author,
    community,
    image_url,
    is_pinned,
    is_anonymous,
    tags = [],
  } = post;

  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(upvotes || 0);
  const [dislikeCount, setDislikeCount] = useState(downvotes || 0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const score = likeCount - dislikeCount;
  const scoreColor = score > 0 ? 'text-primary' : score < 0 ? 'text-destructive' : 'text-muted-foreground';
  const isAuthor = user && author && user.id === author.id;

  useEffect(() => {
    // Verificar se o usuário é administrador da comunidade
    const checkIsAdmin = async () => {
      if (user && community?.id) {
        try {
          const { data } = await supabase
            .from('community_members')
            .select('role')
            .eq('community_id', community.id)
            .eq('user_id', user.id)
            .single();
          
          setIsAdmin(data?.role === 'owner' || data?.role === 'admin');
        } catch (error) {
          console.error('Erro ao verificar papel do usuário:', error);
        }
      }
    };

    checkIsAdmin();
  }, [user, community]);

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
    });
  };
  
  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Você precisa estar logado para curtir posts",
        variant: "destructive"
      });
      return;
    }

    try {
      // Atualização otimista da UI
      if (liked) {
        setLikeCount(prev => prev - 1);
        setLiked(false);
      } else {
        if (disliked) {
          setDislikeCount(prev => prev - 1);
          setDisliked(false);
        }
        setLikeCount(prev => prev + 1);
        setLiked(true);
      }

      await likePost(id);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Erro ao curtir post:", error);
      toast({
        title: "Não foi possível curtir o post",
        variant: "destructive"
      });
      // Reverter mudanças em caso de erro
      setLikeCount(upvotes || 0);
      setDislikeCount(downvotes || 0);
    }
  };
  
  const handleDislike = async () => {
    if (!user) {
      toast({
        title: "Você precisa estar logado para descurtir posts",
        variant: "destructive"
      });
      return;
    }

    try {
      // Atualização otimista da UI
      if (disliked) {
        setDislikeCount(prev => prev - 1);
        setDisliked(false);
      } else {
        if (liked) {
          setLikeCount(prev => prev - 1);
          setLiked(false);
        }
        setDislikeCount(prev => prev + 1);
        setDisliked(true);
      }

      await dislikePost(id);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Erro ao descurtir post:", error);
      toast({
        title: "Não foi possível descurtir o post",
        variant: "destructive"
      });
      // Reverter mudanças em caso de erro
      setLikeCount(upvotes || 0);
      setDislikeCount(downvotes || 0);
    }
  };
  
  const handleShare = () => {
    setIsShareDialogOpen(true);
  };

  const handleDeletePost = async () => {
    try {
      setIsDeleting(true);
      
      // Verificar se o usuário é autor ou admin antes de excluir
      if (!isAuthor && !isAdmin) {
        toast({
          title: "Permissão negada",
          description: "Você não tem permissão para excluir esta postagem",
          variant: "destructive"
        });
        return;
      }
      
      await deletePost(id);
      
      toast({
        title: "Postagem excluída",
        description: "A postagem foi excluída com sucesso",
      });
      
      if (typeof onUpdate === 'function') {
        onUpdate();
      }
      
      // Fechar o diálogo
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir a postagem",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Converter markdown para HTML básico (simplificado)
  const renderMarkdown = (text) => {
    if (!text) return '';
    
    // Converter negrito
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Converter itálico
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Converter links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank">$1</a>');
    
    // Converter quebras de linha
    html = html.replace(/\n/g, '<br>');
    
    return html;
  };

  const navigate = useNavigate();

  const canDeletePost = isAuthor || isAdmin;

  const fetchComments = async () => {
    if (!isCommentsOpen) return;
    
    try {
      setLoadingComments(true);
      const commentData = await getPostComments(id);
      setComments(commentData || []);
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);
      toast({
        title: "Não foi possível carregar os comentários",
        variant: "destructive"
      });
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [isCommentsOpen, id]);

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Você precisa estar logado para comentar",
        variant: "destructive"
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "O comentário não pode estar vazio",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmittingComment(true);
      const comment = await createComment(id, newComment.trim());
      setComments([...comments, comment]);
      setNewComment("");
      toast({
        title: "Comentário adicionado",
      });
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      toast({
        title: "Não foi possível adicionar o comentário",
        variant: "destructive"
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Link copiado para a área de transferência",
        });
        setIsShareDialogOpen(false);
      })
      .catch(() => {
        toast({
          title: "Não foi possível copiar o link",
          variant: "destructive"
        });
      });
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-colors hover:bg-accent/5",
      is_pinned && "border-primary/50 bg-primary/5"
    )}>
      <CardHeader className="space-y-0 p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              {is_anonymous ? (
                <AvatarFallback>A</AvatarFallback>
              ) : (
                <>
                  <AvatarImage src={author?.avatar_url} alt={author?.display_name} />
                  <AvatarFallback name={author?.display_name || author?.email} />
                </>
              )}
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {is_anonymous ? (
                  <span className="font-medium">Anônimo</span>
                ) : (
                  <Link 
                    to={`/profile/${author?.id}`}
                    className="font-medium hover:underline"
                  >
                    {author?.display_name}
                    {author?.is_staff && (
                      <span className="ml-1 text-primary text-xs">(Funcionário)</span>
                    )}
                  </Link>
                )}
                <span className="text-muted-foreground">•</span>
                <Link 
                  to={`/community/${community?.slug}`}
                  className="text-primary hover:underline"
                >
                  {community?.name}
                </Link>
                {is_pinned && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <Badge variant="secondary" className="text-xs h-5 px-1">Fixado</Badge>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDate(created_at)}
              </p>
            </div>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Mais opções</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-1">
              <div className="grid gap-1">
                <Button variant="ghost" size="sm" className="h-8 justify-start gap-2 px-2 text-xs">
                  <BookmarkIcon className="h-3.5 w-3.5" />
                  Salvar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 justify-start gap-2 px-2 text-xs"
                  onClick={handleShare}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copiar link
                </Button>
                {canDeletePost && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <span className="flex w-full">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 justify-start gap-2 px-2 text-xs text-destructive w-full"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Excluir
                        </Button>
                      </span>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Excluir postagem</DialogTitle>
                        <DialogDescription>
                          Você tem certeza que deseja excluir esta postagem? Esta ação não pode ser desfeita.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsDialogOpen(false)}
                          disabled={isDeleting}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleDeletePost}
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Excluindo...' : 'Excluir'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                {!canDeletePost && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 justify-start gap-2 px-2 text-xs text-destructive"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    Denunciar
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <Link to={`/posts/${id}`} className="space-y-3">
          <h3 className="font-semibold leading-tight hover:underline">
            {title}
          </h3>
          
          {/* Imagem do post (se houver) */}
          {image_url && (
            <div className="relative rounded-md overflow-hidden bg-muted mb-3 aspect-video">
              <img
                src={image_url}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className={cn(
            "text-sm text-muted-foreground",
            !isExpanded && "line-clamp-3"
          )}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        </Link>
          
        {/* Botão para expandir o post */}
        {content.length > 100 && (
          <div className="text-right">
            <Button
              variant="link"
              className="text-blue-500 hover:text-blue-700 mt-1 px-0"
              onClick={() => navigate(`/post/${post.id}`)}
            >
              Ler mais
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8",
                liked && "text-primary"
              )}
              onClick={handleLike}
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="sr-only">Curtir</span>
            </Button>
            <span className={`text-sm font-medium ${scoreColor}`}>
              {score}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8",
                disliked && "text-destructive"
              )}
              onClick={handleDislike}
            >
              <ThumbsDown className="h-4 w-4" />
              <span className="sr-only">Não curtir</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="h-8 gap-2" onClick={() => navigate(`/posts/${id}#comments`)}>
            <span className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">{comment_count || 0}</span>
              <span className="sr-only">Comentários</span>
            </span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 ml-auto"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Compartilhar</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
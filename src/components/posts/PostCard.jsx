import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, BookmarkIcon, MoreVertical, AlertTriangle, Flag, Copy, ExternalLink, Eye } from 'lucide-react';

// Componentes de UI
import { Avatar, AvatarImage, AvatarFallback } from '../ui/Avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/Badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { toast } from '../ui/use-toast';
import { cn } from '../../lib/utils';

export default function PostCard({ post }) {
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

  const [isExpanded, setIsExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(upvotes || 0);
  const [dislikeCount, setDislikeCount] = useState(downvotes || 0);
  
  const score = likeCount - dislikeCount;
  const scoreColor = score > 0 ? 'text-primary' : score < 0 ? 'text-destructive' : 'text-muted-foreground';

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
    });
  };
  
  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      setLiked(true);
      setLikeCount(prev => prev + 1);
      if (disliked) {
        setDisliked(false);
        setDislikeCount(prev => prev - 1);
      }
    }
  };
  
  const handleDislike = () => {
    if (disliked) {
      setDisliked(false);
      setDislikeCount(prev => prev - 1);
    } else {
      setDisliked(true);
      setDislikeCount(prev => prev + 1);
      if (liked) {
        setLiked(false);
        setLikeCount(prev => prev - 1);
      }
    }
  };
  
  const handleShare = () => {
    // Simular compartilhamento
    navigator.clipboard.writeText(`${window.location.origin}/posts/${id}`);
    toast({
      title: "Link copiado!",
      description: "O link da postagem foi copiado para a área de transferência"
    });
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 justify-start gap-2 px-2 text-xs text-destructive"
                >
                  <Flag className="h-3.5 w-3.5" />
                  Denunciar
                </Button>
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
          
        {content.length > 200 && !isExpanded && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-0 mt-3 text-xs text-muted-foreground hover:text-primary"
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded(true);
            }}
          >
            <span>Ler mais</span>
            <Eye className="ml-1 h-3 w-3" />
          </Button>
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
          <Button variant="ghost" size="sm" className="h-8 gap-2" asChild>
            <Link to={`/posts/${id}#comments`}>
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">{comment_count || 0}</span>
                <span className="sr-only">Comentários</span>
              </span>
            </Link>
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
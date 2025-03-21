import React from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageSquare, Share } from 'lucide-react';

// Componentes de UI
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';

export default function PostCard({ post }) {
  // Função para formatar a data de criação para exibição relativa (como "2h atrás")
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return postDate.toLocaleDateString();
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        <Avatar>
          <AvatarImage 
            src={post.author?.avatar_url} 
            alt={post.author?.display_name || 'Usuário'} 
          />
          <AvatarFallback>
            {post.author?.display_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{post.author?.display_name || 'Usuário'}</span>
            <span className="text-sm text-muted-foreground">@{post.author?.username || 'usuario'}</span>
            <span className="text-sm text-muted-foreground">· {formatDate(post.created_at)}</span>
          </div>
          <Link to={`/community/${post.community?.id}`} className="text-sm text-primary hover:underline">
            r/{post.community?.name || 'Comunidade'}
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <Link to={`/post/${post.id}`}>
          <h2 className="text-lg font-semibold mt-1 hover:text-primary">{post.title}</h2>
        </Link>
        <div className="mt-2 text-gray-700">
          {post.content}
        </div>
        {post.media && post.media.length > 0 && (
          <div className="mt-4 rounded-lg overflow-hidden">
            <img
              src={post.media[0].url}
              alt={post.title}
              className="w-full object-cover max-h-80"
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-primary">
            <ThumbsUp className="h-4 w-4" />
            <span>{post.upvotes || 0}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-primary" asChild>
            <Link to={`/post/${post.id}`}>
              <MessageSquare className="h-4 w-4" />
              <span>{post.comment_count || 0}</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-primary">
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
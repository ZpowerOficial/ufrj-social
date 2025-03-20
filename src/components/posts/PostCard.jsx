import React from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

export default function PostCard({ post }) {
  // Função para formatar a data de criação para exibição
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' }).format(
      Math.round((date - new Date()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 mb-4">
      <div className="flex items-start space-x-2">
        <div className="w-8 h-8 rounded-full bg-ufrj-blue text-white flex items-center justify-center">
          {post.author?.display_name?.charAt(0) || '?'}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center text-sm text-gray-500">
            <span className="font-medium text-gray-900">{post.author?.display_name || 'Usuário'}</span>
            <span className="mx-1">•</span>
            <span>{formatDate(post.created_at)}</span>
            <span className="mx-1">•</span>
            <Link to={`/community/${post.community?.slug}`} className="text-ufrj-blue hover:underline">
              {post.community?.name || 'Comunidade'}
            </Link>
          </div>
          
          <Link to={`/post/${post.id}`}>
            <h2 className="text-lg font-semibold mt-1 hover:text-ufrj-blue">{post.title}</h2>
          </Link>
          
          <div className="mt-2 text-gray-700 line-clamp-3">
            {post.content}
          </div>
          
          <div className="mt-3 flex items-center space-x-4 text-gray-500">
            <button className="flex items-center space-x-1 hover:text-green-600">
              <ThumbsUp size={16} />
              <span>{post.upvotes || 0}</span>
            </button>
            
            <button className="flex items-center space-x-1 hover:text-red-600">
              <ThumbsDown size={16} />
              <span>{post.downvotes || 0}</span>
            </button>
            
            <Link to={`/post/${post.id}`} className="flex items-center space-x-1 hover:text-ufrj-blue">
              <MessageSquare size={16} />
              <span>{post.comment_count || 0} comentários</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
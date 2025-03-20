import React, { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout';
import PostCard from './PostCard';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    fetchPosts();
    fetchCommunities();
  }, []);

  async function fetchPosts() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, 
          title, 
          content, 
          created_at, 
          upvotes, 
          downvotes,
          author_id,
          community_id,
          communities(id, name, slug),
          profiles(id, display_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Reformatar os dados para facilitar o uso no componente
      const formattedPosts = data.map(post => ({
        ...post,
        author: post.profiles,
        community: post.communities
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      setError('Não foi possível carregar os posts. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCommunities() {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('id, name, slug, description')
        .limit(5);

      if (error) throw error;
      setCommunities(data);
    } catch (error) {
      console.error('Erro ao buscar comunidades:', error);
    }
  }

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Barra lateral esquerda */}
        <div className="md:w-64 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold text-lg mb-2">Comunidades</h2>
            <ul className="space-y-1">
              {communities.map(community => (
                <li key={community.id}>
                  <a 
                    href={`/community/${community.slug}`} 
                    className="block p-2 hover:bg-gray-100 rounded"
                  >
                    {community.name}
                  </a>
                </li>
              ))}
              <li>
                <a 
                  href="/communities" 
                  className="block p-2 text-ufrj-blue hover:underline"
                >
                  Ver todas as comunidades
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Conteúdo principal */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h1 className="font-bold text-2xl">Feed Principal</h1>
            <p className="text-gray-600">Últimos posts da comunidade UFRJ</p>
          </div>
          
          {user && (
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <a 
                href="/new-post" 
                className="block bg-ufrj-blue text-white text-center py-2 px-4 rounded"
              >
                Criar Novo Post
              </a>
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-8">Carregando posts...</div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-lg">Nenhum post encontrado.</p>
              <p className="text-gray-600 mt-2">Seja o primeiro a criar um post!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
        
        {/* Barra lateral direita */}
        <div className="md:w-64 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold text-lg mb-2">Sobre UFRJ Social</h2>
            <p className="text-sm text-gray-600">
              Uma plataforma descentralizada para a comunidade da UFRJ compartilhar 
              conhecimento, encontrar recursos e se conectar.
            </p>
          </div>
          
          {!user && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-lg mb-2">Junte-se à UFRJ Social</h2>
              <p className="text-sm text-gray-600 mb-3">
                Crie uma conta para participar da comunidade.
              </p>
              <a 
                href="/register" 
                className="block bg-ufrj-blue text-white text-center py-2 px-4 rounded"
              >
                Criar Conta
              </a>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
import { supabase } from './supabase';

/**
 * Fetch posts with optional filtering and sorting
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of posts
 */
export const getPosts = async (options = {}) => {
  try {
    const { 
      limit = 10, 
      community = null, 
      sort = 'created_at.desc',
      following = false 
    } = options;
    
    let query = supabase
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
        profiles(id, display_name, username, avatar_url)
      `)
      .limit(limit)
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (community) {
      query = query.eq('community_id', community);
    }
    
    // TODO: Implement following filter when auth is set up
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Reformat the data to make it easier to use
    return data.map(post => ({
      ...post,
      author: post.profiles,
      community: post.communities,
      comment_count: 0 // Valor padrão já que a coluna não existe
    }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

/**
 * Fetch communities
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of communities
 */
export const getCommunities = async (options = {}) => {
  try {
    const { limit = 20, category = null } = options;
    
    let query = supabase
      .from('communities')
      .select(`
        *,
        community_members!inner (
          user_id
        )
      `)
      .limit(limit);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching communities:', error);
    throw error;
  }
};

/**
 * Get a single post by ID
 * @param {string} id - Post ID
 * @returns {Promise<Object>} - Post data
 */
export const getPost = async (id) => {
  try {
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
        profiles(id, display_name, username, avatar_url)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      author: data.profiles,
      community: data.communities
    };
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @returns {Promise<Object>} - New post
 */
export const createPost = async (postData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Remove campos que podem não existir no banco de dados
    const { image_url, ...cleanPostData } = postData;
    
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          ...cleanPostData,
          author_id: user.id
        }
      ])
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

/**
 * Vote on a post (upvote/downvote)
 * @param {string} postId - Post ID
 * @param {string} voteType - 'up' or 'down'
 * @returns {Promise<Object>} - Updated post
 */
export const votePost = async (postId, voteType) => {
  try {
    const post = await getPost(postId);
    
    const updates = {};
    if (voteType === 'up') {
      updates.upvotes = (post.upvotes || 0) + 1;
    } else if (voteType === 'down') {
      updates.downvotes = (post.downvotes || 0) + 1;
    }
    
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error(`Error voting on post ${postId}:`, error);
    throw error;
  }
};

/**
 * Join a community
 * @param {string} communityId - Community UUID
 * @returns {Promise<boolean>} - Success status
 */
export const joinCommunity = async (communityId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('community_members')
      .insert({
        community_id: communityId,
        user_id: user.id
      });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error joining community:', error);
    return false;
  }
};

/**
 * Leave a community
 * @param {string} communityId - Community UUID
 * @returns {Promise<boolean>} - Success status
 */
export const leaveCommunity = async (communityId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('community_members')
      .delete()
      .match({
        community_id: communityId,
        user_id: user.id
      });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error leaving community:', error);
    return false;
  }
};

/**
 * Check if user is member of a community
 * @param {string} communityId - Community UUID
 * @returns {Promise<boolean>} - Membership status
 */
export const isCommunityMember = async (communityId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('community_members')
      .select('*')
      .match({
        community_id: communityId,
        user_id: user.id
      })
      .single();

    if (error) throw error;

    return !!data;
  } catch (error) {
    console.error('Error checking community membership:', error);
    return false;
  }
};

/**
 * Get a single community by slug
 * @param {string} slug - Community slug
 * @returns {Promise<Object>} - Community data
 */
export const getCommunity = async (slug) => {
  try {
    const { data, error } = await supabase
      .from('communities')
      .select(`
        *,
        community_members(user_id)
      `)
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error fetching community ${slug}:`, error);
    throw error;
  }
};

/**
 * Fetch posts for a specific community
 * @param {string} communityId - Community ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of posts
 */
export const getCommunityPosts = async (communityId, options = {}) => {
  try {
    const { 
      limit = 20, 
      sort = 'created_at.desc'
    } = options;
    
    let query = supabase
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
        profiles(id, display_name, username, avatar_url)
      `)
      .eq('community_id', communityId)
      .limit(limit)
      .order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Reformat the data to make it easier to use
    return data.map(post => ({
      ...post,
      author: post.profiles,
      community: post.communities,
      comment_count: Math.floor(Math.random() * 10) // Simulação até implementarmos comentários
    }));
  } catch (error) {
    console.error('Error fetching community posts:', error);
    throw error;
  }
};

/**
 * Create a new community
 * @param {Object} communityData - Community data to create
 * @returns {Promise<Object>} - Created community
 */
export const createCommunity = async (communityData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Verificar se o slug já existe
    const { data: existingCommunity } = await supabase
      .from('communities')
      .select('slug')
      .eq('slug', communityData.slug)
      .single();

    if (existingCommunity) {
      throw new Error('slug_already_exists');
    }
    
    // Remover campos que podem não existir na tabela
    const cleanedData = { ...communityData };
    delete cleanedData.banner_url;
    delete cleanedData.icon_url;
    
    const { data, error } = await supabase
      .from('communities')
      .insert([
        {
          ...cleanedData,
          created_by: user.id
        }
      ])
      .select();
    
    if (error) {
      console.error('Erro SQL ao criar comunidade:', error);
      if (error.code === '23505') { // Código para unique_violation no PostgreSQL
        throw new Error('slug_already_exists');
      }
      throw error;
    }
    
    // Automaticamente adicionar o criador como membro
    if (data && data[0]) {
      await joinCommunity(data[0].id);
      return data[0];
    } else {
      throw new Error('Falha ao criar comunidade: resposta vazia');
    }
  } catch (error) {
    console.error('Error creating community:', error);
    throw error;
  }
};

/**
 * Get a single community by ID
 * @param {string} id - Community ID
 * @returns {Promise<Object>} - Community data
 */
export const getCommunityById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error fetching community ${id}:`, error);
    throw error;
  }
};

/**
 * Get the general UFRJ community
 * @returns {Promise<Object>} - UFRJ general community data
 */
export const getUFRJGeneralCommunity = async () => {
  // Buscar comunidade geral da UFRJ
  const { data, error } = await supabase
    .from('communities')
    .select('id, name, description, slug, is_official')
    .eq('slug', 'ufrj-geral')
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar comunidade geral da UFRJ:', error);
    throw error;
  }

  // Se não existir, criar
  if (!data) {
    try {
      return await createUFRJGeneralCommunity();
    } catch (err) {
      console.error('Erro ao criar comunidade geral da UFRJ:', err);
      throw err;
    }
  }

  return data;
};

/**
 * Create the general UFRJ community if it doesn't exist
 * @private
 * @returns {Promise<Object>} - Created UFRJ general community
 */
const createUFRJGeneralCommunity = async () => {
  // Criar comunidade geral da UFRJ
  const { data, error } = await supabase
    .from('communities')
    .insert({
      name: 'UFRJ Geral',
      description: 'Comunidade oficial geral da UFRJ. Aqui você encontra notícias, eventos e discussões sobre a universidade.',
      slug: 'ufrj-geral',
      is_official: true
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar comunidade geral da UFRJ:', error);
    throw error;
  }

  return data;
};

/**
 * Get communities that user has joined
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of communities
 */
export const getUserJoinedCommunities = async (userId) => {
  try {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('community_members')
      .select(`
        community_id,
        communities (
          id, 
          name, 
          slug, 
          description
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    // Reformat data para retornar apenas os objetos de comunidade
    return data.map(item => item.communities);
  } catch (error) {
    console.error('Error fetching user joined communities:', error);
    throw error;
  }
};

/**
 * Delete a post
 * @param {string} postId - Post ID
 * @returns {Promise<boolean>} - Success status
 */
export const deletePost = async (postId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Verificar se é o autor do post
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (post.author_id !== user.id) {
      throw new Error('Você não tem permissão para excluir este post');
    }

    // Excluir o post
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

/**
 * Add a comment to a post
 * @param {Object} commentData - Comment data
 * @param {string} commentData.post_id - Post ID
 * @param {string} commentData.content - Comment content
 * @param {string} commentData.parent_id - Parent comment ID (optional)
 * @returns {Promise<Object>} - Created comment
 */
export const addComment = async (commentData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { post_id, content, parent_id } = commentData;
    
    if (!post_id || !content) {
      throw new Error('Post ID e conteúdo são obrigatórios');
    }

    const comment = {
      post_id,
      content,
      author_id: user.id,
      ...(parent_id && { parent_id }),
    };

    const { data, error } = await supabase
      .from('comments')
      .insert(comment)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

/**
 * Get comments for a post
 * @param {string} postId - Post ID
 * @returns {Promise<Array>} - Array of comments
 */
export const getComments = async (postId) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles!author_id(id, display_name, avatar_url, username),
        replies:comments(
          id,
          content,
          created_at,
          author:profiles!author_id(id, display_name, avatar_url, username),
          upvotes,
          downvotes
        )
      `)
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

// Funções para eventos
export async function createEvent({ title, description, communityId, eventDate, location, isOnline, eventLink }) {
  try {
    const user = await getUser();
    if (!user) throw new Error("Não autenticado");

    const { data, error } = await supabase
      .from("events")
      .insert({
        title,
        description,
        community_id: communityId,
        creator_id: user.id,
        event_date: eventDate,
        location,
        is_online: isOnline,
        event_link: eventLink,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    throw error;
  }
}

export async function getEvents({ filter = "upcoming" } = {}) {
  try {
    const today = new Date().toISOString();
    
    let query = supabase
      .from("events")
      .select(`
        *,
        creator:creator_id(id, display_name, avatar_url),
        community:community_id(id, name, slug)
      `);

    if (filter === "upcoming") {
      query = query.gte("event_date", today);
    } else if (filter === "past") {
      query = query.lt("event_date", today);
    }
    
    query = query.order(filter === "upcoming" ? "event_date" : "event_date.desc");
    
    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    throw error;
  }
}

export async function getCommunityEvents(communityId, { filter = "upcoming" } = {}) {
  try {
    const today = new Date().toISOString();
    
    let query = supabase
      .from("events")
      .select(`
        *,
        creator:creator_id(id, display_name, avatar_url),
        community:community_id(id, name, slug)
      `)
      .eq("community_id", communityId);

    if (filter === "upcoming") {
      query = query.gte("event_date", today);
    } else if (filter === "past") {
      query = query.lt("event_date", today);
    }
    
    query = query.order(filter === "upcoming" ? "event_date" : "event_date.desc");
    
    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao buscar eventos da comunidade:", error);
    throw error;
  }
}

export async function getEvent(eventId) {
  try {
    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        creator:creator_id(id, display_name, avatar_url),
        community:community_id(id, name, slug),
        participants:event_participants(
          user_id,
          status,
          user:user_id(id, display_name, avatar_url)
        )
      `)
      .eq("id", eventId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao buscar evento:", error);
    throw error;
  }
}

export async function participateInEvent(eventId, status = "going") {
  try {
    const user = await getUser();
    if (!user) throw new Error("Não autenticado");

    const { data, error } = await supabase
      .from("event_participants")
      .upsert(
        {
          event_id: eventId,
          user_id: user.id,
          status,
        },
        { onConflict: "event_id,user_id" }
      )
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao participar do evento:", error);
    throw error;
  }
}

export async function removeEventParticipation(eventId) {
  try {
    const user = await getUser();
    if (!user) throw new Error("Não autenticado");

    const { error } = await supabase
      .from("event_participants")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Erro ao remover participação:", error);
    throw error;
  }
}

// Funções para comentários
export async function createComment(postId, content, parentId = null) {
  try {
    const user = await getUser();
    if (!user) throw new Error("Não autenticado");

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        author_id: user.id,
        content,
        parent_id: parentId,
      })
      .select(`
        *,
        author:author_id(id, display_name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao criar comentário:", error);
    throw error;
  }
}

export async function getPostComments(postId) {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        author:author_id(id, display_name, avatar_url),
        replies:comments!parent_id(
          *,
          author:author_id(id, display_name, avatar_url)
        )
      `)
      .eq("post_id", postId)
      .is("parent_id", null)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    throw error;
  }
}

export async function updateComment(commentId, content) {
  try {
    const user = await getUser();
    if (!user) throw new Error("Não autenticado");

    const { data, error } = await supabase
      .from("comments")
      .update({ content })
      .eq("id", commentId)
      .eq("author_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao atualizar comentário:", error);
    throw error;
  }
}

export async function deleteComment(commentId) {
  try {
    const user = await getUser();
    if (!user) throw new Error("Não autenticado");

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("author_id", user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Erro ao deletar comentário:", error);
    throw error;
  }
}

// Função de pesquisa global
export async function searchContent(query, options = {}) {
  try {
    const { type = "all", limit = 20 } = options;
    
    if (!query) return { posts: [], communities: [], users: [], events: [] };
    
    const searchTerm = `%${query}%`;
    
    const results = {};
    
    // Buscar posts
    if (type === "all" || type === "posts") {
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          author:author_id(id, display_name, avatar_url),
          community:community_id(id, name, slug)
        `)
        .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
        .limit(limit);
        
      if (postsError) throw postsError;
      results.posts = posts;
    }
    
    // Buscar comunidades
    if (type === "all" || type === "communities") {
      const { data: communities, error: communitiesError } = await supabase
        .from("communities")
        .select(`
          *,
          creator:created_by(id, display_name)
        `)
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(limit);
        
      if (communitiesError) throw communitiesError;
      results.communities = communities;
    }
    
    // Buscar usuários
    if (type === "all" || type === "users") {
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select(`*`)
        .or(`display_name.ilike.${searchTerm},username.ilike.${searchTerm}`)
        .limit(limit);
        
      if (usersError) throw usersError;
      results.users = users;
    }
    
    // Buscar eventos
    if (type === "all" || type === "events") {
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select(`
          *,
          creator:creator_id(id, display_name),
          community:community_id(id, name, slug)
        `)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm}`)
        .limit(limit);
        
      if (eventsError) throw eventsError;
      results.events = events;
    }
    
    return results;
  } catch (error) {
    console.error("Erro na pesquisa:", error);
    throw error;
  }
}
-- Ajustes no esquema do banco de dados

-- Atualizar tabela de perfis
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS karma INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_staff BOOLEAN DEFAULT FALSE;

-- Adicionar uniqueness ao username se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- Atualizar tabela de comunidades
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS rules TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID;

-- Adicionar referência para profiles se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'communities_created_by_fkey'
  ) THEN
    ALTER TABLE public.communities ADD CONSTRAINT communities_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id);
  END IF;
END $$;

-- Criar tabela de posts se não existir
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  community_id UUID REFERENCES communities(id) NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de comentários se não existir
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  post_id UUID REFERENCES posts(id) NOT NULL,
  parent_id UUID REFERENCES comments(id),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de eventos se não existir
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  community_id UUID REFERENCES communities(id) NOT NULL,
  creator_id UUID REFERENCES profiles(id) NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  event_link TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de participantes de eventos se não existir
CREATE TABLE IF NOT EXISTS public.event_participants (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'going', -- going, interested, declined
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

-- Verificar e adicionar o relacionamento entre conversation_participants e profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_conversation_participants_profiles'
  ) THEN
    ALTER TABLE public.conversation_participants 
      ADD CONSTRAINT fk_conversation_participants_profiles 
      FOREIGN KEY (user_id) 
      REFERENCES public.profiles(id);
  END IF;
END $$;

-- Habilitar RLS para novas tabelas
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Atualizar trigger de criação de perfil
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (NEW.id, split_part(NEW.email, '@', 1), split_part(NEW.email, '@', 1));
  
  -- Adicionar à comunidade geral (mantendo funcionalidade existente)
  INSERT INTO public.community_members (community_id, user_id)
  SELECT id, NEW.id
  FROM public.communities
  WHERE slug = 'ufrj-geral';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para eventos
DO $$ 
BEGIN
  -- Política de visualização
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'events' 
    AND policyname = 'Events are viewable by everyone'
  ) THEN
    CREATE POLICY "Events are viewable by everyone" ON public.events
      FOR SELECT TO public
      USING (true);
  END IF;

  -- Política de criação
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'events' 
    AND policyname = 'Authenticated users can create events'
  ) THEN
    CREATE POLICY "Authenticated users can create events" ON public.events
      FOR INSERT TO authenticated
      WITH CHECK (creator_id = auth.uid());
  END IF;

  -- Política de atualização
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'events' 
    AND policyname = 'Users can update own events'
  ) THEN
    CREATE POLICY "Users can update own events" ON public.events
      FOR UPDATE TO authenticated
      USING (creator_id = auth.uid());
  END IF;

  -- Política de exclusão
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'events' 
    AND policyname = 'Users can delete own events'
  ) THEN
    CREATE POLICY "Users can delete own events" ON public.events
      FOR DELETE TO authenticated
      USING (creator_id = auth.uid());
  END IF;
END $$;

-- Políticas para participantes de eventos
DO $$ 
BEGIN
  -- Política de visualização
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'event_participants' 
    AND policyname = 'Event participants are viewable by everyone'
  ) THEN
    CREATE POLICY "Event participants are viewable by everyone" ON public.event_participants
      FOR SELECT TO public
      USING (true);
  END IF;

  -- Política de participação
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'event_participants' 
    AND policyname = 'Users can join events'
  ) THEN
    CREATE POLICY "Users can join events" ON public.event_participants
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;

  -- Política de atualização
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'event_participants' 
    AND policyname = 'Users can update own participation'
  ) THEN
    CREATE POLICY "Users can update own participation" ON public.event_participants
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid());
  END IF;

  -- Política de exclusão
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'event_participants' 
    AND policyname = 'Users can leave events'
  ) THEN
    CREATE POLICY "Users can leave events" ON public.event_participants
      FOR DELETE TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Políticas para posts
DO $$ 
BEGIN
  -- Política de visualização
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'posts' 
    AND policyname = 'Posts are viewable by everyone'
  ) THEN
    CREATE POLICY "Posts are viewable by everyone" ON public.posts
      FOR SELECT TO public
      USING (true);
  END IF;

  -- Política de criação
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'posts' 
    AND policyname = 'Authenticated users can create posts'
  ) THEN
    CREATE POLICY "Authenticated users can create posts" ON public.posts
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = author_id);
  END IF;

  -- Política de atualização
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'posts' 
    AND policyname = 'Users can update own posts'
  ) THEN
    CREATE POLICY "Users can update own posts" ON public.posts
      FOR UPDATE TO authenticated
      USING (auth.uid() = author_id);
  END IF;

  -- Política de exclusão
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'posts' 
    AND policyname = 'Users can delete own posts'
  ) THEN
    CREATE POLICY "Users can delete own posts" ON public.posts
      FOR DELETE TO authenticated
      USING (auth.uid() = author_id);
  END IF;
END $$;

-- Políticas para comentários
DO $$ 
BEGIN
  -- Política de visualização
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comments' 
    AND policyname = 'Comments are viewable by everyone'
  ) THEN
    CREATE POLICY "Comments are viewable by everyone" ON public.comments
      FOR SELECT TO public
      USING (true);
  END IF;

  -- Política de criação
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comments' 
    AND policyname = 'Authenticated users can comment'
  ) THEN
    CREATE POLICY "Authenticated users can comment" ON public.comments
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = author_id);
  END IF;

  -- Política de atualização
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comments' 
    AND policyname = 'Users can update own comments'
  ) THEN
    CREATE POLICY "Users can update own comments" ON public.comments
      FOR UPDATE TO authenticated
      USING (auth.uid() = author_id);
  END IF;

  -- Política de exclusão
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comments' 
    AND policyname = 'Users can delete own comments'
  ) THEN
    CREATE POLICY "Users can delete own comments" ON public.comments
      FOR DELETE TO authenticated
      USING (auth.uid() = author_id);
  END IF;
END $$;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON public.posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_events_community_id ON public.events(community_id);
CREATE INDEX IF NOT EXISTS idx_events_creator_id ON public.events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);

-- Funções de contagem de membros da comunidade
CREATE OR REPLACE FUNCTION decrement_community_members(community_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.communities
  SET member_count = GREATEST(member_count - 1, 0)
  WHERE id = community_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_community_members(community_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.communities
  SET member_count = member_count + 1
  WHERE id = community_id;
END;
$$; 
-- Ajustes no esquema do banco de dados

-- Atualizar tabela de perfis
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS karma INTEGER DEFAULT 0;

-- Atualizar tabela de comunidades
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS rules TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

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

-- Habilitar RLS para novas tabelas
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

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

-- Políticas para perfis
DO $$ 
BEGIN
  -- Política de seleção
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'select_profiles'
  ) THEN
    CREATE POLICY "select_profiles" ON public.profiles
      FOR SELECT TO public
      USING (true);
  END IF;

  -- Política de inserção
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'insert_profiles'
  ) THEN
    CREATE POLICY "insert_profiles" ON public.profiles
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Política de atualização
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'update_profiles'
  ) THEN
    CREATE POLICY "update_profiles" ON public.profiles
      FOR UPDATE TO authenticated
      USING (auth.uid() = id);
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
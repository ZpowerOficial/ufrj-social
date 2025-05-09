-- Início da transação
BEGIN;

-- Verificar e adicionar a coluna is_official à tabela communities
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT FALSE;

-- Alteração da tabela profiles para adicionar campos
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS display_name text, 
  ADD COLUMN IF NOT EXISTS avatar_url text, 
  ADD COLUMN IF NOT EXISTS bio text, 
  ADD COLUMN IF NOT EXISTS curso text, 
  ADD COLUMN IF NOT EXISTS centro text, 
  ADD COLUMN IF NOT EXISTS periodo_ingresso text, 
  ADD COLUMN IF NOT EXISTS dre text, 
  ADD COLUMN IF NOT EXISTS lattes text, 
  ADD COLUMN IF NOT EXISTS github text, 
  ADD COLUMN IF NOT EXISTS linkedin text,
  ADD COLUMN IF NOT EXISTS is_staff BOOLEAN DEFAULT FALSE;

-- Criação de índices na tabela profiles
CREATE INDEX IF NOT EXISTS idx_profiles_curso ON public.profiles(curso); 
CREATE INDEX IF NOT EXISTS idx_profiles_centro ON public.profiles(centro); 
CREATE INDEX IF NOT EXISTS idx_profiles_dre ON public.profiles(dre);

-- Habilitar RLS e criar políticas para a tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; 
DROP POLICY IF EXISTS select_profiles ON public.profiles;
DROP POLICY IF EXISTS insert_profiles ON public.profiles;
DROP POLICY IF EXISTS update_profiles ON public.profiles;
CREATE POLICY select_profiles ON public.profiles FOR SELECT TO authenticated USING (true); 
CREATE POLICY insert_profiles ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id); 
CREATE POLICY update_profiles ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Verificar se a tabela communities existe, e se não existir, criar
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  banner_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  is_official BOOLEAN DEFAULT FALSE,
  category TEXT
);

-- Criar tabela de membros de comunidades
CREATE TABLE IF NOT EXISTS public.community_members (
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  role TEXT DEFAULT 'member',
  PRIMARY KEY (community_id, user_id)
);

-- Criar tabela de conversas
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  last_message TEXT
);

-- Criar tabela de participantes de conversas
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  PRIMARY KEY (conversation_id, user_id)
);

-- Adicionar relacionamento entre conversation_participants e profiles
ALTER TABLE public.conversation_participants 
  ADD CONSTRAINT fk_conversation_participants_profiles 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id);

-- Criar tabela de mensagens
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Habilitar RLS para todas as tabelas
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança (usando CREATE OR REPLACE POLICY)
-- Communities
DROP POLICY IF EXISTS "Communities are viewable by everyone" ON public.communities;
CREATE POLICY "Communities are viewable by everyone"
ON public.communities FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Communities can be created by authenticated users" ON public.communities;
CREATE POLICY "Communities can be created by authenticated users"
ON public.communities FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Communities can be updated by owners" ON public.communities;
CREATE POLICY "Communities can be updated by owners"
ON public.communities FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = id
    AND user_id = auth.uid()
    AND role = 'owner'
  )
);

-- Community members
DROP POLICY IF EXISTS "Community members are viewable by everyone" ON public.community_members;
CREATE POLICY "Community members are viewable by everyone"
ON public.community_members FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Users can join communities" ON public.community_members;
CREATE POLICY "Users can join communities"
ON public.community_members FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can leave communities" ON public.community_members;
CREATE POLICY "Users can leave communities"
ON public.community_members FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Conversations
DROP POLICY IF EXISTS "Users can view conversations they are part of" ON public.conversations;
CREATE POLICY "Users can view conversations they are part of"
ON public.conversations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = id
    AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update conversations they are part of" ON public.conversations;
CREATE POLICY "Users can update conversations they are part of"
ON public.conversations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = id
    AND user_id = auth.uid()
  )
);

-- Conversation participants
DROP POLICY IF EXISTS "Users can view conversation participants" ON public.conversation_participants;
CREATE POLICY "Users can view conversation participants"
ON public.conversation_participants FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conversation_participants.conversation_id
    AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can add participants to their conversations" ON public.conversation_participants;
CREATE POLICY "Users can add participants to their conversations"
ON public.conversation_participants FOR INSERT
TO authenticated
WITH CHECK (true);

-- Messages
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.messages;
CREATE POLICY "Users can view messages from their conversations"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id
    AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
CREATE POLICY "Users can send messages to their conversations"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id
    AND user_id = auth.uid()
  )
);

-- Funções e triggers
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

CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversation_timestamp ON public.messages;
CREATE TRIGGER update_conversation_timestamp
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Inserir comunidade geral da UFRJ
INSERT INTO public.communities (name, description, slug, is_official)
VALUES (
  'UFRJ Geral',
  'Comunidade oficial geral da UFRJ. Aqui você encontra notícias, eventos e discussões sobre a universidade.',
  'ufrj-geral',
  TRUE
) ON CONFLICT (slug) DO NOTHING;

-- Criar função para adicionar usuários à comunidade geral
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.community_members (community_id, user_id)
  SELECT id, NEW.id
  FROM public.communities
  WHERE slug = 'ufrj-geral';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para adicionar novos usuários à comunidade geral
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fim da transação
COMMIT;
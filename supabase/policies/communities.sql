-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Policies for communities table
CREATE POLICY "Communities are viewable by everyone"
ON public.communities FOR SELECT
TO public
USING (true);

CREATE POLICY "Communities can be created by authenticated users"
ON public.communities FOR INSERT
TO authenticated
WITH CHECK (true);

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

-- Policies for community_members table
CREATE POLICY "Community members are viewable by everyone"
ON public.community_members FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can join communities"
ON public.community_members FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave communities"
ON public.community_members FOR DELETE
TO authenticated
USING (user_id = auth.uid()); 
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
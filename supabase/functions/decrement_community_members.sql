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
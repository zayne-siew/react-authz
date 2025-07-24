drop function if exists public.allow (
  p_user varchar,
  p_relation varchar,
  p_object varchar
) cascade;

create or replace function public.allow (
  p_user varchar,
  p_relation varchar,
  p_object varchar
) returns boolean as $$
begin
  -- This function is a placeholder for permission checks.
  return p_user is not null;
end;
$$ language plpgsql;

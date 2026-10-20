CREATE OR REPLACE FUNCTION auth.register_user(p_email text, p_password_hash text, p_display_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO auth.users (email, encrypted_password)
  VALUES (lower(trim(p_email)), p_password_hash)
  RETURNING id INTO new_id;

  INSERT INTO public.profiles (id, display_name, preferred_locale)
  VALUES (new_id, NULLIF(trim(p_display_name), ''), 'en');

  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION auth.credentials_for_email(p_email text)
RETURNS TABLE (id uuid, encrypted_password text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth, public
AS $$
  SELECT id, encrypted_password
  FROM auth.users
  WHERE email = lower(trim(p_email))
$$;

CREATE OR REPLACE FUNCTION auth.create_session(p_user_id uuid, p_token_hash text, p_expires_at timestamptz)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth, public
AS $$
  INSERT INTO auth.sessions (user_id, token_hash, expires_at)
  VALUES (p_user_id, p_token_hash, p_expires_at)
$$;

CREATE OR REPLACE FUNCTION auth.user_for_session(p_token_hash text)
RETURNS TABLE (id uuid, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth, public
AS $$
  SELECT auth.users.id, auth.users.email
  FROM auth.sessions
  JOIN auth.users ON auth.users.id = auth.sessions.user_id
  WHERE auth.sessions.token_hash = p_token_hash
    AND auth.sessions.expires_at > now()
$$;

CREATE OR REPLACE FUNCTION auth.delete_session(p_token_hash text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth, public
AS $$
  DELETE FROM auth.sessions WHERE token_hash = p_token_hash
$$;

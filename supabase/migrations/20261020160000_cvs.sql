-- CV storage. Uses auth.uid(), which Supabase provides and local Postgres
-- defines in scripts/sql/001_local_auth.sql.

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  display_name text,
  preferred_locale text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cvs (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL,
  title text NOT NULL,
  document_json jsonb NOT NULL,
  schema_version integer NOT NULL,
  template_id text NOT NULL,
  revision integer NOT NULL DEFAULT 1,
  source_cv_id uuid REFERENCES public.cvs (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.cv_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id uuid NOT NULL REFERENCES public.cvs (id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  revision integer NOT NULL,
  document_snapshot jsonb NOT NULL,
  change_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cv_id, revision)
);

CREATE TABLE IF NOT EXISTS public.usage_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  feature text NOT NULL,
  provider text,
  quantity numeric NOT NULL,
  unit text NOT NULL,
  estimated_cost numeric,
  request_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.private_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  storage_key text NOT NULL,
  file_type text NOT NULL,
  size_bytes integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cvs_owner_updated_idx
  ON public.cvs (owner_id, updated_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS cv_versions_cv_revision_idx
  ON public.cv_versions (cv_id, revision);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cvs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.cv_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_versions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.usage_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_ledger FORCE ROW LEVEL SECURITY;
ALTER TABLE public.private_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_uploads FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_own ON public.profiles;
CREATE POLICY profiles_own ON public.profiles
  FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS cvs_select ON public.cvs;
CREATE POLICY cvs_select ON public.cvs
  FOR SELECT
  USING (owner_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS cvs_insert ON public.cvs;
CREATE POLICY cvs_insert ON public.cvs
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS cvs_update ON public.cvs;
CREATE POLICY cvs_update ON public.cvs
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS cvs_delete ON public.cvs;
CREATE POLICY cvs_delete ON public.cvs
  FOR DELETE
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS cv_versions_own ON public.cv_versions;
CREATE POLICY cv_versions_own ON public.cv_versions
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.cvs
      WHERE cvs.id = cv_versions.cv_id
        AND cvs.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS usage_own ON public.usage_ledger;
CREATE POLICY usage_own ON public.usage_ledger
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS uploads_own ON public.private_uploads;
CREATE POLICY uploads_own ON public.private_uploads
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

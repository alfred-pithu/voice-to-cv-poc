GRANT USAGE ON SCHEMA auth, public TO voxcv_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO voxcv_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cvs TO voxcv_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cv_versions TO voxcv_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usage_ledger TO voxcv_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.private_uploads TO voxcv_app;

REVOKE ALL ON FUNCTION auth.uid() FROM PUBLIC;
REVOKE ALL ON FUNCTION auth.register_user(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION auth.credentials_for_email(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION auth.create_session(uuid, text, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION auth.user_for_session(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION auth.delete_session(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION auth.uid() TO voxcv_app;
GRANT EXECUTE ON FUNCTION auth.register_user(text, text, text) TO voxcv_app;
GRANT EXECUTE ON FUNCTION auth.credentials_for_email(text) TO voxcv_app;
GRANT EXECUTE ON FUNCTION auth.create_session(uuid, text, timestamptz) TO voxcv_app;
GRANT EXECUTE ON FUNCTION auth.user_for_session(text) TO voxcv_app;
GRANT EXECUTE ON FUNCTION auth.delete_session(text) TO voxcv_app;

REVOKE ALL ON auth.users FROM voxcv_app;
REVOKE ALL ON auth.sessions FROM voxcv_app;

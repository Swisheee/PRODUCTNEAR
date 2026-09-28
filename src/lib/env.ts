export const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const oauthProviders = (process.env.NEXT_PUBLIC_OAUTH_PROVIDERS || '')
  .split(',')
  .filter((p): p is 'kakao' | 'google' | 'apple' => ['kakao', 'google', 'apple'].includes(p));

import 'server-only';
import { configured } from './env';
import { createClient } from './supabase/server';
import { demoClubs, demoGears, demoProducts, demoProfiles } from './demo';
import type {
  Club,
  Gear,
  Product,
  Profile,
  Member,
  Question,
  Answer,
  Offer,
  Notice,
} from './types';
export async function session() {
  if (!configured) return null;
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  return user;
}
function check<T>(data: unknown, error: { message: string } | null): T {
  if (error)
    throw new Error('데이터를 불러오지 못했어요. 연결과 데이터베이스 설정을 확인해주세요.');
  return data as T;
}
export async function clubs(): Promise<Club[]> {
  if (!configured) return demoClubs;
  const db = await createClient();
  const { data, error } = await db
    .from('clubs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(60);
  return check(data, error);
}
export async function products(query = ''): Promise<Product[]> {
  if (!configured)
    return demoProducts.filter((p) =>
      (p.brand + ' ' + p.name + ' ' + p.category).toLowerCase().includes(query.toLowerCase()),
    );
  const db = await createClient();
  let q = db.from('products').select('*').order('created_at', { ascending: false }).limit(60);
  if (query) q = q.ilike('name', `%${query.replace(/[%_]/g, '')}%`);
  const { data, error } = await q;
  return check(data, error);
}
export async function product(id: string): Promise<Product | null> {
  if (!configured) return demoProducts.find((p) => p.id === id) || null;
  const db = await createClient();
  const { data, error } = await db.from('products').select('*').eq('id', id).maybeSingle();
  return check(data, error);
}
export async function profile(id: string): Promise<Profile | null> {
  if (!configured) return demoProfiles.find((p) => p.id === id) || null;
  const db = await createClient();
  const { data, error } = await db.from('profiles').select('*').eq('id', id).maybeSingle();
  return check(data, error);
}
export async function people(query: string): Promise<Profile[]> {
  if (!configured) return demoProfiles.filter((p) => p.nickname.includes(query));
  const db = await createClient();
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .ilike('nickname', `%${query.replace(/[%_]/g, '')}%`)
    .limit(30);
  return check(data, error);
}
export async function gears(
  filter: { product_id?: string; club_id?: string; user_id?: string; id?: string } = {},
): Promise<Gear[]> {
  if (!configured)
    return demoGears.filter((g) =>
      Object.entries(filter).every(([k, v]) => g[k as keyof Gear] === v),
    );
  const db = await createClient();
  let q = db
    .from('user_gears')
    .select('*, profiles(*), products(*), clubs(*)')
    .order('created_at', { ascending: false })
    .limit(100);
  for (const [k, v] of Object.entries(filter)) q = q.eq(k, v);
  const { data, error } = await q;
  return check(data, error);
}
export async function club(id: string): Promise<Club | null> {
  if (!configured) return demoClubs.find((c) => c.id === id) || null;
  const db = await createClient();
  const { data, error } = await db.from('clubs').select('*').eq('id', id).maybeSingle();
  return check(data, error);
}
export async function members(id: string): Promise<Member[]> {
  if (!configured)
    return demoGears
      .filter((g) => g.club_id === id)
      .map((g) => ({
        user_id: g.user_id,
        club_id: id,
        role: 'member',
        status: 'active',
        profiles: g.profiles,
      }));
  const db = await createClient();
  const { data, error } = await db.from('club_members').select('*,profiles(*)').eq('club_id', id);
  return check(data, error);
}
export async function myMemberships(userId: string): Promise<Member[]> {
  if (!configured) return [];
  const db = await createClient();
  const { data, error } = await db
    .from('club_members')
    .select('*,profiles(*)')
    .eq('user_id', userId)
    .eq('status', 'active');
  return check(data, error);
}
export async function questions(productId: string): Promise<Question[]> {
  if (!configured) return [];
  const db = await createClient();
  const { data, error } = await db
    .from('questions')
    .select('*,profiles!questions_author_id_fkey(*)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  return check(data, error);
}
export async function question(id: string): Promise<Question | null> {
  if (!configured) return null;
  const db = await createClient();
  const { data, error } = await db
    .from('questions')
    .select('*,profiles!questions_author_id_fkey(*)')
    .eq('id', id)
    .maybeSingle();
  return check(data, error);
}
export async function answers(id: string): Promise<Answer[]> {
  if (!configured) return [];
  const db = await createClient();
  const { data, error } = await db
    .from('answers')
    .select('*,profiles(*)')
    .eq('question_id', id)
    .order('created_at');
  return check(data, error);
}
export async function offers(productId: string): Promise<Offer[]> {
  if (!configured) return [];
  const db = await createClient();
  const { data, error } = await db
    .from('offers')
    .select('*,merchants(*)')
    .eq('product_id', productId)
    .order('price', { nullsFirst: false });
  return check<Offer[]>(data, error)
    .filter((o) => o.merchants.status === 'active')
    .sort(
      (a, b) =>
        (a.price === null ? Infinity : a.price + (a.shipping_fee || 0)) -
        (b.price === null ? Infinity : b.price + (b.shipping_fee || 0)),
    );
}
export async function notices(): Promise<Notice[]> {
  if (!configured) return [];
  const db = await createClient();
  const { data, error } = await db
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  return check(data, error);
}
export async function images(gearId: string): Promise<string[]> {
  if (!configured) return [];
  const db = await createClient();
  const { data, error } = await db.from('gear_images').select('path').eq('gear_id', gearId);
  if (error) throw new Error('사진을 불러오지 못했어요.');
  const signed = await Promise.all(
    (data || []).map(async (i) => {
      const { data } = await db.storage.from('gear-images').createSignedUrl(i.path, 60);
      return data?.signedUrl || '';
    }),
  );
  return signed.filter(Boolean);
}
export async function staff(): Promise<boolean> {
  const u = await session();
  if (!u) return false;
  const db = await createClient();
  const { data } = await db.from('staff').select('user_id').eq('user_id', u.id).maybeSingle();
  return Boolean(data);
}

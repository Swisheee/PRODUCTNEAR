'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from './supabase/server';
import { configured, oauthProviders, siteUrl } from './env';
import {
  clubSchema,
  optionalUuid,
  publicHttpsUrl,
  required,
  safeNext,
  text,
  uuid,
} from './validation';
export type ActionState = { error?: string; success?: string; url?: string };
function must(result: { error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message);
}
export async function mutate(_state: ActionState, form: FormData): Promise<ActionState> {
  let destination = '';
  try {
    if (!configured)
      return { error: '현재는 읽기 전용 데모입니다. Supabase 연결 후 실제로 사용할 수 있어요.' };
    const db = await createClient();
    const kind = String(form.get('kind') || '');
    const values = Object.fromEntries(form.entries());
    const next = safeNext(form.get('next'));
    if (kind === 'signin' || kind === 'signup') {
      const credentials = z
        .object({
          email: z.email('이메일 주소를 확인해주세요.'),
          password: z.string().min(8, '비밀번호는 8자 이상 입력해주세요.').max(128),
        })
        .parse(values);
      if (kind === 'signup') {
        const { data, error } = await db.auth.signUp({
          ...credentials,
          options: {
            emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent('/onboarding?next=' + encodeURIComponent(next))}`,
          },
        });
        must({ error });
        if (!data.session)
          return { success: '가입 확인 메일을 보냈어요. 이메일의 링크로 가입을 완료해주세요.' };
        destination = '/onboarding?next=' + encodeURIComponent(next);
      } else {
        must(await db.auth.signInWithPassword(credentials));
        destination = next;
      }
    } else if (kind === 'oauth') {
      const provider = z.enum(['kakao', 'google', 'apple']).parse(form.get('provider'));
      if (!oauthProviders.includes(provider))
        return { error: '아직 연결되지 않은 로그인 방식이에요.' };
      const { data, error } = await db.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent('/onboarding?next=' + encodeURIComponent(next))}`,
        },
      });
      must({ error });
      destination = data.url || '/login';
    } else {
      const {
        data: { user },
      } = await db.auth.getUser();
      if (!user) return { error: '로그인 후 이용해주세요.' };
      if (kind === 'logout') {
        must(await db.auth.signOut());
        destination = '/';
      } else {
        const limit = await db.rpc('consume_rate_limit', { p_action: 'write', p_limit: 30 });
        must(limit);
        if (!limit.data) return { error: '요청이 많아요. 1분 뒤 다시 시도해주세요.' };
        switch (kind) {
          case 'profile': {
            const v = z
              .object({
                nickname: required(40),
                main_sport: required(40),
                region: text(80),
                experience_level: text(80),
              })
              .parse(values);
            must(
              await db
                .from('profiles')
                .update({ ...v, sports: [v.main_sport], onboarding_completed: true })
                .eq('id', user.id),
            );
            destination = next === '/' ? '/me' : next;
            break;
          }
          case 'club': {
            const v = clubSchema.parse(values);
            const result = await db.rpc('create_club', {
              p_name: v.name,
              p_sport: v.sport,
              p_region: v.region,
              p_description: v.description,
              p_visibility: v.visibility,
              p_join_policy: v.join_policy,
            });
            must(result);
            destination = `/clubs/${result.data}`;
            break;
          }
          case 'join': {
            const id = uuid.parse(form.get('club_id'));
            const result = await db.rpc('join_club', { p_club_id: id });
            must(result);
            revalidatePath('/');
            return {
              success:
                result.data === 'pending'
                  ? '가입 신청을 보냈어요. 운영진 승인을 기다려주세요.'
                  : '동호회에 가입했어요.',
            };
          }
          case 'accept_invite': {
            const token = z
              .string()
              .regex(/^[a-f0-9]{32}$/)
              .parse(form.get('token'));
            const result = await db.rpc('accept_invite', { p_token: token });
            must(result);
            destination = `/clubs/${result.data}`;
            break;
          }
          case 'invite': {
            const id = uuid.parse(form.get('club_id'));
            const { data, error } = await db
              .from('club_invites')
              .insert({ club_id: id, created_by: user.id })
              .select('token')
              .single();
            must({ error });
            return {
              success: '7일 동안 사용할 수 있는 초대 링크를 만들었어요.',
              url: `${siteUrl}/join/${data!.token}`,
            };
          }
          case 'approve': {
            const clubId = uuid.parse(form.get('club_id'));
            must(
              await db.rpc('approve_member', {
                p_club_id: clubId,
                p_user_id: uuid.parse(form.get('user_id')),
              }),
            );
            revalidatePath(`/clubs/${clubId}`);
            return { success: '가입을 승인했어요.' };
          }
          case 'gear': {
            const v = z
              .object({
                product_id: optionalUuid,
                club_id: optionalUuid,
                brand: text(80),
                name: text(160),
                category: text(60),
                size: text(40),
                color: text(40),
                usage_frequency: required(80),
                usage_context: text(300),
                review_text: text(4000),
                pros: text(1000),
                cons: text(1000),
                recommend_for: text(1000),
                visibility: z.enum(['public', 'club', 'private']),
                buy_again: z.enum(['yes', 'no', 'unknown']),
                usage_start_date: z.union([z.iso.date(), z.literal('')]),
                purchase_url: text(2000),
              })
              .parse(values);
            if (v.visibility === 'club' && !v.club_id)
              return { error: '공유할 동호회를 선택해주세요.' };
            if (v.usage_start_date && v.usage_start_date > new Date().toISOString().slice(0, 10))
              return { error: '사용 시작일은 오늘 이전으로 입력해주세요.' };
            const purchase_url = v.purchase_url ? publicHttpsUrl(v.purchase_url) : null;
            let productId = v.product_id;
            if (!productId) {
              const result = await db.rpc('register_product', {
                p_brand: required(80).parse(v.brand),
                p_name: required(160, 2).parse(v.name),
                p_category: required(60).parse(v.category),
              });
              must(result);
              productId = result.data;
            }
            const { brand, name, category, ...gear } = v;
            void brand;
            void name;
            void category;
            const { data, error } = await db
              .from('user_gears')
              .insert({
                ...gear,
                user_id: user.id,
                product_id: productId,
                purchase_url,
                usage_start_date: v.usage_start_date || null,
                buy_again: v.buy_again === 'unknown' ? null : v.buy_again === 'yes',
              })
              .select('id')
              .single();
            must({ error });
            destination = `/gears/${data!.id}`;
            break;
          }
          case 'gear_visibility': {
            const id = uuid.parse(form.get('gear_id'));
            const visibility = z.enum(['public', 'club', 'private']).parse(form.get('visibility'));
            must(
              await db
                .from('user_gears')
                .update({ visibility })
                .eq('id', id)
                .eq('user_id', user.id),
            );
            revalidatePath('/');
            return { success: '공개 범위를 변경했어요.' };
          }
          case 'gear_delete': {
            must(
              await db
                .from('user_gears')
                .delete()
                .eq('id', uuid.parse(form.get('gear_id')))
                .eq('user_id', user.id),
            );
            destination = '/me';
            break;
          }
          case 'question': {
            const v = z
              .object({
                product_id: uuid,
                target_user_id: optionalUuid,
                club_id: optionalUuid,
                question: required(2000, 5),
              })
              .parse(values);
            const { data, error } = await db
              .from('questions')
              .insert({ ...v, author_id: user.id })
              .select('id')
              .single();
            must({ error });
            destination = `/questions/${data!.id}`;
            break;
          }
          case 'answer': {
            const v = z.object({ question_id: uuid, answer: required(4000, 2) }).parse(values);
            must(await db.from('answers').insert({ ...v, author_id: user.id }));
            revalidatePath(`/questions/${v.question_id}`);
            return { success: '답변을 남겼어요.' };
          }
          case 'read': {
            must(
              await db
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .eq('user_id', user.id)
                .is('read_at', null),
            );
            revalidatePath('/notifications');
            return { success: '모두 읽음으로 표시했어요.' };
          }
          case 'upload': {
            const id = uuid.parse(form.get('gear_id'));
            const file = form.get('image');
            if (!(file instanceof File) || file.size === 0 || file.size > 4 * 1024 * 1024)
              return { error: '4MB 이하의 사진을 선택해주세요.' };
            const bytes = new Uint8Array(await file.arrayBuffer());
            const actual =
              bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
                ? 'image/jpeg'
                : bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71
                  ? 'image/png'
                  : String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
                      String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
                    ? 'image/webp'
                    : null;
            if (!actual || actual !== file.type)
              return { error: 'JPG, PNG, WebP 사진만 업로드할 수 있어요.' };
            const path = `${user.id}/${id}/${crypto.randomUUID()}.${actual.split('/')[1]}`;
            must(
              await db.storage
                .from('gear-images')
                .upload(path, bytes, { contentType: actual, upsert: false }),
            );
            const result = await db.from('gear_images').insert({ gear_id: id, path });
            if (result.error) {
              await db.storage.from('gear-images').remove([path]);
              must(result);
            }
            revalidatePath(`/gears/${id}`);
            return { success: '사진을 올렸어요.' };
          }
          case 'merge': {
            must(
              await db.rpc('merge_products', {
                p_source: uuid.parse(form.get('source')),
                p_target: uuid.parse(form.get('target')),
              }),
            );
            revalidatePath('/');
            return { success: '제품과 연결된 장비·판매처를 병합했어요.' };
          }
          case 'report': {
            must(
              await db
                .from('reports')
                .insert({
                  author_id: user.id,
                  gear_id: uuid.parse(form.get('gear_id')),
                  reason: required(1000, 5).parse(form.get('reason')),
                }),
            );
            return { success: '신고를 접수했어요.' };
          }
          default:
            return { error: '지원하지 않는 요청입니다.' };
        }
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) return { error: error.issues[0].message };
    const message = error instanceof Error ? error.message : '';
    if (message.includes('Invalid login credentials'))
      return { error: '이메일 또는 비밀번호를 확인해주세요.' };
    if (message.includes('row-level security') || message.includes('permission denied'))
      return { error: '이 작업을 수행할 권한이 없어요.' };
    if (message.includes('Email not confirmed'))
      return { error: '가입 확인 이메일의 링크를 먼저 눌러주세요.' };
    return {
      error: /[가-힣]/.test(message)
        ? message
        : '처리하지 못했어요. 입력 내용과 연결 상태를 확인하고 다시 시도해주세요.',
    };
  }
  revalidatePath('/', 'layout');
  if (destination) redirect(destination);
  return { success: '저장했어요.' };
}

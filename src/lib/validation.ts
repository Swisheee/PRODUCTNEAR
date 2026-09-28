import { z } from 'zod';
export const text = (max = 2000) => z.string().trim().max(max, '입력 내용이 너무 길어요.');
export const required = (max = 2000, min = 1) =>
  text(max).min(min, `최소 ${min}자 이상 입력해주세요.`);
export const uuid = z.uuid('올바른 항목을 선택해주세요.');
export const optionalUuid = z.union([uuid, z.literal('')]).transform((v) => v || null);
export const sports = ['농구', '러닝', '테니스', '피클볼', '자전거', '등산', '기타'];
export function safeNext(value: unknown, fallback = '/') {
  return typeof value === 'string' && /^\/(?!\/)/.test(value) && !/[\\\r\n]/.test(value)
    ? value
    : fallback;
}
export function publicHttpsUrl(raw: string): string {
  const url = new URL(raw);
  const host = url.hostname.toLowerCase();
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    !host.includes('.') ||
    /^[\d.]+$/.test(host) ||
    host.includes(':') ||
    host.includes('[')
  )
    throw new Error('공개 쇼핑몰의 HTTPS 주소를 입력해주세요.');
  return url.toString();
}
export const clubSchema = z
  .object({
    name: required(80, 2),
    sport: required(40),
    region: text(80),
    description: text(2000),
    visibility: z.enum(['public', 'private']),
    join_policy: z.enum(['open', 'approval', 'invite']),
  })
  .refine((v) => v.visibility !== 'private' || v.join_policy !== 'open', {
    message: '비공개 동호회는 승인 또는 초대 방식으로 가입할 수 있어요.',
  });

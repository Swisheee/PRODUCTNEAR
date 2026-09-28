import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { configured } from '@/lib/env';
import { publicHttpsUrl, uuid } from '@/lib/validation';
import { registry } from '@/lib/commerce';
export async function GET(request: Request, { params }: { params: Promise<{ offerId: string }> }) {
  if (!configured)
    return new Response('Supabase 연결 후 구매처 이동을 사용할 수 있어요.', { status: 503 });
  const { offerId } = await params;
  if (!uuid.safeParse(offerId).success)
    return new Response('판매처를 찾을 수 없어요.', { status: 404 });
  // Link prefetching must not manufacture purchase clicks.
  if (
    request.headers.get('purpose') === 'prefetch' ||
    request.headers.get('sec-purpose')?.includes('prefetch')
  )
    return new Response(null, { status: 204 });
  const db = await createClient();
  const { data: offer, error } = await db
    .from('offers')
    .select('*,merchants(*)')
    .eq('id', offerId)
    .maybeSingle();
  if (error || !offer || offer.merchants.status !== 'active')
    return new Response('판매처를 찾을 수 없어요.', { status: 404 });
  try {
    const original = publicHttpsUrl(offer.product_url);
    const affiliate =
      offer.merchants.affiliate_enabled && offer.affiliate_url
        ? publicHttpsUrl(offer.affiliate_url)
        : null;
    const { data: clickId, error: trackError } = await db.rpc('track_outbound', {
      p_offer_id: offerId,
    });
    if (trackError)
      return new Response('이동을 기록하지 못했어요. 잠시 후 다시 시도해주세요.', { status: 503 });
    const result = await registry()
      .resolve(original)
      .createAffiliateLink?.(original, { clickId, productId: offer.product_id });
    const response = NextResponse.redirect(affiliate || result?.url || original, 302);
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Referrer-Policy', 'no-referrer');
    return response;
  } catch {
    return new Response('유효하지 않은 구매처 주소예요.', { status: 400 });
  }
}

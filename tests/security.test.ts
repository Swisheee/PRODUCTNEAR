import { describe, it, expect } from 'vitest';
import { clubSchema, publicHttpsUrl, safeNext } from '../src/lib/validation';
import {
  CommerceProviderRegistry,
  CoupangProvider,
  GenericUrlProvider,
  LinkPriceProvider,
  DirectMerchantProvider,
} from '../src/lib/commerce';
describe('untrusted URLs', () => {
  it.each([
    'http://shop.example/a',
    'https://localhost/a',
    'https://127.0.0.1',
    'https://2130706433',
    'https://0x7f000001',
    'https://[::1]/',
    'https://host.local',
    'https://host.internal',
    'https://user:password@shop.example',
    'https://shop.example:8080/',
    'javascript:alert(1)',
  ])('rejects %s', (url) => expect(() => publicHttpsUrl(url)).toThrow());
  it('preserves valid merchant query strings', () =>
    expect(publicHttpsUrl('https://www.nike.com/kr/t/shoe?size=285')).toBe(
      'https://www.nike.com/kr/t/shoe?size=285',
    ));
  it.each(['//evil.example', '/\\evil.example', 'https://evil.example', '/\n/evil'])(
    'blocks external auth return target %s',
    (url) => expect(safeNext(url)).toBe('/'),
  );
  it('keeps invite intent across login', () =>
    expect(safeNext('/join/abc?next=1')).toBe('/join/abc?next=1'));
  it('does not allow an open private club', () =>
    expect(
      clubSchema.safeParse({
        name: 'Private',
        sport: '농구',
        region: '',
        description: '',
        visibility: 'private',
        join_policy: 'open',
      }).success,
    ).toBe(false));
});
describe('provider fallback', () => {
  it('falls back to original URLs without credentials', async () => {
    const p = new CoupangProvider();
    expect(p.status).toBe('NOT_CONFIGURED');
    expect(await p.createAffiliateLink('https://www.coupang.com/vp/products/123')).toEqual({
      url: 'https://www.coupang.com/vp/products/123',
      affiliate: false,
      reason: 'NOT_CONFIGURED',
    });
  });
  it('never represents credentials as a successful integration', () => {
    expect(new CoupangProvider(true).status).toBe('NOT_IMPLEMENTED');
    expect(new LinkPriceProvider(true).status).toBe('NOT_IMPLEMENTED');
  });
  it('checks full merchant hostname', () => {
    const r = new CommerceProviderRegistry()
      .register(new CoupangProvider())
      .register(new GenericUrlProvider());
    expect(r.resolve('https://coupang.com.evil.example').id).toBe('generic');
    expect(r.resolve('https://www.coupang.com/a').id).toBe('coupang');
  });
  it('does not fetch arbitrary metadata', async () =>
    expect(
      await new GenericUrlProvider().resolveProductUrl('https://shop.example/product'),
    ).toEqual({
      url: 'https://shop.example/product',
      domain: 'shop.example',
      status: 'manual_confirmation_required',
    }));
  it('adds direct contract tracking only to the exact merchant', async () => {
    const p = new DirectMerchantProvider({
      domain: 'shop.example',
      parameter: 'ssubon_click',
      merchantId: 'a',
    });
    expect(
      (
        await p.createAffiliateLink('https://shop.example/item', {
          clickId: 'click-1',
          productId: 'p',
        })
      ).url,
    ).toBe('https://shop.example/item?ssubon_click=click-1');
    expect(
      (
        await p.createAffiliateLink('https://other.example/item', {
          clickId: 'click-1',
          productId: 'p',
        })
      ).affiliate,
    ).toBe(false);
  });
});
